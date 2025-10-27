// TalentBiasCalculator.js

const { Pool } = require('pg');

// --- 1. KONFIGURASI DATABASE ---
const DB_CONFIG = {
    user: 'postgres',    // Ganti dengan user PostgreSQL Anda
    host: '10.12.10.76',
    database: 'meritaidb',
    password: 'admin123', // Ganti dengan password PostgreSQL Anda
    port: 5432,
};

class TalentBiasCalculator {
    constructor(config) {
        // Menggunakan Pool untuk manajemen koneksi yang efisien
        this.pool = new Pool(config);
    }

    mapJabatanLevel(jabatan) {
        /**
         * Memetakan Jabatan ke nilai numerik untuk perbandingan hierarki.
         * Nilai yang lebih rendah menunjukkan level yang lebih tinggi.
         */
        const mapping = {
            'Kepala': 1,
            'Deputi': 2,
            'Direktur': 3,
            'Staf': 4,
            'Pelaksana': 5,
            'Fungsional': 6,
            '': 99,
            // Jika jabatan tidak ada atau null/undefined, gunakan 99
        };
        return mapping[jabatan] || 99;
    }

    async getInstansiId(instansiName) {
        /** Mencari ID Instansi berdasarkan nama. */
        const client = await this.pool.connect();
        try {
            const query = "SELECT id FROM instansi WHERE instansi = $1";
            const result = await client.query(query, [instansiName]);
            return result.rows.length > 0 ? result.rows[0].id : null;
        } catch (error) {
            console.error("Error mencari ID Instansi:", error);
            throw error;
        } finally {
            client.release();
        }
    }


