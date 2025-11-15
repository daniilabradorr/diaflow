import React from "react";

function Spinner({ fullScreen = false, label = "Cargando..." }) {
  const content = (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
      <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
      {content}
    </div>
  );
}

export default Spinner;