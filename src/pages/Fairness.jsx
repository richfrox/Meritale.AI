// ===== Fairness.jsx (Updated with Fairness Data Fetching) =====
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Building2, Users, AlertTriangle } from 'lucide-react';
import { instansiAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Fungsi bantuan untuk menentukan warna/badge berdasarkan skor
const getFairnessColor = (score) => {
    const s = parseFloat(score);
    if (isNaN(s) || s === 100) return 'text-emerald-600 bg-emerald-100'; // Sempurna atau N/A (default 100)
    if (s >= 80) return 'text-emerald-600 bg-emerald-100'; // Baik
    if (s >= 60) return 'text-yellow-600 bg-yellow-100'; // Cukup
    return 'text-red-600 bg-red-100'; // Rendah/Buruk
}

const Fairness = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [instansiList, setInstansiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Menggunakan useCallback agar fungsi tidak dibuat ulang setiap render
    const fetchInstansi = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 1. Ambil daftar instansi dasar (ID, Nama, Pegawai Count)
            const params = searchQuery ? { search: searchQuery } : {};
            const response = await instansiAPI.getAll(params);
            let baseInstansi = response.data || [];

            // 2. Ambil data fairness untuk setiap instansi secara paralel (N+1 API Calls)
            const detailPromises = baseInstansi.map(async (instansi) => {
                try {
                    // Panggil endpoint detail yang sudah memiliki fairness_analysis
                    const detailResponse = await instansiAPI.getById(instansi.id);
                    
                    const fairnessData = detailResponse.data?.fairness_analysis;
                    
                    // Gabungkan data fairness ke objek instansi
                    return {
                        ...instansi,
                        // Pastikan skor adalah string 2 desimal
                        fairness_score: parseFloat(fairnessData?.score_fairness || 100).toFixed(2), 
                        bias_aktual: parseInt(fairnessData?.bias_aktual || 0),
                    };
                } catch (detailErr) {
                    console.error(`Gagal memuat detail fairness instansi ${instansi.id}:`, detailErr);
                    // Jika gagal (misal server timeout), kembalikan data dasar dengan nilai default
                    return {
                        ...instansi,
                        fairness_score: 'N/A',
                        bias_aktual: 0,
                    };
                }
            });

            // Tunggu hingga semua panggilan detail selesai
            const fullInstansiList = await Promise.all(detailPromises);
            setInstansiList(fullInstansiList);

        } catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]); // Dependency pada searchQuery

    useEffect(() => {
        fetchInstansi();
    }, [fetchInstansi]); // Dependency pada fetchInstansi

    // Fungsi bantuan sekarang hanya mengambil data dari objek instansi yang sudah diperkaya
    const getInstansiStats = (instansi) => {
        const pegawaiCount = parseInt(instansi.pegawai_count) || 0;
        const biasAktual = instansi.bias_aktual || 0; 
        const fairnessScore = instansi.fairness_score; // Sudah dalam format string

        return { pegawaiCount, biasAktual, fairnessScore };
    };

    if (loading && instansiList.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Fairness - Talent Management System</title>
                </Helmet>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data instansi...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Fairness - Talent Management System</title>
                <meta name="description" content="Monitoring keadilan dan deteksi bias di instansi pemerintah" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Fairness Monitoring</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Monitoring keadilan dan deteksi bias di instansi</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari instansi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-600">Error: {error}</p>
                        </CardContent>
                    </Card>
                )}

                {instansiList.length === 0 && !loading ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">Tidak ada data instansi yang ditemukan</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instansiList.map((instansi, index) => {
                            const stats = getInstansiStats(instansi);
                            const fairnessBadgeClass = getFairnessColor(stats.fairnessScore);
                            
                            return (
                                <motion.div
                                    key={instansi.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                
                                                {/* Tampilkan Bias Aktual */}
                                                {stats.biasAktual > 0 && (
                                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">{stats.biasAktual} Bias</span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardTitle className="mt-4">{instansi.instansi}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            
                                            {/* BARU: Tampilkan Fairness Score */}
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>Fairness Score</span>
                                                </div>
                                                <span 
                                                    className={`font-bold text-lg px-2 py-0.5 rounded-full ${fairnessBadgeClass}`}>
                                                    {stats.fairnessScore}%
                                                </span>
                                            </div>

                                            {/* Tampilkan Total Pegawai */}
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>Total Pegawai</span>
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{stats.pegawaiCount}</span>
                                            </div>
                                            
                                            <Button
                                                onClick={() => navigate(`/fairness/${instansi.id}`)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                            >
                                                Detail Analisis
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default Fairness;