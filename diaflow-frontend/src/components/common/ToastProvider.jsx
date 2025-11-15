import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = "info") => {
    // Si alguien llama a showToast sin provider, no debería romper,
    // pero aquí SI hay provider, así que actualizamos el estado.
    setToast({ message, type });

    // Ocultar automáticamente a los 3 segundos
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`
              px-4 py-2 rounded shadow-lg text-sm text-white
              ${
                toast.type === "error"
                  ? "bg-red-600"
                  : toast.type === "success"
                  ? "bg-emerald-600"
                  : "bg-slate-800"
              }
            `}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// HOOK SEGURO: si no hay provider, devuelve un showToast NO-OP
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // No hay <ToastProvider> por encima → devolvemos un objeto con showToast vacío
    return { showToast: () => {} };
  }
  return ctx;
}
