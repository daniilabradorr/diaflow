import React, { useState } from "react";
import {
  useInsumos,
  useSaveInsumo,
  useDeleteInsumo,
  useCrearMovimientoInsumo,
} from "../../api/hooks/useInsumos";
import { useAlertas, useMarcarAlertaAtendida } from "../../api/hooks/useAlertas";

function InventarioPage() {
  const query = useInsumos();
  const insumos = Array.isArray(query.data) ? query.data : [];
  const isLoading = query.isLoading;
  const isError = query.isError;
  const saveInsumo = useSaveInsumo();
  const deleteInsumo = useDeleteInsumo();
  const crearMovimiento = useCrearMovimientoInsumo();

  const { data: alertas } = useAlertas(true);
  const marcarAlerta = useMarcarAlertaAtendida();

  // Estado para editar una fila concreta
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ stock_minimo: "", unidad: "" });

  // Estado para movimiento rápido
  const [movimiento, setMovimiento] = useState({
    insumoId: null,
    tipo: "entrada",
    cantidad: "",
  });

  function startEdit(insumo) {
    setEditingId(insumo.id);
    setEditValues({
      stock_minimo: insumo.stock_minimo ?? "",
      unidad: insumo.unidad ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({ stock_minimo: "", unidad: "" });
  }

  async function saveEdit(insumo) {
    const payload = {
      stock_minimo: Number(editValues.stock_minimo),
      unidad: editValues.unidad,
    };
    await saveInsumo.mutateAsync({ id: insumo.id, payload });
    cancelEdit();
  }

  async function handleMovimientoSubmit(e) {
    e.preventDefault();
    if (!movimiento.insumoId || !movimiento.cantidad) return;

    const cantidadNumber = Number(movimiento.cantidad);
    if (isNaN(cantidadNumber) || cantidadNumber <= 0) return;

    const signed =
      movimiento.tipo === "entrada" ? cantidadNumber : -cantidadNumber;

    await crearMovimiento.mutateAsync({
      insumoId: movimiento.insumoId,
      cantidad: signed,
    });

    setMovimiento({ insumoId: null, tipo: "entrada", cantidad: "" });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inventario</h2>

      {isLoading && <p>Cargando insumos...</p>}
      {isError && (
        <p className="text-red-600">Error al cargar los insumos.</p>
      )}

      {/* Tabla de insumos */}
      {insumos && insumos.length > 0 ? (
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Nombre</th>
              <th className="border px-2 py-1 text-left">Tipo</th>
              <th className="border px-2 py-1 text-right">Stock actual</th>
              <th className="border px-2 py-1 text-right">Stock mínimo</th>
              <th className="border px-2 py-1 text-left">Unidad</th>
              <th className="border px-2 py-1 text-left">Caducidad</th>
              <th className="border px-2 py-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((ins) => {
              const enEdicion = editingId === ins.id;
              const critico =
                ins.stock_minimo != null &&
                ins.stock_actual != null &&
                ins.stock_actual < ins.stock_minimo;

              return (
                <tr
                  key={ins.id}
                  className={critico ? "bg-red-50" : ""}
                >
                  <td className="border px-2 py-1">{ins.nombre}</td>
                  <td className="border px-2 py-1">{ins.tipo}</td>
                  <td className="border px-2 py-1 text-right">
                    {ins.stock_actual}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {enEdicion ? (
                      <input
                        type="number"
                        className="border rounded px-1 py-0.5 text-xs w-20"
                        value={editValues.stock_minimo}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            stock_minimo: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      ins.stock_minimo
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {enEdicion ? (
                      <input
                        type="text"
                        className="border rounded px-1 py-0.5 text-xs w-20"
                        value={editValues.unidad}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            unidad: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      ins.unidad
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {ins.caducidad
                      ? new Date(ins.caducidad).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    {enEdicion ? (
                      <>
                        <button
                          className="text-xs text-green-700"
                          onClick={() => saveEdit(ins)}
                        >
                          Guardar
                        </button>
                        <button
                          className="text-xs text-gray-600"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-xs text-blue-600"
                          onClick={() => startEdit(ins)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-xs text-red-600"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Seguro que quieres borrar este insumo?"
                              )
                            ) {
                              deleteInsumo.mutate(ins.id);
                            }
                          }}
                        >
                          Borrar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        !isLoading && <p>No hay insumos registrados.</p>
      )}

      {/* Movimiento rápido */}
      <div className="mb-8 p-4 border rounded max-w-xl">
        <h3 className="font-semibold mb-2">Registrar movimiento</h3>
        <form
          className="flex flex-wrap gap-4 items-end"
          onSubmit={handleMovimientoSubmit}
        >
          <div>
            <label className="block text-sm mb-1">Insumo</label>
            <select
              className="border rounded px-2 py-1 text-sm min-w-[160px]"
              value={movimiento.insumoId || ""}
              onChange={(e) =>
                setMovimiento((m) => ({
                  ...m,
                  insumoId: e.target.value || null,
                }))
              }
            >
              <option value="">Selecciona insumo</option>
              {insumos &&
                insumos.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.nombre}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tipo</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={movimiento.tipo}
              onChange={(e) =>
                setMovimiento((m) => ({ ...m, tipo: e.target.value }))
              }
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Cantidad</label>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-24"
              value={movimiento.cantidad}
              onChange={(e) =>
                setMovimiento((m) => ({ ...m, cantidad: e.target.value }))
              }
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-4 py-1 rounded"
          >
            Guardar movimiento
          </button>
        </form>
      </div>

      {/* Alertas */}
      <div className="max-w-xl">
        <h3 className="font-semibold mb-2">Alertas de stock</h3>
        {alertas && alertas.length > 0 ? (
          <ul className="space-y-2">
            {alertas.map((al) => (
              <li
                key={al.id}
                className="border rounded px-3 py-2 flex justify-between items-center bg-yellow-50"
              >
                <div>
                  <p className="text-sm font-semibold">{al.titulo || al.tipo}</p>
                  <p className="text-xs text-gray-700">{al.mensaje}</p>
                </div>
                <button
                  className="text-xs text-green-700"
                  onClick={() => marcarAlerta.mutate(al)}
                >
                  Marcar atendida
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alertas activas.</p>
        )}
      </div>
    </div>
  );
}

export default InventarioPage;