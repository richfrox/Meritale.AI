// ===== controllers/authController.js =====
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const userQuery = await pool.query(
      'SELECT * FROM "users" WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = userQuery.rows[0];

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, instansi_id: user.instansi_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        instansi_id: user.instansi_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, instansi_id} = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const newUser = await pool.query(
      'INSERT INTO "user" (email, password, role, instansi_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role, instansi_id',
      [email, hashedPassword, role, instansi_id]
    );

    res.status(201).json({
      success: true,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};