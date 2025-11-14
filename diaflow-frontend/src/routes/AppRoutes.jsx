import React from "react";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import Layout from "../components/common/Layout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PublicQR from "../pages/PublicQR/PublicQR";

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
          {/* Las demás rutas las iremos añadiendo: */}
          {/* <Route path="/glucosa" element={<GlucosaPage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;