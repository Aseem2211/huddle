import { useState } from "react";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": "true",
};

export const MailIcon = () => (
  <svg {...iconProps}><rect x="3" y="5" width="18" height="14" /><path d="M3 6l9 7 9-7" /></svg>
);
export const LockIcon = () => (
  <svg {...iconProps}><rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 018 0v3" /><path d="M12 14v2" /></svg>
);
export const UserIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" /></svg>
);
export const KeyIcon = () => (
  <svg {...iconProps}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9" /><path d="M16 7l3 3" /></svg>
);
export const EyeIcon = () => (
  <svg {...iconProps}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = () => (
  <svg {...iconProps}><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.2 3.9M6.5 7.7A17 17 0 002 12s3.5 6 10 6a10 10 0 004-.8" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
);
export const ArrowIcon = () => (
  <svg {...iconProps}><path d="M4 12h16" /><path d="M14 6l6 6-6 6" /></svg>
);
export const ArrowLeftIcon = () => (
  <svg {...iconProps}><path d="M20 12H4" /><path d="M10 6l-6 6 6 6" /></svg>
);
export const AlertIcon = () => (
  <svg {...iconProps}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4" /><path d="M12 17.5v.01" /></svg>
);
export const CheckIcon = () => (
  <svg {...iconProps}><path d="M4 12l5 5L20 6" /></svg>
);
export const CameraIcon = () => (
  <svg {...iconProps}><path d="M3 7h4l2-3h6l2 3h4v13H3z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const SpinnerIcon = () => (
  <svg {...iconProps} className="animate-spin"><path d="M12 3a9 9 0 109 9" /></svg>
);

export const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="13" height="14" fill="#2F6BFF" />
    <path d="M15 10l7-4v12l-7-4z" fill="#8B5CF6" />
    <rect x="5" y="8" width="3" height="3" fill="#67E8F9" />
  </svg>
);

export function Mandala() {
  const ring = (count, d, stroke, extra = {}) =>
    Array.from({ length: count }, (_, i) => (
      <path
        key={`${stroke}-${d.slice(0, 8)}-${i}`}
        d={d}
        stroke={stroke}
        transform={`rotate(${(360 / count) * i})`}
        {...extra}
      />
    ));

  return (
    <svg
      viewBox="-300 -300 600 600"
      fill="none"
      strokeWidth="1.2"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[760px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-70"
    >
      <g className="origin-center animate-[spin_120s_linear_infinite] motion-reduce:animate-none">
        <circle r="292" stroke="#8B5CF6" strokeOpacity="0.35" strokeDasharray="2 8" />
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cx="0" cy="-280" r="2.4" fill="#67E8F9" fillOpacity="0.7" transform={`rotate(${(360 / 48) * i})`} />
        ))}
        {ring(24, "M0 -200 Q16 -235 0 -268 Q-16 -235 0 -200Z", "#8B5CF6", { strokeOpacity: 0.6 })}
      </g>
      <g className="origin-center animate-[spin_90s_linear_infinite_reverse] motion-reduce:animate-none">
        <circle r="196" stroke="#2F6BFF" strokeOpacity="0.5" />
        {ring(12, "M0 -120 Q34 -165 0 -205 Q-34 -165 0 -120Z", "#2F6BFF", { strokeOpacity: 0.8 })}
        {ring(12, "M0 -150 Q10 -172 0 -190 Q-10 -172 0 -150Z", "#67E8F9", { strokeOpacity: 0.7 })}
      </g>
      <g className="origin-center animate-[spin_70s_linear_infinite] motion-reduce:animate-none">
        <circle r="112" stroke="#8B5CF6" strokeOpacity="0.5" />
        {ring(8, "M0 -50 Q22 -80 0 -108 Q-22 -80 0 -50Z", "#8B5CF6", { strokeOpacity: 0.85 })}
        <circle r="46" stroke="#2F6BFF" strokeOpacity="0.7" />
        <circle r="22" stroke="#67E8F9" strokeOpacity="0.7" />
        <circle r="5" fill="#67E8F9" fillOpacity="0.8" />
      </g>
    </svg>
  );
}

