export default function Loader({ message }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
      <div className="relative flex flex-col items-center">
        <div className="text-4xl font-bold tracking-tight">
          Xclusive Shop<span className="text-[#a8e063]">.</span>
        </div>

        <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[loader_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#a8e063] to-[#56ab2f]" />
        </div>

        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60">
          {message ?? "Loading"}
        </p>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}