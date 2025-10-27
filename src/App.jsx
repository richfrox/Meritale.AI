import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ChatBubble from './components/layout/ChatBubble';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fairness from './pages/Fairness';
import InstansiDetail from './pages/InstansiDetail';
import TalentManagement from './pages/TalentManagement';
import PegawaiDetail from './pages/PegawaiDetail';
import Profile from './pages/Profile';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''} px-4 lg:px-8 pb-8`}>
        {children}
      </main>
      <ChatBubble />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fairness"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Fairness />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fairness/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InstansiDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/talents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TalentManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/talents/:nip"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PegawaiDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;