import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
// ... (Imports lainnya)
// Hapus semua mock data import
// import { mockPegawai, mockJabatan, ... } from '../data/mockData'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'; // <--- INI PENTING!
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, User } from 'lucide-react';
// Import API services
import { pegawaiAPI, instansiAPI } from '../services/api'; 

const TalentManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterInstansi, setFilterInstansi] = useState('all');
    const [allPegawai, setAllPegawai] = useState([]); // Data dari DB
    const [allInstansi, setAllInstansi] = useState([]); // Data Instansi dari DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 1. Fetch data dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Ambil daftar instansi untuk filter
                const instansiRes = await instansiAPI.getAll(); 
                // Asumsi instansiAPI.getAll() mengembalikan { success: true, data: [...] }
                setAllInstansi(instansiRes.data || []); 

                // Ambil daftar pegawai yang sudah dihitung skornya
                const pegawaiRes = await pegawaiAPI.getAllTalents(); 
                // KOREKSI DI SINI: Sesuaikan dengan format respons API Anda:
                setAllPegawai(pegawaiRes.data || []); // <-- Ambil dari .data
                // Sebelumnya: setAllPegawai(pegawaiRes.data);

            } catch (err) {
                console.error("Failed to fetch talent data:", err);
                // Menangkap pesan error dari response atau default
                setError(err.response?.data?.error || "Gagal memuat data talenta dari server.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    // 2. Filter data
    const filteredPegawai = useMemo(() => {
        return allPegawai.filter(pegawai => {
            const matchSearch = 
                pegawai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pegawai.nip.includes(searchQuery);

            const matchInstansi = 
                filterInstansi === 'all' || 
                // Menggunakan kolom id_instansi_filter yang kita buat di kueri SQL
                pegawai.id_instansi_filter === parseInt(filterInstansi); 
            
            return matchSearch && matchInstansi; 
        });
    }, [allPegawai, searchQuery, filterInstansi]);


    // 3. Fungsi Radar Chart (menggunakan skor yang sudah dihitung dari backend)
    const getRadarData = (pegawai) => {
        // Skor sudah langsung ada di objek pegawai
        return [
            { subject: 'Kompetensi & Potensi', value: pegawai.skor_kompetensipotensi || 0, fullMark: 20 },
            { subject: 'Rekam Jejak', value: pegawai.skor_rekamjejak || 0, fullMark: 20 },
            { subject: 'Penghargaan', value: pegawai.skor_penghargaan || 0, fullMark: 20 },
            { subject: 'Kinerja', value: pegawai.skor_kinerja || 0, fullMark: 20 },
            { subject: 'Kualifikasi', value: pegawai.skor_pendidikan || 0, fullMark: 20 }
        ];
    };

    if (loading) {
        return <div className="text-center py-20">Memuat data talenta...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">Error: {error}</div>;
    }

    return (
        // ... (Return JSX tetap sama)
        <>
            <Helmet>
                <title>Talent Management - Talent Management System</title>
                <meta name="description" content="Kelola dan kembangkan talenta pegawai ASN" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Talent Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola dan kembangkan talenta pegawai ASN</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari pegawai (nama/NIP)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterInstansi} onValueChange={setFilterInstansi}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter Instansi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Instansi</SelectItem>
                                    {allInstansi.map(inst => (
                                        <SelectItem key={inst.id} value={inst.id.toString()}>
                                            {inst.instansi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPegawai.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 py-10">
                            Tidak ada pegawai yang ditemukan.
                        </p>
                    ) : (
                        filteredPegawai.map((pegawai, index) => {
                            const radarData = getRadarData(pegawai);
                            
                            return (
                                <motion.div
                                    key={pegawai.nip}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">{pegawai.nama}</CardTitle>
                                                    {/* Menggunakan data 'jabatan' yang sudah di-join dari backend */}
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{pegawai.jabatan}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{pegawai.pangkat_gol}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart data={radarData}>
                                                        <PolarGrid />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                                        <PolarRadiusAxis angle={90} domain={[0, 20]} />
                                                        <Radar name="Skor" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            
                                            <Button
                                                onClick={() => navigate(`/talents/${pegawai.nip}`)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                            >
                                                Detail Pegawai
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default TalentManagement;