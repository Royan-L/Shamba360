function DataPanel({ title, icon, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-green-700">{icon}</span>}
          <h2 className="text-base font-bold text-gray-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default DataPanel;

