function Card({ children }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      {children}
    </div>
  );
}

export default Card;