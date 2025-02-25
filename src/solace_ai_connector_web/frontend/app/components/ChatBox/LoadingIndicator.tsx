import { memo } from "react";

const LoadingIndicator = memo(() => (
  <span className="inline-flex items-center ml-2">
    <style>
      {`
        .loading-dot {
          opacity: 0.3;
          animation: loadingFade 1.2s ease-in-out infinite;
        }
        .loading-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .loading-dot:nth-child(2) {
          animation-delay: 0.4s;
        }
        .loading-dot:nth-child(3) {
          animation-delay: 0.8s;
        }
        @keyframes loadingFade {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }
      `}
    </style>
    {[...Array(3)].map((_, i) => (
      <span
        key={i}
        className="loading-dot w-1.5 h-1.5 mx-0.5 rounded-full bg-current inline-block"
      />
    ))}
  </span>
));

export default LoadingIndicator;