import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

/**
 * Helpers
 */
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * LISTA de kits
 */
export function useKits() {
  return useQuery({
    queryKey: ["kits"],
    queryFn: async () => {
      const resp = await api.get("kits/");
      return normalizeList(resp.data);
    },
  });
}

/**
 * DETALLE de un kit concreto (incluye elementos)
 */
export function useKitDetalle(kitId) {
  return useQuery({
    queryKey: ["kit-detalle", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/`);
      return resp.data; // objeto { id, nombre, descripcion, elementos: [...] }
    },
  });
}

/**
 * CREAR / EDITAR kit (nombre, descripcion, etc.)
 */
export function useSaveKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const resp = await api.patch(`kits/${id}/`, payload);
        return resp.data;
      } else {
        const resp = await api.post("kits/", payload);
        return resp.data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["kits"]);
      const kitId = variables.id || data?.id;
      if (kitId) {
        queryClient.invalidateQueries(["kit-detalle", kitId]);
      }
    },
  });
}

/**
 * BORRAR kit
 */
export function useDeleteKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`kits/${id}/`);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries(["kits"]);
      if (id) {
        queryClient.invalidateQueries(["kit-detalle", id]);
        queryClient.invalidateQueries(["kit-qr", id]);
        queryClient.invalidateQueries(["kit-verificaciones", id]);
      }
    },
  });
}

/**
 * GUARDAR elementos (bulk upsert)
 * El backend espera los elementos en una lista bajo la clave "items"
 */
export function useSaveElementosKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kitId, elementos }) => {
      const resp = await api.post(`kits/${kitId}/elementos/`, {
        items: elementos,
      });
      return resp.data;
    },
    onSuccess: (_data, variables) => {
      if (variables.kitId) {
        queryClient.invalidateQueries(["kit-detalle", variables.kitId]);
      }
    },
  });
}

/**
 * QR de un kit (token + data_url, url pública, etc.)
 */
export function useQrKit(kitId) {
  return useQuery({
    queryKey: ["kit-qr", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/qr/`);
      return resp.data; // { token, url, png, data_url }
    },
  });
}

/**
 * Rotar token del kit (para generar un nuevo token/QR)
 */
export function useRotateKitToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kitId) => {
      const resp = await api.post(`kits/${kitId}/rotate_token/`);
      return resp.data;
    },
    onSuccess: (_data, kitId) => {
      if (kitId) {
        queryClient.invalidateQueries(["kit-qr", kitId]);
        queryClient.invalidateQueries(["kit-detalle", kitId]);
      }
    },
  });
}

/**
 * Historial de verificaciones de un kit
 */
export function useVerificacionesKit(kitId) {
  return useQuery({
    queryKey: ["kit-verificaciones", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/verificaciones/`);
      return normalizeList(resp.data);
    },
  });
}