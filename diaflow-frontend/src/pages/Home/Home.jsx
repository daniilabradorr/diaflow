import React, { useMemo } from "react";
import { Link } from "react-router-dom";

// Hooks de datos
import { useGlucemias } from "../../api/hooks/useGlucemias";
import { useInsumos } from "../../api/hooks/useInsumos";
import { useAlertas } from "../../api/hooks/useAlertas";
import { useDosis } from "../../api/hooks/useDosis";
import { useComidas } from "../../api/hooks/useComidas";

// Gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Home() {
  // --- Fechas para glucosa (últimos 7 días) + hoy ---
  const { filtrosGlucosa, hoyISO } = useMemo(() => {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    const toDateOnly = (d) => d.toISOString().split("T")[0];

    const hoyStr = toDateOnly(hoy);
    const desdeStr = toDateOnly(hace7Dias);

    return {
      filtrosGlucosa: {
        // rango [hace 7 días 00:00, hoy 23:59]
        desde: `${desdeStr}T00:00:00`,
        hasta: `${hoyStr}T23:59:59`,
      },
      hoyISO: hoyStr,
    };
  }, []);

  // --- Glucemias últimos 7 días ---
  const glucQuery = useGlucemias(filtrosGlucosa);
  const glucemias = glucQuery.data ?? [];
  const glucLoading = glucQuery.isLoading;

  // --- Insumos ---
  const insuQuery = useInsumos();
  const insumos = insuQuery.data ?? [];
  const insuLoading = insuQuery.isLoading;

  // --- Alertas activas ---
  const alertQuery = useAlertas(true);
  const alertas = alertQuery.data ?? [];
  const alertLoading = alertQuery.isLoading;

  // --- Dosis hoy ---
  const dosisQuery = useDosis({
    desde: `${hoyISO}T00:00:00`,
    hasta: `${hoyISO}T23:59:59`,
  });
  const dosis = dosisQuery.data ?? [];
  const dosisHoy = dosis.length;

  // --- Comidas hoy ---
  const comidasQuery = useComidas({
    desde: `${hoyISO}T00:00:00`,
    hasta: `${hoyISO}T23:59:59`,
  });
  const comidas = comidasQuery.data ?? [];
  const comidasHoy = comidas.length;

  // --- Cálculos de métricas de glucosa ---
  const {
    ultimaGlucemia,
    mediaGlucosa,
    minGlucosa,
    maxGlucosa,
    tirPct,
    objetivoMin,
    objetivoMax,
    datosGrafico,
    ultimasLecturas,
  } = useMemo(() => {
    if (!Array.isArray(glucemias) || glucemias.length === 0) {
      return {
        ultimaGlucemia: null,
        mediaGlucosa: null,
        minGlucosa: null,
        maxGlucosa: null,
        tirPct: null,
        objetivoMin: 70,
        objetivoMax: 180,
        datosGrafico: [],
        ultimasLecturas: [],
      };
    }

    const objetivoMinLocal = 70;
    const objetivoMaxLocal = 180;

    const ordenadas = [...glucemias].sort(
      (a, b) => new Date(a.medido_en) - new Date(b.medido_en)
    );
    const valores = ordenadas.map((g) => g.valor_mg_dl);
    const suma = valores.reduce((acc, v) => acc + v, 0);
    const media = suma / valores.length;
    const min = Math.min(...valores);
    const max = Math.max(...valores);

    const enRangoCount = ordenadas.filter(
      (g) =>
        g.valor_mg_dl >= objetivoMinLocal &&
        g.valor_mg_dl <= objetivoMaxLocal
    ).length;
    const tir = Math.round((enRangoCount / valores.length) * 100);

    // Datos agregados por día para el gráfico
    const datosPorDia = {};
    for (let g of ordenadas) {
      const fecha = new Date(g.medido_en).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!datosPorDia[fecha]) {
        datosPorDia[fecha] = { fecha: fecha, suma: 0, count: 0 };
      }
      datosPorDia[fecha].suma += g.valor_mg_dl;
      datosPorDia[fecha].count += 1;
    }
    const datosGraf = Object.values(datosPorDia).map((entry) => ({
      fecha: entry.fecha,
      valor: Math.round(entry.suma / entry.count),
    }));

    const ultimas = [...ordenadas].slice(-5).reverse();

    return {
      ultimaGlucemia: ordenadas[ordenadas.length - 1],
      mediaGlucosa: media.toFixed(1),
      minGlucosa: min,
      maxGlucosa: max,
      tirPct: tir,
      objetivoMin: objetivoMinLocal,
      objetivoMax: objetivoMaxLocal,
      datosGrafico: datosGraf,
      ultimasLecturas: ultimas,
    };
  }, [glucemias]);

  // --- Identificar insumos en stock crítico ---
  const stockCritico = useMemo(
    () =>
      insumos.filter(
        (i) =>
          i.stock_minimo != null &&
          i.stock_actual != null &&
          i.stock_actual < i.stock_minimo
      ),
    [insumos]
  );

  const hayCargando =
    glucLoading ||
    insuLoading ||
    alertLoading ||
    dosisQuery.isLoading ||
    comidasQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <header className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Panel general</h2>
        <p className="text-sm text-slate-500">
          Resumen rápido de tu control de glucosa, dosis, comidas e inventario
          en la última semana.
        </p>
      </header>

      {/* Estado de carga */}
      {hayCargando && (
        <p className="text-sm text-slate-500">
          Cargando datos del panel...
        </p>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Última glucemia */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Última glucemia
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {ultimaGlucemia ? `${ultimaGlucemia.valor_mg_dl} mg/dL` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {ultimaGlucemia
              ? new Date(ultimaGlucemia.medido_en).toLocaleString("es-ES")
              : "Sin lecturas recientes"}
          </p>
        </div>

        {/* Media últimos 7 días */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Media últimos 7 días
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {mediaGlucosa ? `${mediaGlucosa} mg/dL` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Min: {minGlucosa ?? "—"} • Max: {maxGlucosa ?? "—"}
          </p>
        </div>

        {/* Tiempo en rango */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Tiempo en rango
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {tirPct != null ? `${tirPct}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Objetivo: {objetivoMin}–{objetivoMax} mg/dL
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${tirPct || 0}%` }}
            />
          </div>
        </div>

        {/* Alertas e inventario */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Alertas e inventario
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {alertas.length}{" "}
            <span className="text-sm text-slate-500">alertas</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stockCritico.length} insumo(s) en nivel crítico
          </p>
        </div>

        {/* Dosis hoy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Dosis hoy
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dosisQuery.isLoading ? "…" : dosisHoy}
          </p>
          <p className="mt-1 text-xs text-slate-500">aplicadas</p>
        </div>

        {/* Comidas hoy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Comidas hoy
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {comidasQuery.isLoading ? "…" : comidasHoy}
          </p>
          <p className="mt-1 text-xs text-slate-500">registradas</p>
        </div>
      </section>

      {/* Atajos rápidos */}
      <section className="mt-2">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Atajos rápidos
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <Link
            to="/glucosa"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Glucosa
          </Link>
          <Link
            to="/dosis"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Dosis
          </Link>
          <Link
            to="/comidas"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Comidas
          </Link>
          <Link
            to="/inventario"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Inventario
          </Link>
          <Link
            to="/kits"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Kits
          </Link>
          <Link
            to="/reportes"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50"
          >
            Reportes
          </Link>
          <Link
            to="/public-qr"
            className="bg-white border rounded p-2 text-center shadow-sm hover:bg-slate-50 col-span-3"
          >
            Mi QR Público
          </Link>
        </div>
      </section>

      {/* Zona principal: gráfico + panel lateral */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Gráfico de glucosa */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">
              Evolución de glucosa (últimos 7 días)
            </h3>
            <p className="text-xs text-slate-500">
              {glucemias.length} lectura(s) en el periodo
            </p>
          </div>
          <div className="h-64 w-full">
            {datosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">
                No hay datos suficientes para el gráfico.
              </p>
            )}
          </div>
        </div>

        {/* Panel lateral: últimas lecturas + stock crítico + alertas */}
        <div className="space-y-4">
          {/* Últimas lecturas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">
              Últimas lecturas
            </h3>
            {ultimasLecturas.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {ultimasLecturas.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between border-b last:border-b-0 pb-1"
                  >
                    <span className="text-slate-700">
                      {new Date(g.medido_en).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-semibold">
                      {g.valor_mg_dl}{" "}
                      <span className="text-xs text-slate-500">mg/dL</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                Aún no hay lecturas registradas.
              </p>
            )}
          </div>

          {/* Stock crítico */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">
              Insumos en nivel crítico
            </h3>
            {stockCritico.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {stockCritico.map((ins) => (
                  <li key={ins.id} className="flex justify-between">
                    <span className="text-slate-700">{ins.nombre}</span>
                    <span className="text-xs text-red-600 font-semibold">
                      {ins.stock_actual} / {ins.stock_minimo} {ins.unidad}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-600">
                Todo el inventario está por encima del mínimo.
              </p>
            )}
          </div>

          {/* Alertas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">
              Alertas activas
            </h3>
            {alertas.length > 0 ? (
              <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {alertas.map((al) => (
                  <li
                    key={al.id}
                    className="border rounded px-3 py-2 bg-yellow-50 text-xs"
                  >
                    <p className="font-semibold">
                      {al.titulo || al.tipo || "Alerta de stock"}
                    </p>
                    <p className="text-slate-700">{al.mensaje}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No hay alertas activas ahora mismo.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;