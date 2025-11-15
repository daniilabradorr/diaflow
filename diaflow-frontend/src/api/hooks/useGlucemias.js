import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

// helper para construir los params desde un objeto filtros
function buildParams(filters) {
  const params = {};
  if (filters?.desde) params.desde = filters.desde;
  if (filters?.hasta) params.hasta = filters.hasta;
  return params;
}

// LISTAR glucemias
export function useGlucemias(filters) {
  return useQuery({
    queryKey: ["glucemias", filters],
    queryFn: async () => {
      const resp = await api.get("glucemias/", {
        params: buildParams(filters),
      });
      const data = resp.data;

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
  });
}

// CREAR o ACTUALIZAR la glucemia
export function useSaveGlucemia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const resp = await api.patch(`glucemias/${id}/`, payload);
        return resp.data;
      } else {
        const resp = await api.post("glucemias/", payload);
        return resp.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["glucemias"]);
    },
  });
}

// ELIMINAR glucemia
export function useDeleteGlucemia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`glucemias/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["glucemias"]);
    },
  });
}