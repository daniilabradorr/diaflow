import React, { useContext } from "react";
import { AuthContext } from "../../auth/AuthProvider";

function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  // Datos del usuario (manejar casos no cargados)
  const nombre = user?.name || user?.username || "(Nombre no disponible)";
  const email = user?.email || user?.username || "(Email no disponible)";

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Nombre:</strong> {nombre}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      <button 
        onClick={logout} 
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default ProfilePage;