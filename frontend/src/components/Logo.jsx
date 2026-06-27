import { FaLeaf } from "react-icons/fa";

function Logo({ tone = "light" }) {
  const isDark = tone === "dark";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isDark ? "bg-white text-green-800" : "bg-green-700 text-white"}`}>
        <FaLeaf size={20} />
      </div>

      <div>
        <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-950"}`}>
          Shamba360
        </h1>

        <p className={`text-xs ${isDark ? "text-green-100" : "text-gray-500"}`}>
          Smart Farm Management
        </p>
      </div>
    </div>
  );
}

export default Logo;
