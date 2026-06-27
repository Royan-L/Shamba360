const tones = {
  green: "bg-green-50 text-green-800 ring-green-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
};

function StatusBadge({ children, tone = "gray" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default StatusBadge;
