import React, { useContext } from "react";
import { AuthContext } from "../../auth/AuthProvider";

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 text-sm text-slate-600">
      {/* Botón hamburguesa + título */}
      <div className="flex items-center gap-3">
        {/* Hamburguesa (solo móvil) */}
        <button
          type="button"
          aria-label="Abrir menú"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={onToggleSidebar}
        >
          <span className="sr-only">Abrir menú</span>
          <div className="space-y-0.5">
            <span className="block w-4 h-[2px] bg-slate-700" />
            <span className="block w-4 h-[2px] bg-slate-700" />
            <span className="block w-4 h-[2px] bg-slate-700" />
          </div>
        </button>

        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-slate-700">
            Dashboard
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Resumen general de tu control
          </span>
        </div>
      </div>

      {/* Info de usuario + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex flex-col text-right leading-tight">
            <span className="text-[11px] text-slate-400">Sesión</span>
            <span className="text-xs font-medium text-slate-700">
              {user.username || user.email}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="text-xs font-semibold text-red-600 hover:text-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Navbar;
