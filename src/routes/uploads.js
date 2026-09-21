const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { optionalAuth } = require('../middleware/authMiddleware');

const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const KYC_DIR = path.join(UPLOAD_BASE, 'kyc');
const LEADS_DIR = path.join(UPLOAD_BASE, 'leads');

[UPLOAD_BASE, KYC_DIR, LEADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isKyc = req.path.includes('kyc');
    cb(null, isKyc ? KYC_DIR : LEADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, PNG and WEBP files are allowed (max 5MB)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

// POST /api/uploads/kyc — upload partner KYC document
router.post('/kyc', optionalAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const partnerId = req.user ? req.user.partnerId : 1;
    const docType = req.body.docType || 'id_proof';

    const [result] = await query(
      `INSERT INTO kyc_documents (partner_id, doc_type, file_path, original_filename, mime_type, file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
      [
        partnerId,
        docType,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
      docType,
      fileName: req.file.originalname,
      size: req.file.size,
      status: 'uploaded',
      message: 'Document uploaded successfully'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/uploads/lead/:leadId — upload lead supporting document
router.post('/lead/:leadId', optionalAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const leadId = req.params.leadId;
    const docType = req.body.documentType || req.body.docType || 'supporting_doc';

    const [result] = await query(
      `INSERT INTO lead_documents (lead_id, document_type, original_file_name, stored_file_name, storage_path, mime_type, file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'uploaded')`,
      [
        leadId,
        docType,
        req.file.originalname,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
        req.file.size
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
      leadId,
      docType,
      fileName: req.file.originalname,
      status: 'uploaded'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
