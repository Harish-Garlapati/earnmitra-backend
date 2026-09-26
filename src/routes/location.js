const express = require('express');
const router = express.Router();

const pincodeCache = new Map();

/**
 * GET /api/location/pincode/:pincode
 * Resolves 6-digit Indian PIN Code to Place, District, and State.
 */
router.get('/pincode/:pincode', async (req, res, next) => {
  try {
    const rawPincode = String(req.params.pincode || '').trim();
    if (!/^\d{6}$/.test(rawPincode)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit PIN code'
      });
    }

    if (pincodeCache.has(rawPincode)) {
      return res.json(pincodeCache.get(rawPincode));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const resp = await fetch(`https://api.postalpincode.in/pincode/${rawPincode}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        return res.status(502).json({
          success: false,
          error: 'Postal service is temporarily unavailable'
        });
      }

      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0 || data[0].Status !== 'Success' || !Array.isArray(data[0].PostOffice) || data[0].PostOffice.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PIN code not found. Please check and try again.'
        });
      }

      const offices = data[0].PostOffice;
      // Deterministic canonical office selection rule:
      // 1. Head Post Office with Delivery status (Tier-1 hub)
      // 2. Sub Post Office with Delivery status (Mandal / Taluk delivery hub, e.g. Parchur for 523169)
      // 3. Any office with Delivery status
      // 4. Fallback to first returned office
      const bestOffice = offices.find(o => o.BranchType === 'Head Post Office' && o.DeliveryStatus === 'Delivery') ||
                         offices.find(o => o.BranchType === 'Sub Post Office' && o.DeliveryStatus === 'Delivery') ||
                         offices.find(o => o.DeliveryStatus === 'Delivery') ||
                         offices[0];

      const place = (bestOffice.Name || '').trim();
      const district = (bestOffice.District || '').trim();
      const state = (bestOffice.State || '').trim();

      const allOfficesList = offices.map(o => (o.Name || '').trim()).filter(Boolean);
      const result = {
        success: true,
        pincode: rawPincode,
        place: place || district,
        district,
        state,
        places: allOfficesList,
        allOffices: allOfficesList
      };

      pincodeCache.set(rawPincode, result);
      return res.json(result);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          error: 'PIN code lookup timed out. Please try again.'
        });
      }
      console.error('[LOCATION PINCODE ERROR]', fetchErr);
      return res.status(502).json({
        success: false,
        error: 'Unable to fetch location. Please try again.'
      });
    }
  } catch (err) {
    console.error('[LOCATION ROUTE ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch location. Please try again.'
    });
  }
});

module.exports = router;
