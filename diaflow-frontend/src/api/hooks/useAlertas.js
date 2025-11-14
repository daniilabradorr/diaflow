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
      return resp.data;
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