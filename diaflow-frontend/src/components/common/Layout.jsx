import React, { useContext } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../../auth/AuthProvider";

function Layout() {
  const { user, logout } = useContext(AuthContext);

  const linkBase =
    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const linkInactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const linkActive = "bg-blue-50 text-blue-700";

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-blue-700">DiaFlow</h1>
          <p className="text-xs text-slate-500">
            Control diario de diabetes
          </p>
        </div>

        <nav className="px-2 py-4 flex-1 space-y-1">
          {/* he decidido poner el dashboard en la raíz */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/glucosa"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Glucosa
          </NavLink>
          <NavLink
            to="/inventario"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Inventario
          </NavLink>
          <NavLink
            to="/comidas"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Comidas
          </NavLink>
          <NavLink
            to="/dosis"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Dosis
          </NavLink>
          <NavLink
            to="/kits"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Kits
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Reportes
          </NavLink>
        </nav>

        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-600">
          {user && (
            <p className="mb-2">
              Sesión: <span className="font-medium">{user.username}</span>
            </p>
          )}
          <button
            onClick={logout}
            className="text-red-600 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Barra superior opcional (podríamos poner más info aquí) */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-end px-6 text-sm text-slate-600">
          {/* Aquí podrías añadir más info del usuario, país, etc. */}
        </header>

        <div className="px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
