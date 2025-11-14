import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

export function useComidas(filtros) {
  return useQuery({
    queryKey: ["comidas", filtros],
    queryFn: async () => {
      const params = {};
      if (filtros?.desde) params.desde = filtros.desde;
      if (filtros?.hasta) params.hasta = filtros.hasta;
      const resp = await api.get("comidas/", { params });
      return resp.data;
    },
  });
}

export function useSaveComida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const resp = await api.patch(`comidas/${id}/`, payload);
        return resp.data;
      } else {
        const resp = await api.post("comidas/", payload);
        return resp.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comidas"]);
    },
  });
}

export function useDeleteComida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`comidas/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comidas"]);
    },
  });
}