import React from "react";

type Props = {
  bgImage?: string;
  headline?: string;
  brand?: string;
  subtitle?: string;
};

const AuthIllustration: React.FC<Props> = ({
  bgImage,
  headline = "Payments made effortless",
  brand = "Your Brand",
  subtitle = "Accept payments globally, settle locally, and manage your business with confidence.",
}) => {
  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block">
      {/* Background image (optional) */}
      <div
        className="absolute inset-0 bg-cover bg-right"
        style={
          bgImage
            ? { backgroundImage: `url('${bgImage}')` }
            : undefined
        }
        aria-hidden
      />

      {/* Subtle grid pattern overlay (SVG) */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M40 0H0v40' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Soft gradient glow wash (binds to theme color) */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 90% 10%, hsl(var(--primary)/0.30), transparent 60%), radial-gradient(800px 500px at 10% 80%, rgba(255,255,255,0.18), transparent 50%)",
        }}
      />

      {/* Floating blobs (motion-safe) */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl motion-safe:animate-[float_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl motion-safe:animate-[float_14s_ease-in-out_infinite_reverse]" />

      {/* Content container */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-[88%] max-w-xl">
          {/* Glass card */}
          <div className="rounded-2xl border border-white/20 bg-bg/20 p-6 backdrop-blur-xl shadow-[0_10px_50px_-10px_rgba(0,0,0,0.25)]">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              {headline}{" "}
              <span className="block text-primary">
                {brand}
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg/90 md:text-base">
              {subtitle}
            </p>

            {/* Pill features (optional flavor) */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-input/25 px-3 py-1 text-xs text-fg/95 backdrop-blur">
                Fast onboarding
              </span>
              <span className="rounded-full bg-input/25 px-3 py-1 text-xs text-fg/95 backdrop-blur">
                Global acceptance
              </span>
              <span className="rounded-full bg-input/25 px-3 py-1 text-xs text-fg/95 backdrop-blur">
                Secure by default
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple keyframes (Tailwind v4 inline) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50%      { transform: translateY(-14px) }
        }
      `}</style>
    </div>
  );
};

export default AuthIllustration;
