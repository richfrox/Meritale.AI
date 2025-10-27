// ===== controllers/dashboardController.js =====
const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total pegawai
    const pegawaiCount = await pool.query('SELECT COUNT(*) FROM pegawai');
    
    // Total instansi
    const instansiCount = await pool.query('SELECT COUNT(*) FROM instansi');
    
    // Rata-rata kinerja
    const avgKinerja = await pool.query('SELECT AVG(nilai_kinerja) as avg FROM pegawai_kinerjakompetensipotensi');
    
    // Total penghargaan
    const penghargaanCount = await pool.query('SELECT COUNT(*) FROM pegawai_penghargaan');
    
    // Distribusi gender
    const genderDist = await pool.query(`
      SELECT gender, COUNT(*) as count
      FROM pegawai
      GROUP BY gender
    `);

    // Distribusi jabatan
    const jabatanDist = await pool.query(`
      SELECT j.jabatan, COUNT(p.nip) as count
      FROM jabatan j
      LEFT JOIN pegawai p ON j.id = p.id_jabatan
      GROUP BY j.jabatan
    `);

    // Pegawai per instansi
    const instansiDist = await pool.query(`
      SELECT i.instansi, COUNT(p.nip) as count
      FROM instansi i
      LEFT JOIN instansi_uker iu ON i.id = iu.id_instansi
      LEFT JOIN pegawai p ON iu.id = p.id_instansi
      GROUP BY i.instansi
      ORDER BY count DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        totalPegawai: parseInt(pegawaiCount.rows[0].count),
        totalInstansi: parseInt(instansiCount.rows[0].count),
        avgKinerja: parseFloat(avgKinerja.rows[0].avg || 0).toFixed(1),
        totalPenghargaan: parseInt(penghargaanCount.rows[0].count),
        genderDistribution: genderDist.rows,
        jabatanDistribution: jabatanDist.rows,
        instansiDistribution: instansiDist.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};