    async getTalentData(instansiName) {
        /**
         * Mengambil semua data pegawai dan skor komponennya untuk instansi tertentu.
         * Note: PostgreSQL menggunakan $1, $2, dst. sebagai placeholder parameter.
         */
        const idInstansiTarget = await this.getInstansiId(instansiName);
        if (!idInstansiTarget) {
            console.log(`Instansi '${instansiName}' tidak ditemukan.`);
            return [];
        }
        
        const client = await this.pool.connect();
        let allData = [];

        try {
            // ===== TalentBiasCalculator.js (Perbaikan Query SQL) =====

            const sqlFullQuery = `
                SELECT
                    p.nip,
                    p.nama,
                    p.gender, -- DITAMBAHKAN: Diperlukan di instansiController untuk output API
                    p.pangkat_gol,
                    j.jabatan,
                    iu.uker,
                    
                    -- Menggunakan COALESCE untuk memastikan nilai 0 jika tidak ada data
                    COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
                    COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,
                    COALESCE(pend.skor, 0) AS skor_pendidikan,
                    COALESCE(ph.skor, 0) AS skor_penghargaan,
                    COALESCE(rj.skor, 0) AS skor_rekamjejak
                    
                FROM 
                    pegawai p 
                LEFT JOIN 
                    jabatan j ON p.id_jabatan = j.id
                LEFT JOIN 
                    instansi_uker iu ON p.id_instansi = iu.id 
                
                -- 1. Kinerja & Kompetensi (MAX Tahun)
                LEFT JOIN pegawai_kinerjakompetensipotensi kkp 
                    ON p.nip = kkp.nip AND kkp.tahun = (
                        SELECT MAX(tahun) 
                        FROM pegawai_kinerjakompetensipotensi 
                        WHERE nip = p.nip
                    )
                    
                -- 2. Pendidikan (MAX ID / Skor Tertinggi) - PENGGUNAAN CTE/Subquery yang Lebih Bersih
                LEFT JOIN (
                    SELECT 
                        DISTINCT ON (pp_max.nip) pp_max.nip, pend_max.skor
                    FROM pegawai_pendidikan pp_max
                    JOIN pendidikan pend_max ON pp_max.id_pendidikan = pend_max.id
                    -- ID_pendidikan terendah biasanya skor tertinggi/pendidikan tertinggi
                    ORDER BY pp_max.nip, pp_max.id_pendidikan DESC 
                ) AS pend ON p.nip = pend.nip 
                
                -- 3. Penghargaan (Skor Tertinggi) - Pola DISTINCT ON sudah OK
                LEFT JOIN (
                    SELECT DISTINCT ON (ppgh_max.nip) ppgh_max.nip, ph_max.skor
                    FROM pegawai_penghargaan ppgh_max 
                    JOIN penghargaan ph_max ON ppgh_max.id_penghargaan = ph_max.id
                    ORDER BY ppgh_max.nip, ph_max.skor DESC
                ) AS ph ON p.nip = ph.nip
                
                -- 4. Rekam Jejak (Skor Tertinggi) - Pola DISTINCT ON sudah OK
                LEFT JOIN (
                    SELECT DISTINCT ON (prj_max.nip) prj_max.nip, rj_max.skor
                    FROM pegawai_rekamjejak prj_max 
                    JOIN rekamjejak rj_max ON prj_max.id_rekamjejak = rj_max.id
                    ORDER BY prj_max.nip, rj_max.skor DESC
                ) AS rj ON p.nip = rj.nip
                
                -- Filter utama
                WHERE iu.id_instansi = $1
                -- Kami tidak perlu GROUP BY karena semua join menggunakan agregasi atau DISTINCT ON
                ORDER BY j.id ASC, p.nama;
            `;
            //const sqlFullQuery = `
              //  SELECT
                //    p.nip,
                //    p.nama,
                 //   p.pangkat_gol,
                //    j.jabatan,
                //    iu.uker,
                //    COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
                //    COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,
                //    COALESCE(pend.skor, 0) AS skor_pendidikan,
                //    COALESCE(ph.skor, 0) AS skor_penghargaan,
                //    COALESCE(rj.skor, 0) AS skor_rekamjejak
               // FROM pegawai p 
               // LEFT JOIN jabatan j ON p.id_jabatan = j.id
               // LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id 
                //LEFT JOIN pegawai_kinerjakompetensipotensi kkp 
                 //   ON p.nip = kkp.nip AND kkp.tahun = (
                 //       SELECT MAX(tahun) FROM pegawai_kinerjakompetensipotensi 
                 //       WHERE nip = p.nip
                  //  )
               // LEFT JOIN pegawai_pendidikan pp 
                //    ON p.nip = pp.nip AND pp.id_pendidikan = (
                 //       SELECT id_pendidikan FROM pegawai_pendidikan 
                  //      WHERE nip = p.nip ORDER BY id_pendidikan ASC LIMIT 1
                  //  )
                //LEFT JOIN pendidikan pend ON pp.id_pendidikan = pend.id
                //LEFT JOIN (
                 //   SELECT DISTINCT ON (ppgh_max.nip) ppgh_max.nip, ph_max.skor
                  //  FROM pegawai_penghargaan ppgh_max 
                   // JOIN penghargaan ph_max ON ppgh_max.id_penghargaan = ph_max.id
                //    ORDER BY ppgh_max.nip, ph_max.skor DESC
               // ) AS ph ON p.nip = ph.nip
               // LEFT JOIN (
               //     SELECT DISTINCT ON (prj_max.nip) prj_max.nip, rj_max.skor
               //     FROM pegawai_rekamjejak prj_max 
              //      JOIN rekamjejak rj_max ON prj_max.id_rekamjejak = rj_max.id
             //       ORDER BY prj_max.nip, rj_max.skor DESC
            //    ) AS rj ON p.nip = rj.nip
           //     WHERE p.id_instansi = $1
           //     ORDER BY j.id ASC, p.nama;
          //  `;
            
            const result = await client.query(sqlFullQuery, [idInstansiTarget]);

            // 3. Hitung Total Talent Score (TS) di JavaScript
            allData = result.rows.map(row => {
                const skorKinerja = parseFloat(row.skor_kinerja) || 0;
                const skorKompetensipotensi = parseFloat(row.skor_kompetensipotensi) || 0;
                const skorPendidikan = parseFloat(row.skor_pendidikan) || 0;
                const skorPenghargaan = parseFloat(row.skor_penghargaan) || 0;
                const skorRekamjejak = parseFloat(row.skor_rekamjejak) || 0;

                row.talent_score = parseFloat(
                    skorKinerja + skorKompetensipotensi + skorPendidikan + skorPenghargaan + skorRekamjejak
                ).toFixed(2); // Menjaga 2 desimal
                
                // Tambahkan level numerik untuk perhitungan bias
                row.jabatan_num = this.mapJabatanLevel(row.jabatan);
                
                return row;
            });
            
            return allData;

        } catch (error) {
            console.error("Error mengambil data talent:", error);
            throw error;
        } finally {
            client.release();
        }
    }


