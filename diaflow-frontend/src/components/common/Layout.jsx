import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar (fijo en desktop, deslizable en móvil) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Navbar superior */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Contenido principal */}
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
