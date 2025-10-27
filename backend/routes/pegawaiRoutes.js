// ===== routes/pegawaiRoutes.js =====
const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const jobrecController = require('../controllers/jobrecController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route pegawai memerlukan autentikasi
router.use(authMiddleware);

// GET /api/pegawai - Get all pegawai with optional filters
router.get('/', pegawaiController.getAllPegawai);
router.get('/talents', pegawaiController.getAllPegawaiWithScores);

// GET /api/pegawai/:nip - Get pegawai detail by NIP
router.get('/:nip', pegawaiController.getPegawaiByNip);

// Rute untuk mendapatkan rekomendasi jabatan dari AI
router.get('/:nip/rekomendasi', jobrecController.getJobRecommendations);


module.exports = router;