import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

// LISTAR alertas (por defecto, activas)
export function useAlertas(activas = true) {
  return useQuery({
    queryKey: ["alertas", activas ? "activas" : "inactivas"],
    queryFn: async () => {
      const resp = await api.get("alertas/", {
        params: { activas: activas },
      });
      const data = resp.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
  });
}

// MARCAR alerta como atendida
export function useMarcarAlertaAtendida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const resp = await api.patch(`alertas/${id}/`, payload);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["alertas", "activas"]);
    },
  });
}