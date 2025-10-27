// ===== controllers/aiController.js (Untuk Rekomendasi Jabatan) =====
const { GoogleGenAI } = require('@google/genai');
// Menggunakan modul database yang sudah di-refactor
const db = require('../config/db'); 

// Inisialisasi Gemini. Kunci API diambil otomatis dari GEMINI_API_KEY di .env
const ai = new GoogleGenAI({}); 
// Model yang cepat dan baik untuk tugas pemrosesan JSON
const model = "gemini-2.5-flash"; 

/**
 * Endpoint untuk mendapatkan rekomendasi jabatan berdasarkan NIP menggunakan LLM.
 * @param {object} req - Objek request Express
 * @param {object} res - Objek response Express
 */
exports.getJobRecommendations = async (req, res) => {
    // 1. Ambil NIP dari parameter URL
    const { nip } = req.params; 

    if (!nip) {
        return res.status(400).json({ error: 'NIP pegawai harus disertakan.' });
    }

    let pegawaiData;
    let jabatanTargets;

    try {
        // 2. Ambil data pegawai dan jabatan target dari modul database (db)
        pegawaiData = await db.getPegawaiDataByNip(nip); 
        jabatanTargets = await db.getAllJabatanTarget(); 
        
        if (!pegawaiData) {
            return res.status(404).json({ error: `Pegawai dengan NIP ${nip} tidak ditemukan.` });
        }
        
        // Jika tidak ada jabatan target, anggap sukses tapi tanpa rekomendasi
        if (!jabatanTargets || jabatanTargets.length === 0) {
            return res.json({ success: true, rekomendasi: [] });
        }

        // 3. Persiapkan konteks data untuk Prompt
        // Riwayat proyek sudah digabung di dalam db.getPegawaiDataByNip
        const profileContext = `
            Nama: ${pegawaiData.nama}
            Jabatan Saat Ini: ${pegawaiData.jabatan} (${pegawaiData.pangkat_gol})
            Unit Kerja: ${pegawaiData.uker}
            Total Skor Talenta (Max ~100): ${pegawaiData.total_talent_score}
            Kinerja Tahun Terakhir (Max 20): ${pegawaiData.skor_kinerja}
            Kompetensi/Potensi (Max 20): ${pegawaiData.skor_kompetensipotensi}
            Pendidikan Tertinggi: ${pegawaiData.pendidikan_tertinggi || 'Tidak Diketahui'}
            Riwayat Proyek/Penugasan Penting: ${pegawaiData.riwayat_proyek || 'Tidak ada'}
        `.trim();

        const jabatanList = jabatanTargets.map(j => 
            `Jabatan: ${j.nama_jabatan} (Persyaratan Min: Pangkat ${j.min_pangkat}, Deskripsi Singkat: ${j.deskripsi_singkat})`
        ).join('\n');

        // 4. Susun Prompt Komprehensif
        const promptText = `
            Anda adalah pakar manajemen talenta senior yang bertugas merekomendasikan MAKSIMAL 3 jabatan target paling cocok
            dari daftar yang tersedia. Analisis kesesuaian berdasarkan semua data yang diberikan, terutama Total Skor Talenta,
            Kinerja, Kompetensi, dan riwayat proyek. Abaikan faktor-faktor seperti gender atau usia.

            --- PROFIL PEGAWAI SUMBER ---
            ${profileContext}
            
            --- DAFTAR JABATAN TARGET YANG TERSEDIA ---
            ${jabatanList}
            
            --- INSTRUKSI OUTPUT ---
            1. Pilih MAKSIMAL 3 jabatan yang paling relevan.
            2. Berikan Skor Relevansi (relevance_score) antara 50 hingga 100.
            3. Berikan Alasan Naratif (alasan) yang jelas dan spesifik berdasarkan data profil pegawai.
            4. Output WAJIB dalam format JSON Array sesuai skema.
        `;
        
        // 5. Panggil Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { role: "user", parts: [{ text: promptText }] }
            ],
            config: {
                responseMimeType: "application/json", 
                responseSchema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            jabatan: { type: "string", description: "Nama jabatan yang direkomendasikan." },
                            relevance_score: { type: "number", description: "Skor relevansi antara 50 dan 100." },
                            alasan: { type: "string", description: "Alasan spesifik dari rekomendasi." },
                        },
                        required: ["jabatan", "relevance_score", "alasan"]
                    }
                }
            }
        });

        // 6. Ambil dan parse balasan JSON dari Gemini
        const jsonString = response.text.trim();
        const recommendations = JSON.parse(jsonString);

        // 7. Kirim balasan kembali ke frontend
        res.json({ 
            success: true, 
            rekomendasi: recommendations 
        });

    } catch (error) {
        console.error('LLM Job Recommendation Error:', error);
        // Tangani jika parsing JSON gagal atau ada error API
        res.status(500).json({ error: 'Gagal mendapatkan rekomendasi dari AI. Cek log server.' });
    }
};