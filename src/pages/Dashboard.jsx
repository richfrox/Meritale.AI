import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Building2, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dashboardAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';

const Dashboard = () => {
  const { data: stats, loading, error } = useFetch(() => dashboardAPI.getStats());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  const {
    totalPegawai = 0,
    totalInstansi = 0,
    avgKinerja = 0,
    totalPenghargaan = 0,
    genderDistribution = [],
    jabatanDistribution = [],
    instansiDistribution = []
  } = stats || {};

  // Format data untuk chart
  const instansiData = instansiDistribution.map(item => ({
    name: item.instansi,
    pegawai: parseInt(item.count)
  }));

  const genderData = genderDistribution.map(item => ({
    name: item.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    value: parseInt(item.count)
  }));

  const jabatanData = jabatanDistribution.map(item => ({
    name: item.jabatan,
    value: parseInt(item.count)
  }));

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

  // Mock data untuk tren kinerja bulanan (bisa diganti dengan data real dari API)
  const trenKinerja = [
    { bulan: 'Jan', nilai: 15 },
    { bulan: 'Feb', nilai: 15.5 },
    { bulan: 'Mar', nilai: 16 },
    { bulan: 'Apr', nilai: 16.2 },
    { bulan: 'Mei', nilai: parseFloat(avgKinerja) - 0.1 },
    { bulan: 'Jun', nilai: parseFloat(avgKinerja) }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Talent Management System</title>
        <meta name="description" content="Dashboard Sistem Talent Management ASN" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ringkasan data talent management ASN</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPegawai}</div>
              <p className="text-xs opacity-80 mt-1">Pegawai aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Instansi</CardTitle>
              <Building2 className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInstansi}</div>
              <p className="text-xs opacity-80 mt-1">Instansi terdaftar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Kinerja</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgKinerja}</div>
              <p className="text-xs opacity-80 mt-1">Dari skala 20</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Penghargaan</CardTitle>
              <Award className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPenghargaan}</div>
              <p className="text-xs opacity-80 mt-1">Total penghargaan</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Pegawai per Instansi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={instansiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pegawai" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Jabatan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jabatanData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tren Kinerja Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trenKinerja}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis domain={[14, 17]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nilai" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;