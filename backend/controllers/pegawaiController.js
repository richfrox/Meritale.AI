// ===== controllers/pegawaiController.js =====
const pool = require('../config/database');

exports.getAllPegawai = async (req, res) => {
  try {
    const { search, instansi } = req.query;
    
    let query = `
      SELECT 
        p.*,
        j.jabatan,
        i.instansi,
        iu.uker
      FROM pegawai p
      LEFT JOIN jabatan j ON p.id_jabatan = j.id
      LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id_instansi
      LEFT JOIN instansi i ON iu.id_instansi = i.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (p.nama ILIKE $${paramCount} OR p.nip ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (instansi && instansi !== 'all') {
      query += ` AND iu.id_instansi = $${paramCount}`;
      params.push(instansi);
      paramCount++;
    }

    query += ' ORDER BY p.nama';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get pegawai error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPegawaiByNip = async (req, res) => {
  try {
    const { nip } = req.params;

    // Data pegawai
    const pegawaiQuery = await pool.query(`
      SELECT 
        p.*,
        j.jabatan,
        i.instansi,
        iu.uker
      FROM pegawai p
      LEFT JOIN jabatan j ON p.id_jabatan = j.id
      LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id_instansi
      LEFT JOIN instansi i ON iu.id_instansi = i.id
      WHERE p.nip = $1
    `, [nip]);

    if (pegawaiQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    const pegawai = pegawaiQuery.rows[0];

    // Data pendidikan
    const pendidikanQuery = await pool.query(`
      SELECT pp.*, pd.pendidikan, pd.skor
      FROM pegawai_pendidikan pp
      LEFT JOIN pendidikan pd ON pp.id_pendidikan = pd.id
      WHERE pp.nip = $1
      ORDER BY pp.tahun DESC
    `, [nip]);

    // Data penghargaan
    const penghargaanQuery = await pool.query(`
      SELECT pp.*, p.penghargaan, p.skor
      FROM pegawai_penghargaan pp
      LEFT JOIN penghargaan p ON pp.id_penghargaan = p.id
      WHERE pp.nip = $1
      ORDER BY pp.tahun DESC
    `, [nip]);

    // Data rekam jejak
    const rekamJejakQuery = await pool.query(`
      SELECT pr.*, rj.gugustugas, rj.skor
      FROM pegawai_rekamjejak pr
      LEFT JOIN rekamjejak rj ON pr.id_rekamjejak = rj.id
      WHERE pr.nip = $1
      ORDER BY pr.tahun DESC
    `, [nip]);

    // Data kinerja & kompetensi
    const kinerjaQuery = await pool.query(`
      SELECT *
      FROM pegawai_kinerjakompetensipotensi
      WHERE nip = $1
      ORDER BY tahun DESC
      LIMIT 1
    `, [nip]);

    // Data riwayat jabatan
    const riwayatJabatanQuery = await pool.query(`
      SELECT *
      FROM pegawai_riwayatjabatan
      WHERE nip = $1
      ORDER BY tmt DESC
    `, [nip]);

    // Data pelatihan
    const pelatihanQuery = await pool.query(`
      SELECT *
      FROM pegawai_pelatihan
      WHERE nip = $1
    `, [nip]);

    // Data sertifikasi
    const sertifikasiQuery = await pool.query(`
      SELECT *
      FROM pegawai_sertifikasi
      WHERE nip = $1
    `, [nip]);

    res.json({
      success: true,
      data: {
        pegawai,
        pendidikan: pendidikanQuery.rows,
        penghargaan: penghargaanQuery.rows,
        rekamJejak: rekamJejakQuery.rows,
        kinerja: kinerjaQuery.rows[0] || null,
        riwayatJabatan: riwayatJabatanQuery.rows,
        pelatihan: pelatihanQuery.rows,
        sertifikasi: sertifikasiQuery.rows
      }
    });
  } catch (error) {
    console.error('Get pegawai detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Anda perlu mengimpor pool di sini (asumsi: const pool = require('../config/database');)

exports.getAllPegawaiWithScores = async (req, res) => {
    try {
        const query = `
            SELECT
                p.nip,
                p.nama,
                p.pangkat_gol,
                p.id_instansi, -- Tetap sertakan ID Instansi/Uker untuk filter
                
                -- Informasi Dasar
                j.jabatan,
                iu.uker,
                iu.id_instansi AS id_instansi_filter, -- Ambil ID Instansi untuk Filter Frontend
                
                -- Skor Komponen
                COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
                COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,
                COALESCE(pend.skor, 0) AS skor_pendidikan,
                COALESCE(ph.skor, 0) AS skor_penghargaan,
                COALESCE(rj.skor, 0) AS skor_rekamjejak
                
            FROM pegawai p 
            LEFT JOIN jabatan j ON p.id_jabatan = j.id
            LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id 

            -- JOIN Kinerja (Tahun terbaru)
            LEFT JOIN pegawai_kinerjakompetensipotensi kkp 
                ON p.nip = kkp.nip AND kkp.tahun = (
                    SELECT MAX(tahun) FROM pegawai_kinerjakompetensipotensi 
                    WHERE nip = p.nip
                )
                
            -- JOIN Pendidikan (Skor tertinggi/Strata tertinggi)
            LEFT JOIN pegawai_pendidikan pp 
                ON p.nip = pp.nip AND pp.id_pendidikan = (
                    SELECT id_pendidikan FROM pegawai_pendidikan 
                    WHERE nip = p.nip ORDER BY id_pendidikan ASC LIMIT 1
                )
            LEFT JOIN pendidikan pend ON pp.id_pendidikan = pend.id

            -- JOIN Penghargaan (Skor tertinggi)
            LEFT JOIN pegawai_penghargaan ppgh ON p.nip = ppgh.nip
            LEFT JOIN penghargaan ph 
                ON ppgh.id_penghargaan = ph.id AND ph.skor = (
                    SELECT MAX(ph_max.skor) FROM pegawai_penghargaan ppgh_max 
                    JOIN penghargaan ph_max ON ppgh_max.id_penghargaan = ph_max.id 
                    WHERE ppgh_max.nip = p.nip
                )

            -- JOIN Rekam Jejak (Skor tertinggi)
            LEFT JOIN pegawai_rekamjejak prj ON p.nip = prj.nip
            LEFT JOIN rekamjejak rj 
                ON prj.id_rekamjejak = rj.id AND rj.skor = (
                    SELECT MAX(rj_max.skor) FROM pegawai_rekamjejak prj_max 
                    JOIN rekamjejak rj_max ON prj_max.id_rekamjejak = rj_max.id 
                    WHERE prj_max.nip = p.nip
                )

            GROUP BY 
                p.nip, p.nama, p.pangkat_gol, j.jabatan, iu.uker, iu.id_instansi,
                skor_kinerja, skor_kompetensipotensi, skor_pendidikan, skor_penghargaan, skor_rekamjejak
            ORDER BY p.nama;
        `;
        
        const result = await pool.query(query);
        res.json({ success: true, data: result.rows });

    } catch (error) {
        console.error('Get all pegawai with scores error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};