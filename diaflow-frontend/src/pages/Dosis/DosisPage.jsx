import React, { useMemo, useState } from "react";
import { useDosis, useSaveDosis, useDeleteDosis } from "../../api/hooks/useDosis";
import { useComidas } from "../../api/hooks/useComidas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  tipo: z.enum(["bolo", "basal", "corr"]),
  unidades: z
    .coerce.number()
    .min(0, "Debe ser mayor o igual que 0")
    .max(100, "Máximo 100"),
  comida_id: z.string().optional(),
  notas: z.string().optional(),
});

function DosisPage() {
  const [desdeDate, setDesdeDate] = useState("");
  const [hastaDate, setHastaDate] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todas");

  const filtros = useMemo(() => {
    const f = { tipo: tipoFiltro };
    if (desdeDate) f.desde = `${desdeDate}T00:00:00`;
    if (hastaDate) f.hasta = `${hastaDate}T23:59:59`;
    return f;
  }, [desdeDate, hastaDate, tipoFiltro]);

  const { data: dosis, isLoading, isError } = useDosis(filtros);
  const saveDosis = useSaveDosis();
  const deleteDosis = useDeleteDosis();

  // para el select de comidas (últimas comidas)
  const { data: comidas } = useComidas({}); // sin filtros, DRF ya paginará

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
      tipo: "bolo",
      unidades: "",
      comida_id: "",
      notas: "",
    },
  });

  async function onSubmit(data) {
    const payload = {
      fecha: new Date(data.fecha).toISOString(),
      tipo: data.tipo,
      unidades: data.unidades,
      comida: data.comida_id || null,
      notas: data.notas || "",
    };

    await saveDosis.mutateAsync({ id: editingId, payload });

    setEditingId(null);
    reset({
      fecha: new Date().toISOString().slice(0, 16),
      tipo: "bolo",
      unidades: "",
      comida_id: "",
      notas: "",
    });
  }

  function startEdit(d) {
    setEditingId(d.id);
    reset({
      fecha: d.fecha.slice(0, 16),
      tipo: d.tipo,
      unidades: d.unidades,
      comida_id: d.comida || "",
      notas: d.notas || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    reset({
      fecha: new Date().toISOString().slice(0, 16),
      tipo: "bolo",
      unidades: "",
      comida_id: "",
      notas: "",
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dosis de insulina</h2>

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
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="bolo">Bolo</option>
            <option value="basal">Basal</option>
            <option value="corr">Corrección</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setDesdeDate("");
            setHastaDate("");
            setTipoFiltro("todas");
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
          {editingId ? "Editar dosis" : "Nueva dosis"}
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
            <label className="block text-sm mb-1">Tipo</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              {...register("tipo")}
            >
              <option value="bolo">Bolo</option>
              <option value="basal">Basal</option>
              <option value="corr">Corrección</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Unidades</label>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-24"
              {...register("unidades")}
            />
            {errors.unidades && (
              <p className="text-xs text-red-600">
                {errors.unidades.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[180px]">
            <label className="block text-sm mb-1">
              Comida asociada (opcional)
            </label>
            <select
              className="border rounded px-2 py-1 text-sm w-full"
              {...register("comida_id")}
            >
              <option value="">Sin comida</option>
              {comidas &&
                comidas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {new Date(c.fecha).toLocaleString()} – {c.descripcion}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm mb-1">Notas</label>
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm w-full"
              {...register("notas")}
            />
          </div>
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
      {isLoading && <p>Cargando dosis...</p>}
      {isError && (
        <p className="text-red-600">Error al cargar las dosis.</p>
      )}

      {dosis && dosis.length > 0 ? (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Fecha</th>
              <th className="border px-2 py-1 text-left">Tipo</th>
              <th className="border px-2 py-1 text-right">Unidades</th>
              <th className="border px-2 py-1 text-left">Comida</th>
              <th className="border px-2 py-1 text-left">Notas</th>
              <th className="border px-2 py-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dosis.map((d) => (
              <tr key={d.id}>
                <td className="border px-2 py-1">
                  {new Date(d.fecha).toLocaleString()}
                </td>
                <td className="border px-2 py-1">{d.tipo}</td>
                <td className="border px-2 py-1 text-right">{d.unidades}</td>
                <td className="border px-2 py-1">
                  {d.comida_detalle || d.comida || ""}
                </td>
                <td className="border px-2 py-1">{d.notas}</td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    className="text-xs text-blue-600"
                    onClick={() => startEdit(d)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-xs text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Seguro que quieres borrar esta dosis?"
                        )
                      ) {
                        deleteDosis.mutate(d.id);
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
        !isLoading && <p>No hay dosis en este rango.</p>
      )}
    </div>
  );
}

export default DosisPage;