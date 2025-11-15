import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

export function useDosis(filtros) {
  return useQuery({
    queryKey: ["dosis", filtros],
    queryFn: async () => {
      const params = {};
      if (filtros?.desde) params.desde = filtros.desde;
      if (filtros?.hasta) params.hasta = filtros.hasta;
      if (filtros?.tipo && filtros.tipo !== "todas") params.tipo = filtros.tipo;

      const resp = await api.get("dosis/", { params });
      const data = resp.data;

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
  });
}

export function useSaveDosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const resp = await api.patch(`dosis/${id}/`, payload);
        return resp.data;
      } else {
        const resp = await api.post("dosis/", payload);
        return resp.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dosis"]);
    },
  });
}

export function useDeleteDosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`dosis/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dosis"]);
    },
  });
}