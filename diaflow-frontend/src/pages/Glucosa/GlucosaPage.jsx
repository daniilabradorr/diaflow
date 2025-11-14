import React, { useState, useMemo } from "react";
import {
  useGlucemias,
  useSaveGlucemia,
  useDeleteGlucemia,
} from "../../api/hooks/useGlucemias";

// form + validación
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// gráficas
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// esquema de validación del formulario
const glucosaSchema = z.object({
  valor_mg_dl: z
    .coerce.number()
    .min(20, "Mínimo 20 mg/dL")
    .max(600, "Máximo 600 mg/dL"),
  medido_en: z.string().min(1, "La fecha/hora es obligatoria"),
  fuente: z.string().optional(),
  notas: z.string().optional(),
});

function GlucosaPage() {
  // filtros de fecha
  const [desdeDate, setDesdeDate] = useState("");
  const [hastaDate, setHastaDate] = useState("");

  // id que estamos editando (null = nuevo registro)
  const [editingId, setEditingId] = useState(null);

  // aquí construyo los filtros para el hook
  const filtros = useMemo(() => {
    const f = {};
    if (desdeDate) f.desde = `${desdeDate}T00:00:00`;
    if (hastaDate) f.hasta = `${hastaDate}T23:59:59`;
    return f;
  }, [desdeDate, hastaDate]);

  // query de datos
  const {
    data: glucemias,
    isLoading,
    isError,
  } = useGlucemias(filtros);

  // Mutations
  const saveMutation = useSaveGlucemia();
  const deleteMutation = useDeleteGlucemia();

  // formulario (alta / edición)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(glucosaSchema),
    defaultValues: {
      valor_mg_dl: "",
      medido_en: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
      fuente: "",
      notas: "",
    },
  });

  // enviar formulario
  async function onSubmit(formData) {
    const payload = {
      valor_mg_dl: formData.valor_mg_dl,
      medido_en: new Date(formData.medido_en).toISOString(),
      fuente: formData.fuente || "",
      notas: formData.notas || "",
    };

    try {
      await saveMutation.mutateAsync({ id: editingId, payload });

      // reset al modo "nuevo registro"
      reset({
        valor_mg_dl: "",
        medido_en: new Date().toISOString().slice(0, 16),
        fuente: "",
        notas: "",
      });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      // aquí podrías usar un Toast de error
    }
  }

  // empezar a editar un registro existente
  function startEdit(registro) {
    setEditingId(registro.id);
    reset({
      valor_mg_dl: registro.valor_mg_dl,
      // adaptar al formato que espera <input type="datetime-local">
      medido_en: registro.medido_en.slice(0, 16),
      fuente: registro.fuente || "",
      notas: registro.notas || "",
    });
  }

  // cancelar edición
  function cancelEdit() {
    setEditingId(null);
    reset({
      valor_mg_dl: "",
      medido_en: new Date().toISOString().slice(0, 16),
      fuente: "",
      notas: "",
    });
  }

  // datos ordenados para el gráfico
  const dataGrafico = useMemo(() => {
    if (!glucemias) return [];
    const copia = [...glucemias];
    copia.sort(
      (a, b) =>
        new Date(a.medido_en).getTime() - new Date(b.medido_en).getTime()
    );
    return copia.map((g) => ({
      ...g,
      fechaLabel: new Date(g.medido_en).toLocaleString(),
    }));
  }, [glucemias]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Glucosa capilar</h2>

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

      {/* Formulario alta / edición */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 p-4 border rounded space-y-3 max-w-xl"
      >
        <h3 className="font-semibold mb-2">
          {editingId ? "Editar registro" : "Nuevo registro"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">Valor (mg/dL)</label>
            <input
              type="number"
              step="1"
              className="border rounded px-2 py-1 text-sm w-32"
              {...register("valor_mg_dl")}
            />
            {errors.valor_mg_dl && (
              <p className="text-xs text-red-600">
                {errors.valor_mg_dl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-sm"
              {...register("medido_en")}
            />
            {errors.medido_en && (
              <p className="text-xs text-red-600">
                {errors.medido_en.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm mb-1">Fuente</label>
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="Capilar, CGM, etc."
              {...register("fuente")}
            />
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
            disabled={isSubmitting || saveMutation.isLoading}
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

      {/* estados de carga / error */}
      {isLoading && <p>Cargando registros...</p>}
      {isError && (
        <p className="text-red-600">
          Error al cargar los registros de glucosa.
        </p>
      )}

      {/* Tabla de registros */}
      {glucemias && glucemias.length > 0 ? (
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Fecha</th>
              <th className="border px-2 py-1 text-right">Valor</th>
              <th className="border px-2 py-1 text-left">Fuente</th>
              <th className="border px-2 py-1 text-left">Notas</th>
              <th className="border px-2 py-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {glucemias.map((g) => (
              <tr key={g.id}>
                <td className="border px-2 py-1">
                  {new Date(g.medido_en).toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-right">
                  {g.valor_mg_dl}
                </td>
                <td className="border px-2 py-1">{g.fuente}</td>
                <td className="border px-2 py-1">{g.notas}</td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    type="button"
                    className="text-blue-600 text-xs"
                    onClick={() => startEdit(g)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-red-600 text-xs"
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Seguro que quieres borrar este registro?"
                        )
                      ) {
                        deleteMutation.mutate(g.id);
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
        !isLoading && <p>No hay registros en este rango.</p>
      )}

      {/* Gráfico */}
      {dataGrafico.length > 0 && (
        <div className="w-full h-64">
          <h3 className="font-semibold mb-2">Evolución de la glucosa</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fechaLabel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="valor_mg_dl"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default GlucosaPage;