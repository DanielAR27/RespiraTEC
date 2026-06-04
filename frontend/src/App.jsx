import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Para proteger rutas
import Navbar from './components/Navbar';
import Inicio from './pages/public/Inicio';
import Eventos from './pages/public/Eventos';
import EventoDetalle from './pages/public/EventoDetalle';
import Descuentos from './pages/public/Descuentos';
import Contacto from './pages/public/Contacto';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MiPerfil from './pages/user/MiPerfil';
import MisAsociaciones from './pages/user/MisAsociaciones';
import Asociaciones from './pages/public/asociaciones/Asociaciones';
import AsociacionDetalle from './pages/public/asociaciones/AsociacionDetalle';
import AdminEventos from './pages/admin/eventos/AdminEventos';
import AdminEventosNew from './pages/admin/eventos/AdminEventosNew';
import AdminEventosView from './pages/admin/eventos/AdminEventosView';
import AdminEventosEdit from './pages/admin/eventos/AdminEventosEdit';
import AdminTalleres from './pages/admin/talleres/AdminTalleres';
import AdminTalleresNew from './pages/admin/talleres/AdminTalleresNew';
import AdminTalleresView from './pages/admin/talleres/AdminTalleresView';
import AdminTalleresEdit from './pages/admin/talleres/AdminTalleresEdit';
import AdminDescuentos from './pages/admin/descuentos/AdminDescuentos';
import AdminDescuentosNew from './pages/admin/descuentos/AdminDescuentosNew';
import AdminDescuentosView from './pages/admin/descuentos/AdminDescuentosView';
import AdminDescuentosEdit from './pages/admin/descuentos/AdminDescuentosEdit';
import AdminAsociaciones from './pages/admin/asociaciones/AdminAsociaciones';
import AdminAsociacionesNew from './pages/admin/asociaciones/AdminAsociacionesNew';
import AdminAsociacionesEdit from './pages/admin/asociaciones/AdminAsociacionesEdit';
import AdminAsociacionesView from './pages/admin/asociaciones/AdminAsociacionesView';
import AdminUsuarios from './pages/admin/usuarios/AdminUsuarios';
import Talleres from './pages/public/talleres/Talleres';
import TallerDetalle from './pages/public/talleres/TallerDetalle';
import MisTalleres from './pages/user/MisTalleres';
import ProtectedRoute from './components/ProtectedRoute';

// Se crea un componente intermedio para poder usar el hook useAuth para el redireccionamiento del Login
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} />

        {/* RUTAS PROTEGIDAS (Usuarios regulares y admins) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Inicio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />
          <Route path="/descuentos" element={<Descuentos />} />
          <Route path="/asociaciones" element={<Asociaciones />} />
          <Route path="/asociaciones/detalle/:id" element={<AsociacionDetalle />} />
          <Route path="/perfil" element={<MiPerfil />} />
          <Route path="/mis-asociaciones" element={<MisAsociaciones />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/talleres/:id" element={<TallerDetalle />} />
          <Route path="/mis-talleres" element={<MisTalleres />} />
          <Route path="/asociaciones/view/:id" element={<AdminAsociacionesView />} />
          <Route path="/asociaciones/edit/:id" element={<AdminAsociacionesEdit />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* RUTAS DE ADMINISTRADOR */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin/eventos" element={<AdminEventos />} />
          <Route path="/admin/eventos/new" element={<AdminEventosNew />} />
          <Route path="/admin/eventos/view/:id" element={<AdminEventosView />} />
          <Route path="/admin/eventos/edit/:id" element={<AdminEventosEdit />} />
          
          <Route path="/admin/talleres" element={<AdminTalleres />} />
          <Route path="/admin/talleres/new" element={<AdminTalleresNew />} />
          <Route path="/admin/talleres/view/:id" element={<AdminTalleresView />} />
          <Route path="/admin/talleres/edit/:id" element={<AdminTalleresEdit />} />

          <Route path="/admin/descuentos" element={<AdminDescuentos />} />
          <Route path="/admin/descuentos/new" element={<AdminDescuentosNew />} />
          <Route path="/admin/descuentos/view/:id" element={<AdminDescuentosView />} />
          <Route path="/admin/descuentos/edit/:id" element={<AdminDescuentosEdit />} />

          <Route path="/admin/asociaciones" element={<AdminAsociaciones />} />
          <Route path="/admin/asociaciones/new" element={<AdminAsociacionesNew />} />
          <Route path="/admin/asociaciones/view/:id" element={<AdminAsociacionesView />} />
          <Route path="/admin/asociaciones/edit/:id" element={<AdminAsociacionesEdit />} />
          
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;