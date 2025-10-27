import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/use-toast';
import { User } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    toast({
      title: "Profil Diperbarui",
      description: "Data profil Anda berhasil diperbarui"
    });
  };

  return (
    <>
      <Helmet>
        <title>Pengaturan Profile - Talent Management System</title>
        <meta name="description" content="Pengaturan profil pengguna" />
      </Helmet>

      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola informasi profil Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.nama}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role === 'pengawas_pusat' ? 'Pengawas Pusat' : 'Pengawas Internal'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={user?.role === 'pengawas_pusat' ? 'Pengawas Pusat' : 'Pengawas Internal'}
                  disabled
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;