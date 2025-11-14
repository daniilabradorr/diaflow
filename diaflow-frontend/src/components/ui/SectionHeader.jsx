export function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-4">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      {subtitle && (
        <p className="text-sm text-slate-600 mt-1">
          {subtitle}
        </p>
      )}
    </header>
  );
}