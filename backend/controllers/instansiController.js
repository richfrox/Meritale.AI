// ===== controllers/instansiController.js (Updated) =====
const pool = require('../config/database');
const { TalentBiasCalculator } = require('../utils/TalentBiasCalculator');
require('dotenv').config(); 

// Konfigurasi DB untuk TalentBiasCalculator (menggunakan connectionString dari env)
const CALCULATOR_DB_CONFIG = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};


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

// ------------------------------------------------------------------
// Perbaikan Utama: Mengintegrasikan TalentBiasCalculator dan Query Tunggal
// ------------------------------------------------------------------
exports.getInstansiById = async (req, res) => {
    let calculator; // Deklarasi kalkulator di luar try/catch

    try {
        const { id } = req.params;

        // 1. Ambil Data Instansi (untuk mendapatkan nama instansi)
        const instansiQuery = await pool.query('SELECT * FROM instansi WHERE id = $1', [id]);
        
        if (instansiQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Instansi tidak ditemukan' });
        }
        
        const instansiData = instansiQuery.rows[0];
        const instansiName = instansiData.instansi; 

        // 2. Inisialisasi TalentBiasCalculator
        // Ini membuat pool koneksi terpisah menggunakan CALCULATOR_DB_CONFIG
        calculator = new TalentBiasCalculator(CALCULATOR_DB_CONFIG);
        
        // 3. Hitung Fairness Score dan Ambil Data Pegawai Sekaligus
        // TalentBiasCalculator.hitungFairnessScore akan menjalankan query getTalentData secara internal
        // dan mengembalikan hasil analisis bias.
        const fairnessResult = await calculator.hitungFairnessScore(instansiName);
        
        // Panggil getTalentData secara eksplisit untuk mendapatkan daftar pegawai
        // yang sudah dihitung skornya (untuk respons API)
        const processedPegawai = await calculator.getTalentData(instansiName);
        
        // Catatan: Karena getTalentData mengembalikan objek dengan properti seperti 
        // 'talent_score', 'jabatan', 'nip', kita harus memetakan ini
        // atau memastikan kolomnya cocok dengan kebutuhan frontend.
        
        // 4. Transformasi Data Pegawai untuk Output API
        // Kita akan menggunakan data dari calculator (processedPegawai)
        const outputPegawai = processedPegawai.map(p => ({
            nip: p.nip,
            nama: p.nama,
            gender: p.gender,
            pangkat_gol: p.pangkat_gol, // Perlu dipastikan ada di query getTalentData
            jabatan: p.jabatan,
            uker: p.uker, // Perlu dipastikan ada di query getTalentData
            skor_kinerja: parseFloat(p.skor_kinerja || 0).toFixed(2),
            skor_kompetensipotensi: parseFloat(p.skor_kompetensipotensi || 0).toFixed(2),
            skor_pendidikan: parseFloat(p.skor_pendidikan || 0).toFixed(2),
            skor_penghargaan: parseFloat(p.skor_penghargaan || 0).toFixed(2),
            skor_rekamjejak: parseFloat(p.skor_rekamjejak || 0).toFixed(2),
            total_skor: parseFloat(p.talent_score || 0).toFixed(2), // talent_score = total_skor
        }));


        // 5. Kirim Response Gabungan
        res.json({
            success: true,
            data: {
                instansi: instansiData,
                pegawai: outputPegawai, // Menggunakan data yang diolah dari kalkulator
                fairness_analysis: fairnessResult 
            }
        });
    } catch (error) {
        console.error('Get instansi detail error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    } finally {
        // 6. Tutup pool koneksi TalentBiasCalculator
        if (calculator) {
            await calculator.close(); 
        }
    }
};