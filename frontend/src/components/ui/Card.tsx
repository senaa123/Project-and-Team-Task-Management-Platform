export default function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card p-5 ${className}`}>
      {children}
    </div>
  );
}