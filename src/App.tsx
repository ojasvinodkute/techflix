import { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api';
import { Shell } from './ui';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Results from './pages/Results';
import Admin from './pages/Admin';

const Guard = ({ role, to, children }: { role: 'team' | 'admin'; to: string; children: ReactNode }) =>
  getToken(role) ? <>{children}</> : <Navigate to={to} replace />;

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/play" element={<Guard role="team" to="/login"><Dashboard /></Guard>} />
        <Route path="/play/:round" element={<Guard role="team" to="/login"><Game /></Guard>} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
