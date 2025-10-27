import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
// Ganti TrendingUp dengan Star atau ChevronRight untuk rekomendasi
import { ArrowLeft, User, Mail, Phone, Award, BookOpen, Briefcase, TrendingUp, Zap } from 'lucide-react'; 
import { pegawaiAPI } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const PegawaiDetail = () => {
  const { nip } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]); // State baru untuk rekomendasi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Panggil kedua fungsi pengambilan data
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPegawaiDetail(),
        fetchJobRecommendations()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [nip]);

  const fetchPegawaiDetail = async () => {
    try {
      const response = await pegawaiAPI.getByNip(nip);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat data pegawai');
    }
  };

  // Fungsi baru untuk mengambil rekomendasi dari LLM
  const fetchJobRecommendations = async () => {
    try {
      // Asumsi: pegawaiAPI.getRecommendations sudah didefinisikan di services/api.js
      const response = await pegawaiAPI.getRecommendations(nip);
      // Simpan array rekomendasi (output JSON dari Gemini)
      setRecommendations(response.data.rekomendasi || []); 
    } catch (err) {
      console.error('Gagal memuat rekomendasi AI:', err);
      // Hanya set error jika data utama (pegawai) gagal dimuat
      // Jika rekomendasi gagal, kita biarkan saja recommendations = []
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pegawai dan rekomendasi AI...</p>
        </div>
      </div>
    );
  }

  // Logika error handling dan data check lainnya tetap sama

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => navigate('/talents')}>Kembali</Button>
        </div>
        
      </div>
    );
  }

  if (!data || !data.pegawai) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Pegawai tidak ditemukan</p>
          <Button onClick={() => navigate('/talents')}>Kembali</Button>
        </div>
      </div>
    );
  }

  const { pegawai, pendidikan, penghargaan, rekamJejak, kinerja, riwayatJabatan, pelatihan, sertifikasi } = data;

  // Calculate scores (tetap sama)
  const pendidikanSkor = pendidikan.reduce((sum, p) => sum + (p.skor || 0), 0);
  const penghargaanSkor = penghargaan.reduce((sum, p) => sum + (p.skor || 0), 0);
  const rekamJejakSkor = rekamJejak.reduce((sum, r) => sum + (r.skor || 0), 0);

  const radarData = [
    { subject: 'Kompetensi & Potensi', value: kinerja?.nilai_kompetensipotensi || 0, fullMark: 20 },
    { subject: 'Rekam Jejak', value: rekamJejakSkor > 20 ? 20 : rekamJejakSkor, fullMark: 20 },
    { subject: 'Penghargaan', value: penghargaanSkor > 20 ? 20 : penghargaanSkor, fullMark: 20 },
    { subject: 'Kinerja', value: kinerja?.nilai_kinerja || 0, fullMark: 20 },
    { subject: 'Kualifikasi', value: pendidikanSkor > 20 ? 20 : pendidikanSkor, fullMark: 20 }
  ];

  // Variabel ini sekarang TIDAK digunakan karena digantikan oleh recommendations state.
  // const aiSuggestion = ...; 
  
  const RecommendationCard = ({ recommendation }) => {
    // Warna badge berdasarkan skor
    const getRelevanceColor = (score) => {
      if (score >= 90) return 'bg-emerald-500';
      if (score >= 75) return 'bg-amber-500';
      return 'bg-red-500';
    };

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 transition hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{recommendation.jabatan}</p>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full text-white ${getRelevanceColor(recommendation.relevance_score)}`}>
            Skor: {recommendation.relevance_score}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          **Alasan:** {recommendation.alasan}
        </p>
      </div>
    );
  };


  return (
    <>
      <Helmet>
        <title>{pegawai.nama} - Talent Management System</title>
        <meta name="description" content={`Profil pegawai ${pegawai.nama}`} />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/talents')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{pegawai.nama}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Profil Pegawai ASN</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri - Data Pegawai */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Identitas Pegawai (tetap sama) */}
            {/* ... Kode Card Identitas Pegawai ... */}
            <Card>
              <CardHeader>
                <CardTitle>Identitas Pegawai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pegawai.nama}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{pegawai.jabatan}</p>
                    <p className="text-sm text-gray-400">{pegawai.instansi} - {pegawai.uker}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">NIP</p>
                    <p className="font-medium">{pegawai.nip}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="font-medium">{pegawai.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pangkat/Gol</p>
                    <p className="font-medium">{pegawai.pangkat_gol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">TMT Pangkat</p>
                    <p className="font-medium">{pegawai.tmt_pangkat ? new Date(pegawai.tmt_pangkat).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">TMT PNS</p>
                    <p className="font-medium">{pegawai.tmt_diangkat_pns ? new Date(pegawai.tmt_diangkat_pns).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-sm">{pegawai.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telepon</p>
                      <p className="font-medium">{pegawai.telepon || '-'}</p>
                    </div>
                  </div>
                </div>

                {pegawai.skill && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Skill</p>
                    <p className="font-medium">{pegawai.skill}</p>
                  </div>
                )}

                {pegawai.minat && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Minat</p>
                    <p className="font-medium">{pegawai.minat}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Riwayat Pendidikan (tetap sama) */}
            {pendidikan && pendidikan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Riwayat Pendidikan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendidikan.map((pend) => (
                      <div key={pend.id} className="border-l-4 border-emerald-500 pl-4 py-2">
                        <p className="font-semibold">{pend.pendidikan} - {pend.jurusan}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pend.univ}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Tahun {pend.tahun}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card Penghargaan (tetap sama) */}
            {penghargaan && penghargaan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Penghargaan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {penghargaan.map((peng) => (
                      <div key={peng.id} className="border-l-4 border-amber-500 pl-4 py-2">
                        <p className="font-semibold">{peng.nama_penghargaan}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Tahun {peng.tahun}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card Rekam Jejak (tetap sama) */}
            {rekamJejak && rekamJejak.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Rekam Jejak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rekamJejak.map((rj) => (
                      <div key={rj.id} className="border-l-4 border-cyan-500 pl-4 py-2">
                        <p className="font-semibold">{rj.gugustugas}</p>
                        {rj.keterangan && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rj.keterangan}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">Tahun {rj.tahun}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card Riwayat Jabatan (tetap sama) */}
            {riwayatJabatan && riwayatJabatan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Riwayat Jabatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riwayatJabatan.map((rj) => (
                      <div key={rj.id} className="border-l-4 border-violet-500 pl-4 py-2">
                        <p className="font-semibold">{rj.jabatan}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          TMT: {rj.tmt ? new Date(rj.tmt).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Kolom Kanan - Skor & Rekomendasi */}
          <div className="space-y-6">
            {/* Card Radar Kompetensi (tetap sama) */}
            <Card>
              <CardHeader>
                <CardTitle>Radar Kompetensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 20]} />
                      <Radar name="Skor" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Card Kinerja & Kompetensi (tetap sama) */}
            {kinerja && (
              <Card>
                <CardHeader>
                  <CardTitle>Kinerja & Kompetensi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Nilai Kinerja</span>
                      <span className="font-bold">{kinerja.nilai_kinerja}/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(kinerja.nilai_kinerja / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Kompetensi & Potensi</span>
                      <span className="font-bold">{kinerja.nilai_kompetensipotensi}/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${(kinerja.nilai_kompetensipotensi / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CARD BARU: Rekomendasi Jabatan LLM */}
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                  <Zap className="w-5 h-5" />
                  Rekomendasi Jabatan AI
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rekomendasi Jabatan Target berdasarkan skor talenta dan profil.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400 border border-dashed rounded-md">
                    Tidak ada rekomendasi jabatan yang tersedia saat ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PegawaiDetail;