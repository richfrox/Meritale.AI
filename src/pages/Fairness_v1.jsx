// ===== Fairness.jsx (Updated) =====
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Building2, Users, AlertTriangle } from 'lucide-react';
import { instansiAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Fairness = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [instansiList, setInstansiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstansi();
  }, [searchQuery]);

  const fetchInstansi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchQuery) params.search = searchQuery;
      
      const response = await instansiAPI.getAll(params);
      setInstansiList(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getInstansiStats = (instansi) => {
    const pegawaiCount = parseInt(instansi.pegawai_count) || 0;
    // Simulasi bias count - bisa diganti dengan data real dari API
    const biasCount = pegawaiCount > 20 ? Math.floor(Math.random() * 5) : 0;
    
    return { pegawaiCount, biasCount };
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
        <meta name="description" content="Monitoring fairness dan bias di instansi pemerintah" />
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
                        {stats.biasCount > 0 && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium">{stats.biasCount} Bias</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="mt-4">{instansi.instansi}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Pegawai</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.pegawaiCount}</span>
                      </div>
                      
                      <Button
                        onClick={() => navigate(`/fairness/${instansi.id}`)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        Detail Instansi
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

