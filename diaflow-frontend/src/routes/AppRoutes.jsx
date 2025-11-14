import React from "react";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import Layout from "../components/common/Layout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PublicQR from "../pages/PublicQr/PublicQR";
import GlucosaPage from "../pages/Glucosa/GlucosaPage";
import InventarioPage from "../pages/Inventario/InventarioPage";
import ComidasPage from "../pages/Comidas/ComidasPage";
import DosisPage from "../pages/Dosis/DosisPage";
import KitsPage from "../pages/Kits/KitsPage";
import ReportesPage from "../pages/Reportes/ReportesPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/qr/:token" element={<PublicQR />} />

      {/* Privadas */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/glucosa" element={<GlucosaPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/comidas" element={<ComidasPage />} />
          <Route path="/dosis" element={<DosisPage />} />
          <Route path="/kits" element={<KitsPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          {/* Las demás rutas las iremos añadiendo: */}
          {/* <Route path="/glucosa" element={<GlucosaPage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;