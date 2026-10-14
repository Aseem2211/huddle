
import {useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import {useAuth} from "../context/Authcontext";
import {resendOtp} from "../services/authApi.js";


// Keep your existing imports at the top (useState, Link, useNavigate, useAuth, resendOtp).

/* ---------- Icons (sharp, 1.75 stroke, inherit currentColor) ---------- */
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
        <rect x="2" y="5" width="13" height="14" fill="#2F6BFF" />
        <path d="M15 10l7-4v12l-7-4z" fill="#8B5CF6" />
        <rect x="5" y="8" width="3" height="3" fill="#67E8F9" />
    </svg>
);

/* ---------- Mandala (festival backdrop, line-art, palette colours) ---------- */
function Mandala() {
    const ring = (count, d, stroke, extra = {}) =>
        Array.from({ length: count }, (_, i) => (
            <path key={`${stroke}-${d.slice(0, 8)}-${i}`} d={d} stroke={stroke} transform={`rotate(${(360 / count) * i})`} {...extra} />
        ));

    return (
        <svg
            viewBox="-300 -300 600 600"
            fill="none"
            strokeWidth="1.2"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[720px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-70"
        >
            {/* slow outer ring */}
            <g className="origin-center animate-[spin_120s_linear_infinite] motion-reduce:animate-none">
                <circle r="292" stroke="#8B5CF6" strokeOpacity="0.35" strokeDasharray="2 8" />
                {Array.from({ length: 48 }, (_, i) => (
                    <circle key={i} cx="0" cy="-280" r="2.4" fill="#67E8F9" fillOpacity="0.7" transform={`rotate(${(360 / 48) * i})`} />
                ))}
                {ring(24, "M0 -200 Q16 -235 0 -268 Q-16 -235 0 -200Z", "#8B5CF6", { strokeOpacity: 0.6 })}
            </g>

            {/* counter-rotating middle ring */}
            <g className="origin-center animate-[spin_90s_linear_infinite_reverse] motion-reduce:animate-none">
                <circle r="196" stroke="#2F6BFF" strokeOpacity="0.5" />
                {ring(12, "M0 -120 Q34 -165 0 -205 Q-34 -165 0 -120Z", "#2F6BFF", { strokeOpacity: 0.8 })}
                {ring(12, "M0 -150 Q10 -172 0 -190 Q-10 -172 0 -150Z", "#67E8F9", { strokeOpacity: 0.7 })}
            </g>

            {/* inner core */}
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

/* ---------- Shared field styles ---------- */
const fieldWrap = "relative";
const fieldIcon = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors peer-focus:text-[#67E8F9]";
const fieldInput =
    "peer w-full border border-white/10 bg-[#070B14]/70 py-3.5 pl-11 pr-4 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]";
const labelCls = "block text-xs font-bold uppercase tracking-[0.18em] text-[#F1F5F9]/80";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }
        setSubmitting(true);
        try {
            const cleanEmail = email.trim().toLowerCase();
            await login({ email: cleanEmail, password });
            navigate("/home");
        } catch (err) {
            if (err.data?.needsVerification) {
                const cleanEmail = email.trim().toLowerCase();
                try { await resendOtp({ email: cleanEmail }); } catch { }
                navigate("/verify-otp", { state: { email: cleanEmail } });
                return;
            }
            setError(err.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-5 py-12 text-[#F1F5F9]">
            {/* flat colour glows (no gradients), keeps the glassy depth */}
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-[120px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-[130px]" />

            <div className="relative w-full max-w-md">
                <Mandala />

                <section className="relative border border-white/10 bg-[#101A2E]/70 p-7 shadow-[0_0_80px_rgba(47,107,255,0.18)] backdrop-blur-2xl sm:p-10">
                    {/* sharp accent corners */}
                    <span aria-hidden="true" className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#67E8F9]" />
                    <span aria-hidden="true" className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#8B5CF6]" />

                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-xl font-black tracking-tight">
                            <LogoMark />
                            <span>ZOOM<span className="text-[#2F6BFF]">LITE</span></span>
                        </div>
                        <span className="flex items-center gap-2 border border-[#67E8F9]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#67E8F9]">
                            <span className="h-1.5 w-1.5 animate-pulse bg-[#67E8F9]" />
                            Live
                        </span>
                    </div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#8B5CF6]">Festival of lights, Huddle style</p>
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">
                        Welcome<br />back<span className="text-[#2F6BFF]">.</span>
                    </h1>
                    <p className="mb-8 mt-3 text-sm text-[#94A3B8]">Log in to your account and pick up where you left off.</p>

                    {error && (
                        <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            <span className="mt-0.5 shrink-0"><AlertIcon /></span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className={labelCls}>Email</label>
                            <div className={fieldWrap}>
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
                            <div className={fieldWrap}>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] transition hover:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#2F6BFF]"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link className="text-sm text-[#67E8F9] underline decoration-[#67E8F9]/40 underline-offset-4 transition hover:text-white" to="/forgot-password">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            className="group flex w-full items-center justify-center gap-3 border border-[#2F6BFF] bg-[#2F6BFF] px-5 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(47,107,255,0.35)] transition hover:bg-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#67E8F9] focus:ring-offset-2 focus:ring-offset-[#070B14] disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (<><SpinnerIcon /> Logging in…</>) : (<>Log in <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></>)}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#94A3B8]">
                        Don't have an account?{" "}
                        <Link className="font-bold text-[#8B5CF6] underline decoration-[#8B5CF6]/50 underline-offset-4 transition hover:text-white" to="/signup">
                            Sign up
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}