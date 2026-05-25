import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPerfil, updatePerfil } from '../../api/usuarios';

export default function MiPerfil() {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState({
    nombre: '',
    telefono: '',
    residencia: '',
    foto_perfil: ''
  });

  // Se guarda el estado original para calcular exactamente qué campos cambiaron
  const [originalProfileData, setOriginalProfileData] = useState({
    nombre: '',
    telefono: '',
    residencia: '',
    foto_perfil: ''
  });

  // Estados para contraseñas
  const [passwords, setPasswords] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarNuevaContrasena: ''
  });

  // Visibilidad de contraseñas (ojito)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Referencia de archivo para la foto de perfil
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileRes = await getPerfil();

      if (profileRes.success) {
        const data = {
          nombre: profileRes.data.nombre || '',
          telefono: profileRes.data.telefono || '',
          residencia: profileRes.data.residencia || '',
          foto_perfil: profileRes.data.foto_perfil || ''
        };
        setProfileData(data);
        setOriginalProfileData(data);
      }
    } catch (error) {
      showToast('error', error.message || 'Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setToast({ type: '', message: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.nombre.trim()) {
      showToast('error', 'El nombre es obligatorio');
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('nombre', profileData.nombre);
      formData.append('telefono', profileData.telefono);
      formData.append('residencia', profileData.residencia);

      if (photoFile) {
        formData.append('foto_perfil', photoFile);
      }

      const res = await updatePerfil(formData);
      if (res.success) {
        // Calcular exactamente qué cambió
        const cambios = [];
        if (profileData.nombre !== originalProfileData.nombre) cambios.push('Nombre');
        if (profileData.telefono !== originalProfileData.telefono) cambios.push('Teléfono');
        if (profileData.residencia !== originalProfileData.residencia) cambios.push('Ubicación');
        if (photoFile) cambios.push('Foto de perfil');

        let msg = 'Perfil';
        if (cambios.length > 0) {
          if (cambios.length === 1) {
            msg = `${cambios[0]} actualizado correctamente`;
          } else if (cambios.length === 2) {
            msg = `${cambios.join(' y ')} actualizados correctamente`;
          } else {
            const last = cambios.pop();
            msg = `${cambios.join(', ')} y ${last} actualizados correctamente`;
          }
        } else {
          msg = 'Información actualizada correctamente';
        }

        showToast('success', msg);

        // Actualizar el estado global de autenticación
        setUser(prev => ({
          ...prev,
          nombre: res.data.nombre,
          foto_perfil: res.data.foto_perfil
        }));

        const updatedData = {
          nombre: res.data.nombre || '',
          telefono: res.data.telefono || '',
          residencia: res.data.residencia || '',
          foto_perfil: res.data.foto_perfil || ''
        };

        setProfileData(updatedData);
        setOriginalProfileData(updatedData);
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (error) {
      showToast('error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwords.contrasenaActual || !passwords.nuevaContrasena || !passwords.confirmarNuevaContrasena) {
      showToast('error', 'Por favor complete todos los campos de contraseña');
      return;
    }

    if (passwords.nuevaContrasena !== passwords.confirmarNuevaContrasena) {
      showToast('error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    setUpdatingPassword(true);
    try {
      const formData = new FormData();
      formData.append('contrasenaActual', passwords.contrasenaActual);
      formData.append('nuevaContrasena', passwords.nuevaContrasena);

      const res = await updatePerfil(formData);
      if (res.success) {
        showToast('success', 'Contraseña actualizada correctamente');
        setPasswords({
          contrasenaActual: '',
          nuevaContrasena: '',
          confirmarNuevaContrasena: ''
        });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      showToast('error', error.message || 'No se pudo cambiar la contraseña');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#5cc0b6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando datos del perfil...</p>
        </div>
      </div>
    );
  }

  // Obtener iniciales para el avatar por defecto
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn relative">
      {/* Título de la página */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#243e7b]">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Administra tu información personal y configuración de seguridad.</p>
      </div>

      {/* Alerta / Toast Estático (Spanning across Personal Info and Security, similar to Admin) */}
      {toast.message && (
        <div className={`border-l-4 shadow-md rounded-r-xl p-4 flex items-center justify-between gap-3 animate-slideDown mb-6 ${toast.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
              <span className="text-lg font-black leading-none">{toast.type === 'success' ? '✓' : '!'}</span>
            </div>
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ type: '', message: '' })}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Información Personal Unificada con Foto */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#243e7b] to-[#5cc0b6]"></div>

          <div>
            <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-3 mb-6 mt-2">Información Personal</h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">

              {/* Foto de Perfil Centrada en la Información Personal */}
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-100 transition-transform duration-300 group-hover:scale-105">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Vista previa de perfil" className="w-full h-full object-cover" />
                    ) : profileData.foto_perfil ? (
                      <img src={profileData.foto_perfil} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-gray-400">{getInitials(profileData.nombre)}</span>
                    )}
                  </div>

                  {/* Overlay de Edición */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="text-xs text-[#5cc0b6] hover:text-[#4bb0a6] font-bold transition"
                  >
                    {photoFile ? 'Cambiar foto seleccionada' : 'Seleccionar nueva foto'}
                  </button>

                  {photoFile && (
                    <p className="text-2xs text-gray-400 italic mt-1">
                      Foto seleccionada: <span className="font-bold text-gray-500">{photoFile.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Campos de Nombre y Correo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={profileData.nombre}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico (No modificable)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-150 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Campos de Teléfono y Residencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={profileData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej. +506 8888 8888"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Residencia / Ubicación</label>
                  <input
                    type="text"
                    name="residencia"
                    value={profileData.residencia}
                    onChange={handleInputChange}
                    placeholder="Ej. Cartago, Costa Rica"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="py-3 px-6 bg-[#243e7b] hover:bg-[#1a3061] text-white text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  {updatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Cambiar Contraseña con ojito */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-800"></div>

          <div>
            <h3 className="text-lg font-bold text-[#243e7b] border-b border-gray-100 pb-3 mb-6 mt-2">Seguridad</h3>

            <form onSubmit={handleSavePassword} className="space-y-4">

              {/* Contraseña Actual */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="contrasenaActual"
                    value={passwords.contrasenaActual}
                    onChange={handlePasswordChange}
                    placeholder="Contraseña actual"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                    required={!!passwords.nuevaContrasena}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="nuevaContrasena"
                    value={passwords.nuevaContrasena}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmarNuevaContrasena"
                    value={passwords.confirmarNuevaContrasena}
                    onChange={handlePasswordChange}
                    placeholder="Repita la nueva contraseña"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5cc0b6] focus:ring-1 focus:ring-[#5cc0b6] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  {updatingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Estilos CSS Inline de Micro-animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  );
}
