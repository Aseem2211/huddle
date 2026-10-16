
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

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

const UserIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" /></svg>
);
const MailIcon = () => (
  <svg {...iconProps}><rect x="3" y="5" width="18" height="14" /><path d="M3 6l9 7 9-7" /></svg>
);
const LockIcon = () => (
  <svg {...iconProps}><rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 018 0v3" /><path d="M12 14v2" /></svg>
);
const EyeIcon = () => (
  <svg {...iconProps}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
  <svg {...iconProps}><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.2 3.9M6.5 7.7A17 17 0 002 12s3.5 6 10 6a10 10 0 004-.8" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
);
const ArrowIcon = () => (
  <svg {...iconProps}><path d="M4 12h16" /><path d="M14 6l6 6-6 6" /></svg>
);
const AlertIcon = () => (
  <svg {...iconProps}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4" /><path d="M12 17.5v.01" /></svg>
);
const SpinnerIcon = () => (
  <svg {...iconProps} className="animate-spin"><path d="M12 3a9 9 0 109 9" /></svg>
);
const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="13" height="14" fill="#2563EB" />
    <path d="M15 10l7-4v12l-7-4z" fill="#B8F34A" />
    <rect x="5" y="8" width="3" height="3" fill="#22D3EE" />
  </svg>
);

function Mandala() {
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
        <circle r="292" stroke="#B8F34A" strokeOpacity="0.35" strokeDasharray="2 8" />
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cx="0" cy="-280" r="2.4" fill="#22D3EE" fillOpacity="0.7" transform={`rotate(${(360 / 48) * i})`} />
        ))}
        {ring(24, "M0 -200 Q16 -235 0 -268 Q-16 -235 0 -200Z", "#B8F34A", { strokeOpacity: 0.6 })}
      </g>

      <g className="origin-center animate-[spin_90s_linear_infinite_reverse] motion-reduce:animate-none">
        <circle r="196" stroke="#2563EB" strokeOpacity="0.5" />
        {ring(12, "M0 -120 Q34 -165 0 -205 Q-34 -165 0 -120Z", "#2563EB", { strokeOpacity: 0.8 })}
        {ring(12, "M0 -150 Q10 -172 0 -190 Q-10 -172 0 -150Z", "#22D3EE", { strokeOpacity: 0.7 })}
      </g>

      <g className="origin-center animate-[spin_70s_linear_infinite] motion-reduce:animate-none">
        <circle r="112" stroke="#B8F34A" strokeOpacity="0.5" />
        {ring(8, "M0 -50 Q22 -80 0 -108 Q-22 -80 0 -50Z", "#B8F34A", { strokeOpacity: 0.85 })}
        <circle r="46" stroke="#2563EB" strokeOpacity="0.7" />
        <circle r="22" stroke="#22D3EE" strokeOpacity="0.7" />
        <circle r="5" fill="#22D3EE" fillOpacity="0.8" />
      </g>
    </svg>
  );
}

const fieldIcon =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A8B5CC] transition-colors peer-focus:text-[#22D3EE]";
const fieldInput =
  "peer w-full border border-white/10 bg-[#080D1B]/70 py-3.5 pl-11 pr-4 text-sm text-[#F4F7FF] outline-none transition placeholder:text-[#A8B5CC]/60 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]";
const labelCls =
  "block text-xs font-bold uppercase tracking-[0.18em] text-[#F4F7FF]/80";

function strengthLevel(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthColors = ["#A8B5CC", "#F43F5E", "#B8F34A", "#2563EB", "#22D3EE"];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const level = password ? strengthLevel(password) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await signup({ name, email: cleanEmail, password });
      navigate("/verify-otp", { state: { email: cleanEmail } });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D1B] px-5 py-12 text-[#F4F7FF]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2563EB]/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#B8F34A]/20 blur-[130px]" />

      <div className="relative w-full max-w-md">
        <Mandala />

        <section className="relative border border-white/10 bg-[#101A2E]/70 p-7 shadow-[0_0_80px_rgba(47,107,255,0.18)] backdrop-blur-2xl sm:p-10">
          <span aria-hidden="true" className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#22D3EE]" />
          <span aria-hidden="true" className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#B8F34A]" />

          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xl font-black tracking-tight">
              <LogoMark />
              <span>HUD<span className="text-[#2563EB]">DLE</span></span>
            </div>
            <span className="flex items-center gap-2 border border-[#22D3EE]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#22D3EE]">
              <span className="h-1.5 w-1.5 animate-pulse bg-[#22D3EE]" />
              Live
            </span>
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#B8F34A]">Join the celebration</p>
          <h1 className="text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">
            Create your<br />account<span className="text-[#2563EB]">.</span>
          </h1>
          <p className="mb-8 mt-3 text-sm text-[#A8B5CC]">Sign up in a minute and start your first meeting.</p>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <span className="mt-0.5 shrink-0"><AlertIcon /></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className={labelCls}>Name</label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={fieldInput}
                />
                <span className={fieldIcon}><UserIcon /></span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className={labelCls}>Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={fieldInput}
                />
                <span className={fieldIcon}><MailIcon /></span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${fieldInput} pr-12`}
                />
                <span className={fieldIcon}><LockIcon /></span>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A8B5CC] transition hover:text-[#F4F7FF] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="flex gap-1.5 pt-1" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className="h-1 flex-1 transition-colors"
                    style={{ backgroundColor: n <= level ? strengthColors[level] : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#A8B5CC]">At least 8 characters</p>
            </div>

            <button
              className="group flex w-full items-center justify-center gap-3 border border-[#2563EB] bg-[#2563EB] px-5 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(47,107,255,0.35)] transition hover:bg-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:ring-offset-2 focus:ring-offset-[#080D1B] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <><SpinnerIcon /> Creating account…</>
              ) : (
                <>Sign up <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#A8B5CC]">
            Already have an account?{" "}
            <Link className="font-bold text-[#B8F34A] underline decoration-[#B8F34A]/50 underline-offset-4 transition hover:text-white" to="/login">
              Log in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}