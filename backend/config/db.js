// ===== config/db.js =====
const { Pool } = require('pg');

// Pastikan konfigurasi diambil dari variabel environment (direkomendasikan)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

/**
 * Mendapatkan data pegawai lengkap dan skor talenta untuk prompt AI.
 * @param {string} nip - Nomor Induk Pegawai
 * @returns {object|null} Data pegawai yang sudah di-flatten
 */
const getPegawaiDataByNip = async (nip) => {
    const query = `
        SELECT
            p.nip,
            p.nama,
            p.pangkat_gol,
            p.gender,
            p.tmt_pangkat,
            p.tmt_diangkat_pns,
            p.skill,
            p.minat,
            j.jabatan,
            i.instansi,
            iu.uker,

            -- Ambil Skor Kinerja & Kompetensi terbaru
            COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
            COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,

            -- Ambil Skor Pendidikan Tertinggi (misal: S3 = 20, S2 = 15, dst.)
            COALESCE(max_pend.skor, 0) AS skor_pendidikan,
            
            -- Ambil Skor Penghargaan Tertinggi
            COALESCE(max_ph.skor, 0) AS skor_penghargaan,

            -- Ambil Skor Rekam Jejak Tertinggi (misal: ketua panitia nasional)
            COALESCE(max_rj.skor, 0) AS skor_rekamjejak
            
        FROM pegawai p
        LEFT JOIN jabatan j ON p.id_jabatan = j.id
        LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id -- Asumsi id_instansi di pegawai mengarah ke tabel instansi_uker
        LEFT JOIN instansi i ON iu.id_instansi = i.id

        -- Kinerja/Kompetensi (terbaru)
        LEFT JOIN pegawai_kinerjakompetensipotensi kkp ON p.nip = kkp.nip AND kkp.tahun = (
            SELECT MAX(tahun) FROM pegawai_kinerjakompetensipotensi WHERE nip = p.nip
        )

        -- Pendidikan (Skor tertinggi/Strata tertinggi)
        LEFT JOIN (
            SELECT pp.nip, MAX(pd.skor) as skor
            FROM pegawai_pendidikan pp
            JOIN pendidikan pd ON pp.id_pendidikan = pd.id
            GROUP BY pp.nip
        ) max_pend ON p.nip = max_pend.nip
        
        -- Penghargaan (Skor tertinggi)
        LEFT JOIN (
            SELECT pp.nip, MAX(ph.skor) as skor
            FROM pegawai_penghargaan pp
            JOIN penghargaan ph ON pp.id_penghargaan = ph.id
            GROUP BY pp.nip
        ) max_ph ON p.nip = max_ph.nip
        
        -- Rekam Jejak (Skor tertinggi)
        LEFT JOIN (
            SELECT pr.nip, MAX(rj.skor) as skor
            FROM pegawai_rekamjejak pr
            JOIN rekamjejak rj ON pr.id_rekamjejak = rj.id
            GROUP BY pr.nip
        ) max_rj ON p.nip = max_rj.nip
        
        WHERE p.nip = $1
    `;

    const result = await pool.query(query, [nip]);
    
    if (result.rows.length === 0) return null;

    const data = result.rows[0];
    
    // Hitung Total Talent Score
    data.total_talent_score = data.skor_kinerja + data.skor_kompetensipotensi + data.skor_pendidikan + data.skor_penghargaan + data.skor_rekamjejak;
    
    // Ambil riwayat proyek (misalnya dari tabel rekam jejak, untuk LLM prompt)
    const riwayatProyekQuery = await pool.query(`
        SELECT rj.gugustugas
        FROM pegawai_rekamjejak pr
        JOIN rekamjejak rj ON pr.id_rekamjejak = rj.id
        WHERE pr.nip = $1
        ORDER BY pr.tahun DESC
        LIMIT 3
    `, [nip]);
    
    data.riwayat_proyek = riwayatProyekQuery.rows.map(row => row.gugustugas).join('; ');

    return data;
};

/**
 * Mendapatkan semua jabatan target yang tersedia.
 * @returns {Array<object>} Array jabatan target
 */
const getAllJabatanTarget = async () => {
    // Asumsi: Anda memiliki tabel `jabatan_target` yang berisi kriteria minimum.
    // Jika tidak ada, gunakan tabel `jabatan` dan tambahkan kolom kriteria.
    const result = await pool.query(`
        SELECT 
            id, 
            nama_jabatan, 
            min_pangkat, 
            deskripsi_singkat 
        FROM jabatan_target
        WHERE is_available = TRUE
    `); // Asumsi kolom is_available menandakan jabatan terbuka
    return result.rows;
};

module.exports = {
    getPegawaiDataByNip,
    getAllJabatanTarget,
    // Jika Anda ingin mengekspos pool untuk query lain:
    // query: pool.query.bind(pool) 
};