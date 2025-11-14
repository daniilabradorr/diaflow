import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axios";

// LISTA de kits
export function useKits() {
  return useQuery({
    queryKey: ["kits"],
    queryFn: async () => {
      const resp = await api.get("kits/");
      return resp.data; // array de kits
    },
  });
}

// DETALLE de un kit concreto (incluye elementos)
export function useKitDetalle(kitId) {
  return useQuery({
    queryKey: ["kit-detalle", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/`);
      return resp.data; // {id, nombre, descripcion, elementos: [...]}
    },
  });
}

// CREAR / EDITAR kit (nombre, descripcion, etc.)
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
    onSuccess: () => {
      queryClient.invalidateQueries(["kits"]);
    },
  });
}

// BORRAR kit
export function useDeleteKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`kits/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["kits"]);
    },
  });
}

// GUARDAR elementos (bulk upsert)
export function useSaveElementosKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kitId, elementos }) => {
      // asumimos que el backend espera un array de elementos
      // [{id?, etiqueta, cantidad_requerida, unidad}]
      const resp = await api.post(`kits/${kitId}/elementos/`, elementos);
      return resp.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(["kit-detalle", variables.kitId]);
    },
  });
}

// QR de un kit (token + data_url)
export function useQrKit(kitId) {
  return useQuery({
    queryKey: ["kit-qr", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/qr/`);
      return resp.data; // {token, url, png, data_url}
    },
  });
}

// Historial de verificaciones de un kit
export function useVerificacionesKit(kitId) {
  return useQuery({
    queryKey: ["kit-verificaciones", kitId],
    enabled: !!kitId,
    queryFn: async () => {
      const resp = await api.get(`kits/${kitId}/verificaciones/`);
      return resp.data; // array de verificaciones
    },
  });
}

//rotar token del kit (paragenerar un nuevo token/QR)
export function useRotateKitToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kitId) => {
      const resp = await api.post(`kits/${kitId}/rotate_token/`);
      return resp.data;
    },
    onSuccess: (_data, kitId) => {
      queryClient.invalidateQueries(["kit-qr", kitId]);
      queryClient.invalidateQueries(["kit-detalle", kitId]);
    },
  });
}