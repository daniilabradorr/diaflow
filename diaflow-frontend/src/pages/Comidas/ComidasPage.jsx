import React, { useMemo, useState } from "react";
import { useComidas, useSaveComida, useDeleteComida } from "../../api/hooks/useComidas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  carbohidratos_g: z
    .coerce.number()
    .min(0, "Debe ser mayor o igual que 0"),
  descripcion: z.string().min(1, "Descripción obligatoria"),
  notas: z.string().optional(),
});

function ComidasPage() {
  const [desdeDate, setDesdeDate] = useState("");
  const [hastaDate, setHastaDate] = useState("");
  const filtros = useMemo(() => {
    const f = {};
    if (desdeDate) f.desde = `${desdeDate}T00:00:00`;
    if (hastaDate) f.hasta = `${hastaDate}T23:59:59`;
    return f;
  }, [desdeDate, hastaDate]);

  const { data: comidas, isLoading, isError } = useComidas(filtros);
  const saveComida = useSaveComida();
  const deleteComida = useDeleteComida();

  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 16),
      carbohidratos_g: "",
      descripcion: "",
      notas: "",
    },
  });

  async function onSubmit(data) {
    const payload = {
      fecha: new Date(data.fecha).toISOString(),
      carbohidratos_g: data.carbohidratos_g,
      descripcion: data.descripcion,
      notas: data.notas || "",
    };

    await saveComida.mutateAsync({ id: editingId, payload });

    setEditingId(null);
    reset({
      fecha: new Date().toISOString().slice(0, 16),
      carbohidratos_g: "",
      descripcion: "",
      notas: "",
    });
  }

  function startEdit(comida) {
    setEditingId(comida.id);
    reset({
      fecha: comida.fecha.slice(0, 16),
      carbohidratos_g: comida.carbohidratos_g,
      descripcion: comida.descripcion,
      notas: comida.notas || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    reset({
      fecha: new Date().toISOString().slice(0, 16),
      carbohidratos_g: "",
      descripcion: "",
      notas: "",
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comidas</h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input
            type="date"
            value={desdeDate}
            onChange={(e) => setDesdeDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input
            type="date"
            value={hastaDate}
            onChange={(e) => setHastaDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setDesdeDate("");
            setHastaDate("");
          }}
          className="text-sm border px-3 py-1 rounded"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 p-4 border rounded space-y-3 max-w-xl"
      >
        <h3 className="font-semibold mb-2">
          {editingId ? "Editar comida" : "Nueva comida"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-sm"
              {...register("fecha")}
            />
            {errors.fecha && (
              <p className="text-xs text-red-600">
                {errors.fecha.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Carbohidratos (g)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-28"
              {...register("carbohidratos_g")}
            />
            {errors.carbohidratos_g && (
              <p className="text-xs text-red-600">
                {errors.carbohidratos_g.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full"
            {...register("descripcion")}
          />
          {errors.descripcion && (
            <p className="text-xs text-red-600">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Notas</label>
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full"
            {...register("notas")}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white text-sm px-4 py-1 rounded"
          >
            {editingId ? "Guardar cambios" : "Añadir"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border text-sm px-3 py-1 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      {isLoading && <p>Cargando comidas...</p>}
      {isError && (
        <p className="text-red-600">Error al cargar las comidas.</p>
      )}

      {comidas && comidas.length > 0 ? (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Fecha</th>
              <th className="border px-2 py-1 text-right">Carbos (g)</th>
              <th className="border px-2 py-1 text-left">Descripción</th>
              <th className="border px-2 py-1 text-left">Notas</th>
              <th className="border px-2 py-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comidas.map((c) => (
              <tr key={c.id}>
                <td className="border px-2 py-1">
                  {new Date(c.fecha).toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-right">
                  {c.carbohidratos_g}
                </td>
                <td className="border px-2 py-1">{c.descripcion}</td>
                <td className="border px-2 py-1">{c.notas}</td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    className="text-xs text-blue-600"
                    onClick={() => startEdit(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-xs text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Seguro que quieres borrar esta comida?"
                        )
                      ) {
                        deleteComida.mutate(c.id);
                      }
                    }}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !isLoading && <p>No hay comidas en este rango.</p>
      )}
    </div>
  );
}

export default ComidasPage;