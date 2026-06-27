function Button({ children, type = "button", onClick, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-green-700 text-white hover:bg-green-800",
    secondary: "border border-gray-300 bg-white text-gray-800 hover:border-green-700 hover:text-green-800",
    subtle: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
