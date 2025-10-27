// ===== routes/instansiRoutes.js =====
const express = require('express');
const router = express.Router();
const instansiController = require('../controllers/instansiController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route instansi memerlukan autentikasi
router.use(authMiddleware);

// GET /api/instansi - Get all instansi with optional filters
router.get('/', instansiController.getAllInstansi);

// GET /api/instansi/:id - Get instansi detail by ID
router.get('/:id', instansiController.getInstansiById);

module.exports = router;