export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-1/4 left-1/2 h-[120%] w-[140%] -translate-x-1/2 animate-wave-slow rounded-[45%] bg-[radial-gradient(circle_at_center,var(--wave-a),transparent_65%)] opacity-40 blur-3xl" />
      <div className="absolute bottom-[-30%] left-[30%] h-[110%] w-[130%] animate-wave-medium rounded-[50%] bg-[radial-gradient(circle,var(--wave-b),transparent_60%)] opacity-30 blur-[140px]" />
      <div className="absolute top-1/3 right-[-20%] h-[90%] w-[70%] animate-wave-fast rotate-12 rounded-[60%] bg-[conic-gradient(from_120deg,var(--wave-c),transparent_70%)] opacity-35 blur-[120px]" />
    </div>
  );
}
