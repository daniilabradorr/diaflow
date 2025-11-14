import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const backendBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

function PublicQR() {
  const { token } = useParams();
  const [data, setData] = useState(null);          // {kit, elementos}
  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [items, setItems] = useState([]);          // [{elemento_id, ok}]
  const [resultado, setResultado] = useState(null);
  const [sending, setSending] = useState(false);

  // Cargar kit + elementos
  useEffect(() => {
    async function fetchKit() {
      try {
        setEstado("loading");
        const resp = await fetch(`${backendBase}/qr/${token}`);
        if (!resp.ok) throw new Error("Error al obtener kit");
        const json = await resp.json();
        setData(json);

        // estado inicial: todo marcado como OK
        if (json.elementos) {
          setItems(
            json.elementos.map((e) => ({
              elemento_id: e.id,
              ok: true,
            }))
          );
        }

        setEstado("ok");
      } catch (e) {
        console.error(e);
        setEstado("error");
      }
    }

    if (token) {
      fetchKit();
    }
  }, [token]);

  function toggleItem(elementoId) {
    setItems((prev) =>
      prev.map((it) =>
        it.elemento_id === elementoId ? { ...it, ok: !it.ok } : it
      )
    );
  }

  async function handleVerify() {
    if (!token) return;
    setSending(true);
    setResultado(null);

    try {
      const resp = await fetch(`${backendBase}/qr/${token}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const json = await resp.json();
      setResultado(json);
    } catch (e) {
      console.error(e);
      setResultado({
        ok: false,
        mensaje: "No se ha podido enviar la verificación.",
      });
    } finally {
      setSending(false);
    }
  }

  if (estado === "loading") {
    return <p className="p-4">Cargando información del kit...</p>;
  }

  if (estado === "error" || !data) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Kit no disponible</h2>
        <p className="text-sm">
          No se ha podido cargar el kit. Puede que el código QR haya caducado o
          sea incorrecto.
        </p>
      </div>
    );
  }

  const { kit, elementos } = data;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">{kit.nombre}</h1>
      {kit.descripcion && (
        <p className="mb-4 text-sm text-gray-700">{kit.descripcion}</p>
      )}

      <h2 className="font-semibold mb-2">Revisión del kit</h2>
      <p className="text-sm mb-3">
        Marca si cada elemento está presente. Después pulsa{" "}
        <strong>Verificar</strong>.
      </p>

      <div className="space-y-2 mb-4">
        {elementos && elementos.length > 0 ? (
          elementos.map((el) => {
            const item = items.find((i) => i.elemento_id === el.id);
            const ok = item ? item.ok : false;
            return (
              <label
                key={el.id}
                className="flex items-center gap-2 border rounded px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={ok}
                  onChange={() => toggleItem(el.id)}
                />
                <div className="text-sm">
                  <p className="font-medium">
                    {el.etiqueta} – {el.cantidad_requerida} {el.unidad}
                  </p>
                  <p className="text-xs text-gray-600">
                    {ok ? "Está en el kit" : "FALTA"}
                  </p>
                </div>
              </label>
            );
          })
        ) : (
          <p>No hay elementos definidos para este kit.</p>
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={sending}
        className="w-full bg-blue-600 text-white text-sm py-2 rounded mb-3"
      >
        {sending ? "Enviando verificación..." : "Verificar"}
      </button>

      {resultado && (
        <div
          className={`p-3 rounded text-sm ${
            resultado.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {resultado.mensaje
            ? resultado.mensaje
            : resultado.ok
            ? "Kit completo. ¡Todo en orden! ✅"
            : "Faltan elementos en el kit."}

          {resultado.faltantes && resultado.faltantes.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {resultado.faltantes.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PublicQR;