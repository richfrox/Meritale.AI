import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import logoBKN from "../assets/images/logo-bkn.png";
import logoSm from "../assets/images/logo-light.png";
import bgLoginImage from "../assets/images/auth-one-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password); // ✅ FIX: Tambahkan await
      
      if (result.success) {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di Sistem Talent Management"
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Gagal",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Meritale.AI </title>
        <meta name="description" content="Login ke Meritale.AI" />
      </Helmet>
      
      {/* ========================================================= */}
      {/* KONTEN UTAMA: Background Image, Overlay, dan Blur */}
      {/* Gunakan DIV bertingkat untuk memisahkan BG dan Konten */}
      {/* ========================================================= */}
      <div 
        className="min-h-screen relative" // Tambahkan 'relative' untuk child absolute
      >
        {/* Lapis 1: BACKGROUND IMAGE DENGAN BLUR DAN OVERLAY */}
        <div
          className="absolute inset-0 z-0" // Absolute untuk menutupi 100%
          style={{
            backgroundImage: `url(${bgLoginImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // --- EFEK BLUR DAN GELAP ---
            // Tambahkan filter blur pada elemen ini
            filter: 'blur(3px)', 
            // Tambahkan pseudo-element atau gradient gelap untuk warna kehijauan
            // Karena tidak bisa pseudo-element, kita gunakan overlay div lagi di atasnya
          }}
        >
        </div>

        {/* Lapis 2: OVERLAY WARNA HIJAU GELAP (TIDAK BURAM) */}
        <div 
            className="absolute inset-0 z-[1] bg-emerald-900/70" // Opasitas 70%
        ></div>


        {/* Lapis 3: KONTEN LOGIN (JELAS & Z-INDEX TERTINGGI) */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="flex justify-center items-center mt-sm-5 mb-2 p-2">
                {/* Logo BKN */}
                <span className="logo-bkn">
                  <img src={logoBKN} alt="Logo BKN" width="50" />
                </span>
               </div>
              <div className="flex justify-center items-center gap-4 mt-sm-5 mb-4 p-2">
                {/* Logo SM */}
                <span className="logo-sm">
                  <img src={logoSm} alt="Logo Meritale" width="350" />
                </span>
              </div>
              
              <Card className="shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                  <CardTitle className="text-2xl">Meritale.AI</CardTitle>
                  <CardDescription>
                    Masuk ke Meritale.AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@instansi.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      disabled={loading}
                    >
                      {loading ? 'Memproses...' : 'Masuk'}
                    </Button>
                  </form>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Akun:</p>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p>Pengawas Pusat: pengawas.pusat@gov.id / admin123</p>
                      <p>Pengawas Internal: pengawas.internal@kemenA.id / admin123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;