import React, { useMemo, useState } from "react";
import {
  useReporteGlucosa,
  useReporteInventario,
} from "../../api/hooks/useReportes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ReportesPage() {
  // filtros de fecha para glucosa
  const [desdeDate, setDesdeDate] = useState("");
  const [hastaDate, setHastaDate] = useState("");

  const filtrosGlucosa = useMemo(() => {
    const f = {};
    if (desdeDate) f.desde = `${desdeDate}T00:00:00`;
    if (hastaDate) f.hasta = `${hastaDate}T23:59:59`;
    return f;
  }, [desdeDate, hastaDate]);

  const {
    data: resumenGlucosa,
    isLoading: loadingGlucosa,
    isError: errorGlucosa,
  } = useReporteGlucosa(filtrosGlucosa);

  const {
    data: resumenInventario,
    isLoading: loadingInv,
    isError: errorInv,
  } = useReporteInventario();

  // Datos para gráfico de barras (min, promedio, max)
  const dataGraficoGlucosa = useMemo(() => {
    if (!resumenGlucosa) return [];
    return [
      { nombre: "Mín", valor: resumenGlucosa.min },
      { nombre: "Media", valor: resumenGlucosa.promedio },
      { nombre: "Máx", valor: resumenGlucosa.max },
    ];
  }, [resumenGlucosa]);

  const bajoMinimo = resumenInventario?.bajo_minimo || [];

  // Export CSV del resumen de glucosa
  function handleExportCsv() {
    if (!resumenGlucosa) return;

    const filas = [
      [
        "desde",
        "hasta",
        "promedio",
        "min",
        "max",
        "en_rango_pct",
        "total",
        "objetivo_min",
        "objetivo_max",
      ],
      [
        resumenGlucosa.desde || "",
        resumenGlucosa.hasta || "",
        resumenGlucosa.promedio ?? "",
        resumenGlucosa.min ?? "",
        resumenGlucosa.max ?? "",
        resumenGlucosa.en_rango_pct ?? "",
        resumenGlucosa.total ?? "",
        resumenGlucosa.objetivo_min ?? "",
        resumenGlucosa.objetivo_max ?? "",
      ],
    ];

    const csvContent = filas
      .map((fila) =>
        fila
          .map((v) => {
            const s = String(v ?? "");
            // escapamos comas y comillas
            if (s.includes(",") || s.includes('"')) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const desdeLabel = desdeDate || "inicio";
    const hastaLabel = hastaDate || "hoy";
    a.href = url;
    a.download = `reporte_glucosa_${desdeLabel}_${hastaLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reportes</h2>

      {/* Filtros para glucosa */}
      <section className="mb-6 p-4 border rounded">
        <h3 className="font-semibold mb-3">Rango de fechas (glucosa)</h3>
        <div className="flex flex-wrap gap-4 items-end">
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

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!resumenGlucosa}
            className="ml-auto bg-blue-600 text-white text-sm px-4 py-1 rounded"
          >
            Exportar CSV
          </button>
        </div>
      </section>

      {/* Resumen glucosa */}
      <section className="mb-8">
        <h3 className="font-semibold mb-3">Resumen de glucosa</h3>

        {loadingGlucosa && <p>Cargando resumen de glucosa...</p>}
        {errorGlucosa && (
          <p className="text-red-600 text-sm">
            Error al cargar el reporte de glucosa.
          </p>
        )}

        {resumenGlucosa && (
          <>
            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="border rounded p-3">
                <p className="text-xs text-gray-500">Promedio</p>
                <p className="text-xl font-bold">
                  {Math.round(resumenGlucosa.promedio ?? 0)} mg/dL
                </p>
              </div>
              <div className="border rounded p-3">
                <p className="text-xs text-gray-500">Mínimo</p>
                <p className="text-xl font-bold">
                  {resumenGlucosa.min ?? "-"} mg/dL
                </p>
              </div>
              <div className="border rounded p-3">
                <p className="text-xs text-gray-500">Máximo</p>
                <p className="text-xl font-bold">
                  {resumenGlucosa.max ?? "-"} mg/dL
                </p>
              </div>
              <div className="border rounded p-3">
                <p className="text-xs text-gray-500">% en rango</p>
                <p className="text-xl font-bold">
                  {resumenGlucosa.en_rango_pct ?? 0}%
                </p>
                {resumenGlucosa.objetivo_min != null &&
                  resumenGlucosa.objetivo_max != null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Rango objetivo: {resumenGlucosa.objetivo_min}–
                      {resumenGlucosa.objetivo_max} mg/dL
                    </p>
                  )}
              </div>
            </div>

            {/* Barra visual de % en rango */}
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-1">
                Tiempo en rango (aprox.)
              </p>
              <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                <div
                  className="h-3 bg-green-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, resumenGlucosa.en_rango_pct ?? 0)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Gráfico de barras min/media/max */}
            <div className="w-full h-64 border rounded p-3">
              <h4 className="font-semibold mb-2 text-sm">
                Distribución de valores (min / media / máx)
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGraficoGlucosa}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="valor" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Total de mediciones en el rango seleccionado:{" "}
              <strong>{resumenGlucosa.total ?? 0}</strong>
            </p>
          </>
        )}

        {!loadingGlucosa && !errorGlucosa && !resumenGlucosa && (
          <p className="text-sm text-gray-600">
            No hay datos de glucosa para el rango seleccionado.
          </p>
        )}
      </section>

      {/* Resumen inventario */}
      <section className="mb-8">
        <h3 className="font-semibold mb-3">Inventario – Bajo mínimo</h3>

        {loadingInv && <p>Cargando resumen de inventario...</p>}
        {errorInv && (
          <p className="text-red-600 text-sm">
            Error al cargar el reporte de inventario.
          </p>
        )}

        {!loadingInv && !errorInv && bajoMinimo.length === 0 && (
          <p className="text-sm text-gray-600">
            No hay insumos por debajo del stock mínimo. 🎉
          </p>
        )}

        {bajoMinimo.length > 0 && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Insumo</th>
                <th className="border px-2 py-1 text-right">Stock actual</th>
                <th className="border px-2 py-1 text-right">Stock mínimo</th>
                <th className="border px-2 py-1 text-left">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {bajoMinimo.map((ins) => (
                <tr key={ins.id}>
                  <td className="border px-2 py-1">{ins.nombre}</td>
                  <td className="border px-2 py-1 text-right">
                    {ins.stock_actual}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {ins.stock_minimo}
                  </td>
                  <td className="border px-2 py-1">{ins.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default ReportesPage;