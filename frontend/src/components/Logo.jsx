import { FaLeaf } from "react-icons/fa";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
        <FaLeaf size={24} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-green-700">
          Shamba360
        </h1>

        <p className="text-sm text-gray-500">
          Smart Farm Management
        </p>
      </div>
    </div>
  );
}

export default Logo;