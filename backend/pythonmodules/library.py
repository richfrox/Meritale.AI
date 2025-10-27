import psycopg2
from psycopg2 import Error
from typing import List, Dict, Any


class TalentBiasCalculator:
    def __init__(self, db_config: Dict[str, str]):
        self.DB_CONFIG = db_config

    def _get_db_connection(self):
        """Membuka koneksi database."""
        try:
            return psycopg2.connect(**self.DB_CONFIG)
        except Error as err:
            print(f"Error Koneksi Database: {err}")
            return None

    def map_jabatan_level(self, jabatan: str) -> int:
        """
        Memetakan Jabatan (string) ke nilai numerik untuk perbandingan hierarki.
        Nilai yang lebih rendah menunjukkan level yang lebih tinggi.
        """
        mapping = {
            'Kepala': 1,
            'Deputi': 2,
            'Direktur': 3,
            'Staf': 4,
            'Pelaksana': 5,
            'Fungsional': 6,
            '': 99,
            None: 99
        }
        return mapping.get(jabatan, 99) 


    def get_all_talent_data(self, instansi: str) -> List[Dict[str, Any]]:
        """
        Mengambil semua data pegawai dan skor komponennya untuk instansi tertentu.
        """
        koneksi = None
        cursor = None
        all_data = []
        
        try:
            koneksi = self._get_db_connection()
            if koneksi is None:
                return all_data

            cursor = koneksi.cursor()

            # 1. Cari ID Instansi
            sql_search_instansi = "SELECT id FROM instansi WHERE instansi = %s"
            cursor.execute(sql_search_instansi, (instansi,))
            result = cursor.fetchone()
            
            if result is None:
                print(f"Instansi '{instansi}' tidak ditemukan.")
                return all_data

            id_instansi_target = result[0]
            
            # 2. Kueri Gabungan Lengkap (Semua Data dan Skor sesuaikan data pada postgresql anda)
            sql_full_query = f"""
                SELECT
                    p.nip,
                    p.nama,
                    j.jabatan,
                    iu.uker,
                    COALESCE(kkp.nilai_kinerja, 0) AS skor_kinerja,
                    COALESCE(kkp.nilai_kompetensipotensi, 0) AS skor_kompetensipotensi,
                    COALESCE(pend.skor, 0) AS skor_pendidikan,
                    COALESCE(ph.skor, 0) AS skor_penghargaan,
                    COALESCE(rj.skor, 0) AS skor_rekamjejak
                FROM pegawai p 
                LEFT JOIN jabatan j ON p.id_jabatan = j.id
                LEFT JOIN instansi_uker iu ON p.id_instansi = iu.id 
                LEFT JOIN pegawai_kinerjakompetensipotensi kkp 
                    ON p.nip = kkp.nip AND kkp.tahun = (
                        SELECT MAX(tahun) FROM pegawai_kinerjakompetensipotensi 
                        WHERE nip = p.nip
                    )
                LEFT JOIN pegawai_pendidikan pp 
                    ON p.nip = pp.nip AND pp.id_pendidikan = (
                        SELECT id_pendidikan FROM pegawai_pendidikan 
                        WHERE nip = p.nip ORDER BY id_pendidikan ASC LIMIT 1
                    )
                LEFT JOIN pendidikan pend ON pp.id_pendidikan = pend.id
                LEFT JOIN (
                    SELECT DISTINCT ON (ppgh_max.nip) ppgh_max.nip, ph_max.skor
                    FROM pegawai_penghargaan ppgh_max 
                    JOIN penghargaan ph_max ON ppgh_max.id_penghargaan = ph_max.id
                    ORDER BY ppgh_max.nip, ph_max.skor DESC
                ) AS ph ON p.nip = ph.nip
                LEFT JOIN (
                    SELECT DISTINCT ON (prj_max.nip) prj_max.nip, rj_max.skor
                    FROM pegawai_rekamjejak prj_max 
                    JOIN rekamjejak rj_max ON prj_max.id_rekamjejak = rj_max.id
                    ORDER BY prj_max.nip, rj_max.skor DESC
                ) AS rj ON p.nip = rj.nip
                WHERE p.id_instansi = %s
                ORDER BY j.id ASC, p.nama;
            """
            
            cursor.execute(sql_full_query, (id_instansi_target,))
            
            kolom = [desc[0] for desc in cursor.description]
            records = cursor.fetchall()
            
            # 3. Hitung Total Talent Score (TS)
            for row in records:
                pegawai_data = dict(zip(kolom, row))
                
                skor_kinerja = float(pegawai_data.get('skor_kinerja') or 0)
                skor_kompetensipotensi = float(pegawai_data.get('skor_kompetensipotensi') or 0)
                skor_pendidikan = float(pegawai_data.get('skor_pendidikan') or 0)
                skor_penghargaan = float(pegawai_data.get('skor_penghargaan') or 0)
                skor_rekamjejak = float(pegawai_data.get('skor_rekamjejak') or 0)
                
                pegawai_data['talent_score'] = round(skor_kinerja + skor_kompetensipotensi + \
                                                     skor_pendidikan + skor_penghargaan + skor_rekamjejak, 2)
                
                all_data.append(pegawai_data)
            
            return all_data
            
        except Error as err:
            print(f"Error Kueri PostgreSQL: {err}")
            return []
            
        finally:
            if cursor is not None: cursor.close()
            if koneksi is not None: koneksi.close()


    def hitung_potensi_maksimal_bias(self, instansi: str) -> Dict[str, Any]:
        """
        Menghitung Potensi Maksimal Bias (Bias_max) di instansi tersebut.
        Bias_max adalah jumlah semua perbandingan yang mungkin terjadi antara 
        level jabatan tinggi dengan level di bawahnya.
        """
        all_data = self.get_all_talent_data(instansi)
        if not all_data:
            return {'bias_max': 0, 'levels': {}, 'error': True}

        for row in all_data:
            row['jabatan_num'] = self.map_jabatan_level(row.get('jabatan'))

        # 1. Hitung jumlah pegawai per level jabatan
        level_counts = {}
        for row in all_data:
            level = row['jabatan_num']
            if level != 99:
                level_counts[level] = level_counts.get(level, 0) + 1

        unique_levels = sorted(level_counts.keys())
        bias_max = 0
        
        # 2. Hitung Bias_max: Jumlah Pegawai(Level Tinggi) * Jumlah Pegawai(Level Bawah)
        for i in range(len(unique_levels)):
            level_tinggi_num = unique_levels[i]
            count_tinggi = level_counts[level_tinggi_num]
            
            for j in range(i + 1, len(unique_levels)):
                level_bawah_num = unique_levels[j]
                count_bawah = level_counts[level_bawah_num]
                
                bias_max += count_tinggi * count_bawah
                
        return {'bias_max': bias_max, 'levels': level_counts, 'error': False}


    def hitung_total_bias(self, instansi: str) -> int:
        """
        Menghitung jumlah total kasus bias aktual (TS Pegawai Level Tinggi < TS Pegawai Level Bawah).
        """
        all_data = self.get_all_talent_data(instansi)
        if not all_data:
            return 0

        for row in all_data:
            row['jabatan_num'] = self.map_jabatan_level(row.get('jabatan'))

        unique_levels = sorted(list(set(
            row['jabatan_num'] for row in all_data if row['jabatan_num'] != 99
        )))
        
        total_bias = 0
        
        for i in range(len(unique_levels)):
            level_tinggi_num = unique_levels[i]
            pegawai_tinggi = [
                row for row in all_data 
                if row['jabatan_num'] == level_tinggi_num
            ]
            
            for j in range(i + 1, len(unique_levels)):
                level_bawah_num = unique_levels[j]
                pegawai_bawah = [
                    row for row in all_data 
                    if row['jabatan_num'] == level_bawah_num
                ]
                
                for p_tinggi in pegawai_tinggi:
                    ts_tinggi = p_tinggi['talent_score']
                    
                    for p_bawah in pegawai_bawah:
                        ts_bawah = p_bawah['talent_score']
                        
                        if ts_tinggi < ts_bawah:
                            total_bias += 1
                            
        return total_bias


    def hitung_fairness_score(self, instansi: str) -> Dict[str, Any]:
        """
        Menghitung Score Fairness (0-100) berdasarkan bias aktual dan potensi maksimal bias.
        """
        # Hitung Bias Aktual
        bias_aktual = self.hitung_total_bias(instansi)
        
        # Hitung Potensi Maksimal Bias
        bias_max_data = self.hitung_potensi_maksimal_bias(instansi)
        bias_max = bias_max_data['bias_max']

        if bias_max == 0:
            # Jika tidak ada perbandingan yang mungkin (hanya 1 level atau 0 data)
            score_fairness = 100.0
            keterangan = "Hanya terdapat satu level jabatan atau tidak ada data, sehingga bias dianggap 0 dan fairness sempurna."
        else:
            # Rumus Fairness: 100 * (1 - (Bias Aktual / Bias Maksimal))
            score_fairness = 100 * (1 - (bias_aktual / bias_max))
            keterangan = "Perhitungan berdasarkan perbandingan lintas level jabatan."

        return {
            'instansi': instansi,
            'bias_aktual': bias_aktual,
            'bias_maksimal': bias_max,
            'score_fairness': round(score_fairness, 2),
            'keterangan': keterangan,
            'struktur_pegawai_per_level': bias_max_data['levels']
        }


