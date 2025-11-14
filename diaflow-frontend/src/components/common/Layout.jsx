import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { AuthContext } from "../../auth/AuthProvider";

function Layout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 bg-gray-100 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4">DiaFlow</h1>
        {/* he decidido poner el dashboard en la raiz */} 
        <nav className="flex-1 space-y-2">
          <Link to="/">Dashboard</Link>
          <Link to="/glucosa">Glucosa</Link>
          <Link to="/inventario">Inventario</Link>
          <Link to="/comidas">Comidas</Link>
          <Link to="/dosis">Dosis</Link>
          <Link to="/kits">Kits</Link>
          <Link to="/reportes">Reportes</Link>
        </nav>

        <div className="pt-4 border-t mt-4">
          {user && <p className="mb-2 text-sm">Sesión: {user.username}</p>}
          <button
            onClick={logout}
            className="text-red-600 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-white">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
