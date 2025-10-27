// ===== controllers/instansiController.js =====
const pool = require('../config/database');

exports.getAllInstansi = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT i.*, COUNT(DISTINCT p.nip) as pegawai_count
      FROM instansi i
      LEFT JOIN instansi_uker iu ON i.id = iu.id_instansi
      LEFT JOIN pegawai p ON iu.id = p.id_instansi
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ` AND i.instansi ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' GROUP BY i.id ORDER BY i.instansi';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get instansi error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInstansiById = async (req, res) => {
    try {
        const { id } = req.params;

        const instansiQuery = await pool.query('SELECT * FROM instansi WHERE id = $1', [id]);
        
        if (instansiQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Instansi tidak ditemukan' });
        }

        // PERHATIAN: Perubahan nama tabel dari data_pegawai ke pegawai
        const pegawaiQuery = await pool.query(`
            SELECT 
                p.nip,
                p.nama,
                p.gender,
                p.pangkat_gol,
                j.jabatan,
                iu.uker,
                
                -- Ambil Skor Kinerja & Kompetensi (Tahun Terbaru)
                COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
                COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,
                
                -- Ambil Skor Pendidikan Tertinggi
                COALESCE(pend.skor, 0) AS skor_pendidikan,
                
                -- Ambil Skor Penghargaan Tertinggi
                COALESCE(ph.skor, 0) AS skor_penghargaan,
                
                -- Ambil Skor Rekam Jejak Tertinggi
                COALESCE(rj.skor, 0) AS skor_rekamjejak,
                
                -- KALKULASI TOTAL SKOR
                (
                    COALESCE(kkp.nilai_kinerja, 0) + 
                    COALESCE(kkp.nilai_kompetensipotensi, 0) + 
                    COALESCE(pend.skor, 0) + 
                    COALESCE(ph.skor, 0) + 
                    COALESCE(rj.skor, 0)
                ) AS total_skor
                
            FROM pegawai p -- <--- KOREKSI: data_pegawai -> pegawai
            
            -- KOREKSI: p.id_instansi -> p.id_instansi, dan merujuk ke iu.id
            LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id 
            LEFT JOIN jabatan j ON p.id_jabatan = j.id
            
            -- Subquery untuk mendapatkan Kinerja & Kompetensi (MAX Tahun)
            LEFT JOIN pegawai_kinerjakompetensipotensi kkp 
                ON p.nip = kkp.nip AND kkp.tahun = (
                    SELECT MAX(tahun) FROM pegawai_kinerjakompetensipotensi 
                    WHERE nip = p.nip
                )
            
            -- Subquery untuk mendapatkan Pendidikan (Skor Tertinggi = Pendidikan Tertinggi)
            LEFT JOIN pegawai_pendidikan pp ON p.nip = pp.nip
            LEFT JOIN pendidikan pend 
                ON pp.id_pendidikan = pend.id AND pp.id_pendidikan = (
                    SELECT id_pendidikan FROM pegawai_pendidikan WHERE nip = p.nip ORDER BY id_pendidikan ASC LIMIT 1
                )

            -- Subquery untuk mendapatkan Penghargaan (Skor Tertinggi)
            LEFT JOIN pegawai_penghargaan ppgh ON p.nip = ppgh.nip
            LEFT JOIN penghargaan ph 
                ON ppgh.id_penghargaan = ph.id AND ph.skor = (
                    SELECT MAX(ph_max.skor) FROM pegawai_penghargaan ppgh_max 
                    JOIN penghargaan ph_max ON ppgh_max.id_penghargaan = ph_max.id 
                    WHERE ppgh_max.nip = p.nip
                )

            -- Subquery untuk mendapatkan Rekam Jejak (Skor Tertinggi)
            LEFT JOIN pegawai_rekamjejak prj ON p.nip = prj.nip
            LEFT JOIN rekamjejak rj 
                ON prj.id_rekamjejak = rj.id AND rj.skor = (
                    SELECT MAX(rj_max.skor) FROM pegawai_rekamjejak prj_max 
                    JOIN rekamjejak rj_max ON prj_max.id_rekamjejak = rj_max.id 
                    WHERE prj_max.nip = p.nip
                )
            
            -- Filter Utama: Pegawai milik Instansi ini (menggunakan iu.id_instansi dari tabel instansi_uker)
            WHERE iu.id_instansi = $1
            GROUP BY p.nip, j.jabatan, iu.uker, kkp.nilai_kinerja, kkp.nilai_kompetensipotensi, pend.skor, ph.skor, rj.skor
            ORDER BY p.nama
        `, [id]);

        res.json({
            success: true,
            data: {
                instansi: instansiQuery.rows[0],
                pegawai: pegawaiQuery.rows
            }
        });
    } catch (error) {
        console.error('Get instansi detail error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};