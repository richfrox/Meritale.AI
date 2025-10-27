// ===== InstansiDetail.jsx (Diperbaiki untuk Menampilkan Semua Data Skor) =====
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Building2, Users, Mail, Phone } from 'lucide-react';
import { instansiAPI } from '../services/api';

// Fungsi bantuan untuk badge skor (opsional, tapi disarankan untuk visualisasi)
const getScoreBadge = (score) => {
    const s = parseFloat(score);
    if (isNaN(s)) return 'text-gray-500';
    if (s >= 80) return 'text-green-600 bg-green-100/50 font-bold';
    if (s >= 60) return 'text-yellow-600 bg-yellow-100/50 font-semibold';
    return 'text-red-600 bg-red-100/50';
}

const InstansiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstansiDetail();
  }, [id]);

  const fetchInstansiDetail = async () => {
    try {
      setLoading(true);
      const response = await instansiAPI.getById(id);
      // Pastikan struktur respons: { success: true, data: { instansi: {...}, pegawai: [...] } }
      setData(response.data); 
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat data instansi');
    } finally {
      setLoading(false);
    }
  };

  // --- Status Loading dan Error ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data instansi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => navigate('/fairness')}>Kembali</Button>
        </div>
      </div>
    );
  }

  // Pastikan data dan komponen utamanya tersedia
  if (!data || !data.instansi || !data.pegawai) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Data tidak lengkap atau instansi tidak ditemukan</p>
          <Button onClick={() => navigate('/fairness')}>Kembali</Button>
        </div>
      </div>
    );
  }

  const { instansi, pegawai, fairness_analysis } = data; // Tambahkan fairness_analysis

  return (
    <>
      <Helmet>
        <title>{instansi.instansi} - Detail Analisis</title>
        <meta name="description" content={`Detail instansi ${instansi.instansi}`} />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/fairness')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{instansi.instansi}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Profil dan Analisis Fairness instansi</p>
          </div>
        </div>

        {/* --- KARTU BARU: ANALISIS FAIRNESS (Opsional, tapi penting) --- */}
        {fairness_analysis && (
            <Card className="border-l-4 border-amber-500">
                <CardHeader>
                    <CardTitle className="text-xl">Analisis Fairness (Bias Detection)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Fairness Score</p>
                        <p className="text-4xl font-extrabold text-amber-600">
                            {parseFloat(fairness_analysis.score_fairness).toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bias Aktual</p>
                        <p className="text-4xl font-extrabold text-red-600">
                            {fairness_analysis.bias_aktual}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bias Maksimal</p>
                        <p className="text-4xl font-extrabold text-gray-500">
                            {fairness_analysis.bias_maksimal}
                        </p>
                    </div>
                    <div className="md:col-span-3 pt-4 border-t">
                        <p className="text-gray-700 text-sm">{fairness_analysis.summary || "Fairness score dihitung berdasarkan perbandingan total skor talenta dengan jabatan aktual."}</p>
                    </div>
                </CardContent>
            </Card>
        )}
        {/* --- AKHIR KARTU BARU --- */}

        <Card>
          <CardHeader>
            <CardTitle>Profil Instansi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... (Bagian Profil Instansi lainnya tetap sama) ... */}
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{instansi.instansi}</h3>
                        <p className="text-gray-500 dark:text-gray-400">Instansi Pemerintah</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Pegawai</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{pegawai.length}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unit Kerja</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Set(pegawai.map(p => p.uker)).size}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Deskripsi</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                        {/* Placeholder deskripsi */}
                        {instansi.instansi} adalah salah satu instansi pemerintah yang berkomitmen dalam pengembangan sumber daya manusia aparatur sipil negara. Dengan fokus pada peningkatan kompetensi dan kinerja pegawai, instansi ini terus berinovasi dalam pelayanan publik.
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Bagan Organisasi (Unit Kerja)</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                        <div className="text-center space-y-4">
                            <div className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
                                Kepala {instansi.instansi}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {Array.from(new Set(pegawai.map(p => p.uker))).map((uker, idx) => (
                                    <div key={idx} className="bg-cyan-500 text-white px-4 py-2 rounded-lg">
                                        {uker}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pegawai ({pegawai.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pegawai.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Tidak ada data pegawai</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max"> {/* Tambahkan min-w-max agar tabel tidak merusak layout */}
                  <thead>
                    <tr className="border-b text-sm text-gray-600">
                      <th className="text-left py-3 px-4 min-w-[120px]">NIP</th>
                      <th className="text-left py-3 px-4 min-w-[200px]">Nama</th>
                      <th className="text-left py-3 px-4 min-w-[150px]">Jabatan</th>
                      <th className="text-left py-3 px-4 min-w-[150px]">Unit Kerja</th>
                      <th className="text-left py-3 px-4 min-w-[100px]">Pangkat/Gol</th>
                      
                        {/* --- KOLOM SKOR BARU --- */}
                        <th className="text-center py-3 px-4 min-w-[80px]">Kinerja</th>
                        <th className="text-center py-3 px-4 min-w-[80px]">Kompetensi</th>
                        <th className="text-center py-3 px-4 min-w-[80px]">Pendidikan</th>
                        <th className="text-center py-3 px-4 min-w-[80px]">Penghargaan</th>
                        <th className="text-center py-3 px-4 min-w-[80px]">Rekam Jejak</th>
                        {/* --- AKHIR KOLOM SKOR BARU --- */}
                        
                        <th className="text-center py-3 px-4 min-w-[100px]">TOTAL SKOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pegawai.map((peg) => (
                      <tr key={peg.nip} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-sm whitespace-nowrap">{peg.nip}</td>
                        <td className="py-3 px-4 font-medium whitespace-nowrap">{peg.nama}</td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">{peg.jabatan}</td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">{peg.uker}</td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">{peg.pangkat_gol}</td>
                        
                        {/* --- DATA SKOR BARU --- */}
                        <td className={`py-3 px-4 text-sm text-center ${getScoreBadge(peg.skor_kiner)}`}>
                            {peg.skor_kinerja || 0}
                        </td>
                        <td className={`py-3 px-4 text-sm text-center ${getScoreBadge(peg.skor_kompetensipotensi)}`}>
                            {peg.skor_kompetensipotensi || 0}
                        </td>
                        <td className={`py-3 px-4 text-sm text-center ${getScoreBadge(peg.skor_pendidikan)}`}>
                            {peg.skor_pendidikan || 0}
                        </td>
                        <td className={`py-3 px-4 text-sm text-center ${getScoreBadge(peg.skor_penghargaan)}`}>
                            {peg.skor_penghargaan || 0}
                        </td>
                        <td className={`py-3 px-4 text-sm text-center ${getScoreBadge(peg.skor_rekamjejak)}`}>
                            {peg.skor_rekamjejak || 0}
                        </td>
                        {/* --- AKHIR DATA SKOR BARU --- */}

                        <td className="py-3 px-4 text-sm font-bold text-center text-emerald-600">
                          {peg.total_skor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default InstansiDetail;