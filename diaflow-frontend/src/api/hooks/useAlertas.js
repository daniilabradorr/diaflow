import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

// LISTAR alertas activas
export function useAlertasActivas() {
  return useQuery({
    queryKey: ["alertas", "activas"],
    queryFn: async () => {
      const resp = await api.get("alertas/", {
        params: { activas: true },
      });
      return resp.data;
    },
  });
}

// MARCAR alerta como atendida
export function useMarcarAlerta() {
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