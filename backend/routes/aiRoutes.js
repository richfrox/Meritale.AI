// ===== routes/aiRouter.js =====
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Route POST untuk mengirim pesan chat. Frontend memanggil POST /api/ai/chat
router.post('/chat', aiController.handleChat);

module.exports = router;