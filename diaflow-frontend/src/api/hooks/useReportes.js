import { useQuery } from "@tanstack/react-query";
import api from "../axios";

// Reporte de glucosa (resumen KPIs)
export function useReporteGlucosa(filtros) {
  return useQuery({
    queryKey: ["reporte-glucosa", filtros],
    queryFn: async () => {
      const params = {};
      if (filtros?.desde) params.desde = filtros.desde;
      if (filtros?.hasta) params.hasta = filtros.hasta;
      const resp = await api.get("reportes/glucosa_resumen/", { params });
      return resp.data;
    },
  });
}

// Reporte de inventario
export function useReporteInventario() {
  return useQuery({
    queryKey: ["reporte-inventario"],
    queryFn: async () => {
      const resp = await api.get("reportes/inventario_resumen/");
      return resp.data;
    },
  });
}