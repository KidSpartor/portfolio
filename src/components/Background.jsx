export default function Background() {
  return (
    <>
      {/* Grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="fixed w-[700px] h-[700px] rounded-full bg-accent opacity-[0.12] -top-[300px] -left-[200px] blur-[150px] z-0 pointer-events-none animate-[drift_25s_ease-in-out_infinite]" />
      <div className="fixed w-[600px] h-[600px] rounded-full bg-accent2 opacity-[0.12] -bottom-[250px] -right-[200px] blur-[150px] z-0 pointer-events-none animate-[drift_30s_ease-in-out_infinite_reverse]" />
      <div className="fixed w-[400px] h-[400px] rounded-full bg-accent3 opacity-[0.08] top-[40%] left-[60%] blur-[150px] z-0 pointer-events-none animate-[drift_35s_ease-in-out_infinite_5s]" />

      {/* Noise texture */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(60px, -80px); }
          66% { transform: translate(-80px, 60px); }
        }
      `}</style>
    </>
  )
}
