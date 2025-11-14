import React, { useEffect, useState } from "react";
import {
  useKits,
  useKitDetalle,
  useSaveKit,
  useDeleteKit,
  useSaveElementosKit,
  useQrKit,
  useVerificacionesKit,
  useRotateKitToken,
} from "../../api/hooks/useKits";

function KitsPage() {
  const { data: kits, isLoading: kitsLoading } = useKits();
  const saveKit = useSaveKit();
  const deleteKit = useDeleteKit();
  const saveElementos = useSaveElementosKit();
  const rotateToken = useRotateKitToken();

  const [selectedKitId, setSelectedKitId] = useState(null);

  // cuando cargan los kits, seleccionamos el primero si no hay seleccionado
  useEffect(() => {
    if (!selectedKitId && kits && kits.length > 0) {
      setSelectedKitId(kits[0].id);
    }
  }, [kits, selectedKitId]);

  const { data: kitDetalle, isLoading: detalleLoading } =
    useKitDetalle(selectedKitId);
  const { data: qrData } = useQrKit(selectedKitId);
  const { data: verificaciones } = useVerificacionesKit(selectedKitId);

  // estado local para editar elementos
  const [elementosEdit, setElementosEdit] = useState([]);

  useEffect(() => {
    if (kitDetalle && kitDetalle.elementos) {
      setElementosEdit(kitDetalle.elementos.map((e) => ({ ...e })));
    }
  }, [kitDetalle]);

  // añadir fila vacía
  function addElementoRow() {
    setElementosEdit((prev) => [
      ...prev,
      { id: null, etiqueta: "", cantidad_requerida: 1, unidad: "" },
    ]);
  }

  // eliminar fila (solo en UI; al enviar no mandamos esa fila)
  function removeElementoRow(index) {
    setElementosEdit((prev) => prev.filter((_, i) => i !== index));
  }

  function updateElementoField(index, field, value) {
    setElementosEdit((prev) =>
      prev.map((el, i) =>
        i === index
          ? {
              ...el,
              [field]:
                field === "cantidad_requerida" ? Number(value) || 0 : value,
            }
          : el
      )
    );
  }

  async function handleSaveElementos() {
    if (!selectedKitId) return;
    const cleaned = elementosEdit.filter(
      (el) => el.etiqueta && el.cantidad_requerida > 0
    );
    await saveElementos.mutateAsync({
      kitId: selectedKitId,
      elementos: cleaned,
    });
  }

  async function handleSaveKitBasics() {
    if (!selectedKitId || !kitDetalle) return;
    await saveKit.mutateAsync({
      id: selectedKitId,
      payload: {
        nombre: kitDetalle.nombre,
        descripcion: kitDetalle.descripcion,
      },
    });
  }

  async function handleDeleteKit(id) {
    if (!window.confirm("¿Seguro que quieres borrar este kit?")) return;
    await deleteKit.mutateAsync(id);
    if (selectedKitId === id) {
      setSelectedKitId(null);
    }
  }

  async function handleRotateToken() {
    if (!selectedKitId) return;
    await rotateToken.mutateAsync(selectedKitId);
  }

  return (
    <div className="flex gap-6">
      {/* Columna izquierda: lista de kits */}
      <aside className="w-64 border-r pr-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Kits</h2>
          {/* opcional: botón crear kit */}
        </div>

        {kitsLoading && <p>Cargando kits...</p>}
        {kits && kits.length === 0 && <p>No hay kits aún.</p>}

        <ul className="space-y-1">
          {kits &&
            kits.map((kit) => (
              <li
                key={kit.id}
                className={`px-2 py-1 rounded cursor-pointer flex justify-between items-center ${
                  kit.id === selectedKitId ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedKitId(kit.id)}
              >
                <span className="text-sm">{kit.nombre}</span>
                <button
                  className="text-xs text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteKit(kit.id);
                  }}
                >
                  X
                </button>
              </li>
            ))}
        </ul>
      </aside>

      {/* Columna derecha: detalle del kit */}
      <main className="flex-1">
        {detalleLoading && <p>Cargando detalle de kit...</p>}
        {!detalleLoading && !kitDetalle && (
          <p>Selecciona un kit de la lista.</p>
        )}

        {kitDetalle && (
          <div className="space-y-6">
            {/* Datos básicos */}
            <section className="p-4 border rounded">
              <h3 className="font-semibold mb-3">Datos del kit</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm mb-1">Nombre</label>
                  <input
                    className="border rounded px-2 py-1 text-sm w-full"
                    value={kitDetalle.nombre || ""}
                    onChange={(e) =>
                      (kitDetalle.nombre = e.target.value) &&
                      // forzamos re-render
                      setElementosEdit((prev) => [...prev])
                    }
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm mb-1">Descripción</label>
                  <input
                    className="border rounded px-2 py-1 text-sm w-full"
                    value={kitDetalle.descripcion || ""}
                    onChange={(e) =>
                      (kitDetalle.descripcion = e.target.value) &&
                      setElementosEdit((prev) => [...prev])
                    }
                  />
                </div>
              </div>
              <button
                className="mt-3 bg-blue-600 text-white text-sm px-4 py-1 rounded"
                onClick={handleSaveKitBasics}
              >
                Guardar datos del kit
              </button>
            </section>

            {/* Elementos */}
            <section className="p-4 border rounded">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Elementos del kit</h3>
                <button
                  className="text-sm border px-3 py-1 rounded"
                  onClick={addElementoRow}
                >
                  Añadir elemento
                </button>
              </div>

              {elementosEdit.length === 0 && (
                <p className="text-sm text-gray-600">
                  No hay elementos. Añade alguno.
                </p>
              )}

              {elementosEdit.length > 0 && (
                <table className="w-full text-sm border-collapse mb-3">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1 text-left">Etiqueta</th>
                      <th className="border px-2 py-1 text-right">
                        Cantidad
                      </th>
                      <th className="border px-2 py-1 text-left">Unidad</th>
                      <th className="border px-2 py-1 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementosEdit.map((el, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-1">
                          <input
                            className="border rounded px-1 py-0.5 text-xs w-full"
                            value={el.etiqueta}
                            onChange={(e) =>
                              updateElementoField(
                                index,
                                "etiqueta",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border px-2 py-1 text-right">
                          <input
                            type="number"
                            className="border rounded px-1 py-0.5 text-xs w-20 text-right"
                            value={el.cantidad_requerida}
                            onChange={(e) =>
                              updateElementoField(
                                index,
                                "cantidad_requerida",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            className="border rounded px-1 py-0.5 text-xs w-24"
                            value={el.unidad || ""}
                            onChange={(e) =>
                              updateElementoField(
                                index,
                                "unidad",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            className="text-xs text-red-600"
                            onClick={() => removeElementoRow(index)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <button
                className="bg-blue-600 text-white text-sm px-4 py-1 rounded"
                onClick={handleSaveElementos}
              >
                Guardar elementos
              </button>
            </section>

            {/* QR */}
            <section className="p-4 border rounded">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">QR del kit</h3>
                <button
                  className="text-xs text-blue-700 underline"
                  onClick={handleRotateToken}
                >
                  Rotar token
                </button>
              </div>

              {qrData ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {qrData.data_url && (
                    <img
                      src={qrData.data_url}
                      alt="QR del kit"
                      className="w-40 h-40 border"
                    />
                  )}
                  <div className="text-sm">
                    <p className="mb-1">
                      Token:{" "}
                      <code className="bg-gray-100 px-1">{qrData.token}</code>
                    </p>
                    <p className="mb-1">
                      Enlace público:
                      <br />
                      <a
                        href={qrData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {qrData.url}
                      </a>
                    </p>
                    <p className="text-xs text-gray-600">
                      Imprime este QR o comparte el enlace con la persona que
                      revisa el kit.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No se ha generado QR todavía.
                </p>
              )}
            </section>

            {/* Historial rápido de verificaciones */}
            <section className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Últimas verificaciones</h3>
              {verificaciones && verificaciones.length > 0 ? (
                <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {verificaciones.map((v) => (
                    <li key={v.id} className="flex justify-between">
                      <span>
                        {new Date(v.verificado_en).toLocaleString()} –{" "}
                        {v.realizado_por || "Anon"}
                      </span>
                      <span
                        className={
                          v.ok ? "text-green-700 text-xs" : "text-red-700 text-xs"
                        }
                      >
                        {v.ok ? "OK" : "FALTAN COSAS"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  Aún no hay verificaciones registradas.
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default KitsPage;