export const fieldIcon =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors peer-focus:text-[#67E8F9]";
export const fieldInput =
  "peer w-full border border-white/10 bg-[#070B14]/70 py-3.5 pl-11 pr-4 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]";
export const labelCls =
  "block text-xs font-bold uppercase tracking-[0.18em] text-[#F1F5F9]/80";
export const primaryBtn =
  "group flex w-full items-center justify-center gap-3 border border-[#2F6BFF] bg-[#2F6BFF] px-5 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(47,107,255,0.35)] transition hover:bg-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#67E8F9] focus:ring-offset-2 focus:ring-offset-[#070B14] disabled:cursor-not-allowed disabled:opacity-60";
export const ghostBtn =
  "flex items-center justify-center gap-2 border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#F1F5F9] transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#2F6BFF] disabled:cursor-not-allowed disabled:opacity-50";
export const glassCard =
  "relative border border-white/10 bg-[#101A2E]/70 p-6 backdrop-blur-2xl sm:p-8";

export function Notice({ type = "error", children }) {
  const styles =
    type === "error"
      ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
      : type === "success"
      ? "border-[#67E8F9]/40 bg-[#67E8F9]/10 text-[#67E8F9]"
      : "border-[#2F6BFF]/40 bg-[#2F6BFF]/10 text-[#F1F5F9]/80";
  return (
    <div role={type === "error" ? "alert" : "status"} className={`mb-5 flex items-start gap-3 border px-4 py-3 text-sm ${styles}`}>
      <span className="mt-0.5 shrink-0">{type === "success" ? <CheckIcon /> : <AlertIcon />}</span>
      <span>{children}</span>
    </div>
  );
}

export function TextField({ id, label, icon, type = "text", inputClassName = "", ...rest }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div className="relative">
        <input id={id} type={type} className={`${fieldInput} ${inputClassName}`} {...rest} />
        <span className={fieldIcon}>{icon}</span>
      </div>
    </div>
  );
}

export function PasswordField({ id, label, value, onChange, placeholder = "••••••••", autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${fieldInput} pr-12`}
        />
        <span className={fieldIcon}><LockIcon /></span>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] transition hover:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#2F6BFF]"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-5 py-12 text-[#F1F5F9]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-[130px]" />

      <div className="relative w-full max-w-md">
        <Mandala />

        <section className="relative border border-white/10 bg-[#101A2E]/70 p-7 shadow-[0_0_80px_rgba(47,107,255,0.18)] backdrop-blur-2xl sm:p-10">
          <span aria-hidden="true" className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#67E8F9]" />
          <span aria-hidden="true" className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#8B5CF6]" />

          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xl font-black tracking-tight">
              <LogoMark />
              <span>HUD<span className="text-[#2F6BFF]">DLE</span></span>
            </div>
            <span className="flex items-center gap-2 border border-[#67E8F9]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#67E8F9]">
              <span className="h-1.5 w-1.5 animate-pulse bg-[#67E8F9]" />
              Live
            </span>
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#8B5CF6]">{eyebrow}</p>
          <h1 className="text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">{title}</h1>
          <p className="mb-8 mt-3 text-sm text-[#94A3B8]">{subtitle}</p>

          {children}

          {footer && (
            <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#94A3B8]">{footer}</div>
          )}
        </section>
      </div>
    </main>
  );
}

export function PageShell({ title, subtitle, onBack, backLabel = "Back to home", children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B14] px-5 py-10 text-[#F1F5F9]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8] transition hover:text-[#67E8F9]"
        >
          <ArrowLeftIcon /> {backLabel}
        </button>

        <div className="mb-6 border border-white/10 bg-[#101A2E]/70 p-6 backdrop-blur-2xl">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B5CF6]">Huddle</p>
          <h1 className="text-3xl font-black tracking-[-0.04em]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </main>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 text-xl font-black tracking-tight ${className}`}>
      <LogoMark />
      <span>HUD<span className="text-[#2F6BFF]">DLE</span></span>
    </div>
  );
}

const tones = {
  cobalt: "border-[#2F6BFF]/30 bg-[#2F6BFF]/15 text-[#7FA6FF]",
  live: "border-[#67E8F9]/30 bg-[#67E8F9]/10 text-[#67E8F9]",
  violet: "border-[#8B5CF6]/30 bg-[#8B5CF6]/15 text-[#B79BFF]",
  slate: "border-white/10 bg-white/[0.04] text-[#94A3B8]",
  solid: "border-white/20 bg-white/15 text-white",
};

export function IconTile({ icon: Icon, tone = "cobalt", size = 18, className = "" }) {
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${tones[tone]} ${className}`}>
      <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

export function Pill({ tone = "slate", children, dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${tones[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 bg-current" />}
      {children}
    </span>
  );
}

export function Card({ as: Tag = "section", variant = "glass", interactive = false, className = "", children, ...rest }) {
  const surface =
    variant === "primary"
      ? "border-[#2F6BFF] bg-[#2F6BFF] shadow-[0_0_40px_rgba(47,107,255,0.28)]"
      : "border-white/10 bg-[#101A2E]/75 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur-2xl";
  return (
    <Tag
      className={`relative border ${surface} ${
        interactive ? "transition duration-200 hover:-translate-y-0.5 hover:border-white/25" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Avatar({ name = "", tone = "cobalt", className = "h-10 w-10 text-sm" }) {
  const bg = tone === "violet" ? "bg-[#8B5CF6]" : "bg-[#2F6BFF]";
  return (
    <span className={`flex shrink-0 items-center justify-center font-bold text-white ${bg} ${className}`}>
      {name?.[0]?.toUpperCase() || "?"}
    </span>
  );
}

export function SectionLabel({ icon: Icon, children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
        {Icon && <Icon size={14} aria-hidden="true" />}
        <span>{children}</span>
      </div>
      {action}
    </div>
  );
}
