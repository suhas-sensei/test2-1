import useAppStore from '../../zustand/store';

export const TxnsProgressBar = () => {
  const { txnsProgress, coinsCollected } = useAppStore();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    }}>
      {/* Bitcoin icon circle */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)',
        border: '4px solid #00ffff',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Lightning bolt icon */}
        <div style={{
          fontSize: '32px',
          color: '#ffffff',
          fontWeight: 'bold',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        }}>
          ₿
        </div>
      </div>

      {/* Progress bar container */}
      <div style={{
        position: 'relative',
        width: '400px',
        height: '50px',
        background: 'linear-gradient(180deg, #1a3a3a 0%, #0d1f1f 100%)',
        borderRadius: '25px',
        border: '3px solid #00d4ff',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
      }}>
        {/* Inner glow effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          borderRadius: '22px',
          pointerEvents: 'none',
        }} />

        {/* Progress fill */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${txnsProgress}%`,
          background: 'linear-gradient(90deg, #00d4ff 0%, #00ffff 50%, #00d4ff 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
          borderRadius: '22px',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
          transition: 'width 0.5s ease-out',
        }}>
          <style>
            {`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}
          </style>
        </div>

        {/* Progress text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 212, 255, 0.5)',
          zIndex: 1,
          letterSpacing: '1px',
        }}>
          txns {coinsCollected} / 10
        </div>
      </div>
    </div>
  );
};
