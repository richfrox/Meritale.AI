// ===== controllers/aiController.js =====
const { GoogleGenAI } = require('@google/genai');

// Inisialisasi Gemini. Kunci API diambil otomatis dari GEMINI_API_KEY di .env
const ai = new GoogleGenAI({}); 

// Inisialisasi model
const model = "gemini-2.5-flash"; 

// Catatan: Jika Anda ingin menggunakan riwayat chat (stateful), 
// Anda harus menggunakan instance 'chat' yang disimpan per sesi pengguna, 
// tetapi untuk demo ini, kita akan menggunakan 'generateContent' stateless.

exports.handleChat = async (req, res) => {
    // Pesan dikirim dari frontend dalam body request: { message: "Isi pesan" }
    const { message } = req.body; 

    if (!message) {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    try {
        // Panggil Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { role: "user", parts: [{ text: message }] }
            ],
            // Optional: Tambahkan System Instruction untuk mengarahkan respon AI
            config: {
                systemInstruction: "Anda adalah asisten AI yang ramah dan membantu untuk aplikasi manajemen talenta ASN. Berikan jawaban yang relevan dan informatif terkait data kepegawaian, skor talenta, dan kebijakan SDM.",
            }
        });

        // Ambil teks balasan dari Gemini
        const replyText = response.text.trim();

        // Kirim balasan kembali ke frontend
        res.json({ 
            success: true, 
            reply: replyText // reply adalah properti yang digunakan di ChatBubble.jsx
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Kirim error 500 jika ada masalah di sisi server atau API
        res.status(500).json({ error: 'Gagal mendapatkan balasan dari AI Assistant. Periksa koneksi API.' });
    }
};