    async hitungPotensiMaksimalBias(instansiName) {
        /** Menghitung Potensi Maksimal Bias (Bias_max). */
        const allData = await this.getTalentData(instansiName);
        if (allData.length === 0) {
            return { bias_max: 0, levels: {}, error: true };
        }

        const levelCounts = {};
        allData.forEach(row => {
            const level = row.jabatan_num;
            if (level !== 99) {
                levelCounts[level] = (levelCounts[level] || 0) + 1;
            }
        });

        const uniqueLevels = Object.keys(levelCounts).map(Number).sort((a, b) => a - b);
        let biasMax = 0;
        
        for (let i = 0; i < uniqueLevels.length; i++) {
            const levelTinggiNum = uniqueLevels[i];
            const countTinggi = levelCounts[levelTinggiNum];
            
            for (let j = i + 1; j < uniqueLevels.length; j++) {
                const levelBawahNum = uniqueLevels[j];
                const countBawah = levelCounts[levelBawahNum];
                
                biasMax += countTinggi * countBawah;
            }
        }
                
        return { bias_max: biasMax, levels: levelCounts, error: false };
    }


    async hitungTotalBias(instansiName) {
        /** Menghitung jumlah total kasus bias aktual. */
        const allData = await this.getTalentData(instansiName);
        if (allData.length === 0) {
            return 0;
        }

        const uniqueLevels = [...new Set(allData
            .filter(row => row.jabatan_num !== 99)
            .map(row => row.jabatan_num)
        )].sort((a, b) => a - b);
        
        let totalBias = 0;
        
        for (let i = 0; i < uniqueLevels.length; i++) {
            const levelTinggiNum = uniqueLevels[i];
            const pegawaiTinggi = allData.filter(row => row.jabatan_num === levelTinggiNum);
            
            for (let j = i + 1; j < uniqueLevels.length; j++) {
                const levelBawahNum = uniqueLevels[j];
                const pegawaiBawah = allData.filter(row => row.jabatan_num === levelBawahNum);
                
                for (const pTinggi of pegawaiTinggi) {
                    const tsTinggi = parseFloat(pTinggi.talent_score);
                    
                    for (const pBawah of pegawaiBawah) {
                        const tsBawah = parseFloat(pBawah.talent_score);
                        
                        // Kasus Bias: TS level tinggi lebih rendah dari TS level bawah
                        if (tsTinggi < tsBawah) {
                            totalBias++;
                        }
                    }
                }
            }
        }
        return totalBias;
    }


    async hitungFairnessScore(instansiName) {
        /** Menghitung Score Fairness (0-100). */
        
        const biasAktual = await this.hitungTotalBias(instansiName);
        const biasMaxData = await this.hitungPotensiMaksimalBias(instansiName);
        const biasMax = biasMaxData.bias_max;

        let scoreFairness;
        let keterangan;

        if (biasMax === 0) {
            scoreFairness = 100.00;
            keterangan = "Hanya terdapat satu level jabatan atau tidak ada data, sehingga bias dianggap 0 dan fairness sempurna.";
        } else {
            // Rumus Fairness: 100 * (1 - (Bias Aktual / Bias Maksimal))
            scoreFairness = 100 * (1 - (biasAktual / biasMax));
            keterangan = "Perhitungan berdasarkan perbandingan lintas level jabatan.";
        }

        return {
            instansi: instansiName,
            bias_aktual: biasAktual,
            bias_maksimal: biasMax,
            score_fairness: parseFloat(scoreFairness).toFixed(2),
            keterangan: keterangan,
            struktur_pegawai_per_level: biasMaxData.levels
        };
    }
    // ⭐ METODE BARU YANG HARUS DITAMBAHKAN/DIPERBAIKI ⭐
    async close() {
        if (this.pool) {
            // Menutup pool koneksi setelah selesai
            await this.pool.end(); 
            this.pool = null;
            //console.log('TalentBiasCalculator Pool closed.');
        }
    }

}

// Ekspor class untuk digunakan di file lain (misal: Express route)
module.exports = { TalentBiasCalculator };

// --- Contoh Penggunaan Langsung (untuk testing) ---
/*
(async () => {
    const calculator = new TalentBiasCalculator(DB_CONFIG);
    const instansiTarget = "Kementerian A"; // Ganti
    
    try {
        const hasil = await calculator.hitungFairnessScore(instansiTarget);
        console.log("\n==============================================");
        console.log("HASIL ANALISIS FAIRNESS TALENT");
        console.log("==============================================");
        console.log(hasil);
    } catch (e) {
        console.error("Gagal menjalankan kalkulator:", e);
    }
})();
*/