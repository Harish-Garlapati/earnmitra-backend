const express = require('express');
const router = express.Router();
const { checkHealth } = require('../config/db');

// GET /api/health
router.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'earnmitra-backend'
  });
});

// GET /api/health/db
router.get('/db', async (req, res) => {
  const result = await checkHealth();
  if (result.ok) {
    return res.json({
      ok: true,
      service: 'earnmitra-backend',
      database: 'connected',
      version: result.version
    });
  } else {
    return res.status(503).json({
      ok: false,
      service: 'earnmitra-backend',
      database: 'disconnected',
      error: result.error
    });
  }
});

module.exports = router;
