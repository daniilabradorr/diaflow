import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

// LISTAR insumos
export function useInsumos() {
  return useQuery({
    queryKey: ["insumos"],
    queryFn: async () => {
      const resp = await api.get("insumos/");
      return resp.data;
    },
  });
}

// GUARDAR (crear / editar) insumo
export function useSaveInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const resp = await api.patch(`insumos/${id}/`, payload);
        return resp.data;
      } else {
        const resp = await api.post("insumos/", payload);
        return resp.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["insumos"]);
    },
  });
}

// CREAR movimiento (entrada / salida)
export function useMovimientoInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ insumoId, payload }) => {
      const resp = await api.post(`insumos/${insumoId}/movimientos/`, payload);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["insumos"]);
    },
  });
}