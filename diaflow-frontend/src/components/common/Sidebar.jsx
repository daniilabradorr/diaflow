import React from "react";
import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
const linkInactive =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const linkActive = "bg-blue-50 text-blue-700";

function Sidebar({ isOpen, onClose }) {
  const getLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? linkActive : linkInactive}`;

  return (
    <>
      {/* Overlay en móvil */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transform transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Cabecera */}
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">DiaFlow</h1>
            <p className="text-xs text-slate-500">
              Control diario de diabetes
            </p>
          </div>

          {/* Botón cerrar solo en móvil */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-slate-100"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <span className="block w-3.5 h-[2px] bg-slate-700 rotate-45 translate-y-[1px]" />
            <span className="block w-3.5 h-[2px] bg-slate-700 -rotate-45 -translate-y-[1px]" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="px-2 py-4 flex-1 space-y-1 overflow-y-auto">
          <NavLink to="/" end onClick={onClose} className={getLinkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/glucosa" onClick={onClose} className={getLinkClass}>
            Glucosa
          </NavLink>

          <NavLink to="/inventario" onClick={onClose} className={getLinkClass}>
            Inventario
          </NavLink>

          <NavLink to="/comidas" onClick={onClose} className={getLinkClass}>
            Comidas
          </NavLink>

          <NavLink to="/dosis" onClick={onClose} className={getLinkClass}>
            Dosis
          </NavLink>

          <NavLink to="/kits" onClick={onClose} className={getLinkClass}>
            Kits
          </NavLink>

          <NavLink to="/reportes" onClick={onClose} className={getLinkClass}>
            Reportes
          </NavLink>

          <NavLink to="/public-qr" onClick={onClose} className={getLinkClass}>
            QR público
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
