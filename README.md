<div align="center">
  <img src="./logo-light.png" alt="MERITALE.AI Logo" width="200"/>
  <h1>MERITALE.AI: SECURE ANALYTIC PLATFORM BERBASIS AI UNTUK MENDUKUNG OTOMASI, OBJEKTIFITAS, DAN TRANSPARANSI SISTEM MERIT ASN</h1>
</div>

---

## Deskripsi Singkat

**MERITALE.AI** adalah *secure web app* dan *library/API* yang dirancang untuk membantu BKN dan unit pengelola SDM (Kementerian/Lembaga/Daerah) dalam menerapkan prinsip meritokrasi secara objektif. Platform ini berbasis data dan kecerdasan buatan (AI) untuk:

* Mengukur dan melaporkan bias & *fairness* dalam implementasi sistem merit ASN.
* Menyediakan *talent card* ASN (penilaian berdasarkan indikator manajemen talenta).
* Merekomendasikan *career-path* yang disesuaikan.
* Menyediakan *chatbot RAG* (Retrieval Augmented Generation) / AI Agent assistant untuk asistensi.

Semua fitur dibangun dengan pendekatan *security-by-design*, dilengkapi dengan enkripsi *database* dan *penetration testing*, untuk melindungi data ASN. Hal ini membantu memenuhi indikator penilaian SPBE (Sistem Pemerintahan Berbasis Elektronik) dan kepatuhan terhadap Undang-Undang Perlindungan Data Pribadi (UU PDP).

MERITALE.AI menyediakan antarmuka pengguna (UI) siap pakai untuk *dashboard analytics* serta *library/API* untuk adopsi dan integrasi cepat pada sistem kepegawaian eksisting.

---

## Fitur Utama

* **Analisis Meritokrasi Berbasis AI:** Menerapkan prinsip meritokrasi secara objektif.
* **Pengukuran Bias & Fairness:** Identifikasi dan pelaporan bias dalam keputusan SDM.
* **Talent Card ASN:** Penilaian talenta dan *scoring* sesuai indikator.
* **Rekomendasi Career-Path:** Panduan pengembangan karir personalisasi.
* **AI Chatbot/Agent Assistant:** Asistensi berbasis AI untuk pertanyaan dan tugas SDM.
* **Security-by-Design:** Enkripsi *database* dan *penetration testing* untuk keamanan data.
* **Kepatuhan SPBE & UU PDP:** Membantu memenuhi standar dan regulasi.
* **UI Dashboard & API:** Fleksibilitas adopsi dengan UI siap pakai atau integrasi API.

---

## Teknologi yang Digunakan

* **Backend:** Python, ( Planned Upgrade: FastAPI) 
* **Frontend:** React, Node js
* **Database:** PostgreSQL, Milvus Vector
* **AI/LLM:** Gemini
* **Deployment:** Native/Bare-Metal (Planned Upgrade: Docker)
* **Cryptographic Module:**  AES-256 GCM (galois/counter mode)
* **Security:** OWASP Top 10 practices, encryption standards

---

## Instalasi & Penggunaan

```bash
# Clone repositori
git clone https://github.com/richfrox/Meritale.AI.git
cd Meritale.AI

# Jalankan migrasi database

# Instal dependensi
npm install
npm run
#masuk Backend
cd Backend
# Instal dependensi
npm install 
npm run
# Konfigurasi variabel lingkungan
cp .env.example .env
# Edit .env dengan kredensial database, kunci API, dll.

