export function MetricBox({ label, value, footer }) {
  return (
    <Card>
      <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {footer && <p className="mt-1 text-xs text-slate-500">{footer}</p>}
    </Card>
  );
}