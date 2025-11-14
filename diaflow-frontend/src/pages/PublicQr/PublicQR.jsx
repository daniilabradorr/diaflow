import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const backendBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

function PublicQR() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [estado, setEstado] = useState("loading");//loading | ok | error

  useEffect(() => {
    async function fetchKit() {
      try {
        const resp = await fetch(`${backendBase}/qr/${token}`);
        if (!resp.ok) throw new Error("Error al obtener kit");
        const json = await resp.json();
        setData(json);
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

  if (estado === "loading") {
    return <p>Cargando kit...</p>;
  }

  if (estado === "error" || !data) {
    return <p>No se ha podido cargar el kit. Comprueba el código QR.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">{data.kit.nombre}</h2>
      {data.kit.descripcion && <p className="mb-4">{data.kit.descripcion}</p>}

      <h3 className="font-semibold mb-2">Elementos requeridos:</h3>
      <ul className="space-y-1">
        {data.elementos.map((e, i) => (
          <li key={i}>
            {e.etiqueta}: {e.cantidad_requerida}
            {e.unidad}
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-500 mt-4">
        (En siguientes sprints aquí añadiremos el checklist con OK/FALTA y el
        POST a /qr/{token}/verify)
      </p>
    </div>
  );
}

export default PublicQR;
