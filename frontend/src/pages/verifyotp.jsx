
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/authApi.js";
import {
  AuthShell,
  Notice,
  TextField,
  MailIcon,
  KeyIcon,
  ArrowIcon,
  SpinnerIcon,
  primaryBtn,
} from "../components/ui/shared";

const RESEND_COOLDOWN = 60;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(location.state?.email ? RESEND_COOLDOWN : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!cleanEmail || otp.length !== 6) {
      setError("Enter your email and the 6-digit code");
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp({ email: cleanEmail, otp });
      setMessage("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (err) {
      setError(err.message || "Verification failed");
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    if (!cleanEmail) {
      setError("Enter your email first");
      return;
    }
    setResending(true);
    try {
      const data = await resendOtp({ email: cleanEmail });
      setMessage(data.message || "A new code has been sent");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="One last step"
      title={<>Verify your<br />email<span className="text-[#2F6BFF]">.</span></>}
      subtitle={`We sent a 6-digit code to ${cleanEmail || "your email"}. It expires in 10 minutes. Check your spam folder if you don't see it.`}
      footer={
        <>
          Didn't get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-bold text-[#67E8F9] underline decoration-[#67E8F9]/40 underline-offset-4 transition hover:text-white disabled:cursor-not-allowed disabled:text-[#94A3B8] disabled:no-underline"
          >
            {resending ? "Sending…" : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <span className="mx-2 text-white/20">·</span>
          <Link className="font-bold text-[#8B5CF6] underline decoration-[#8B5CF6]/50 underline-offset-4 transition hover:text-white" to="/login">
            Back to login
          </Link>
        </>
      }
    >
      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      <form onSubmit={handleVerify} noValidate className="space-y-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          icon={<MailIcon />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <TextField
          id="otp"
          label="6-digit code"
          icon={<KeyIcon />}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          inputClassName="text-lg font-bold tracking-[0.5em]"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
        />

        <button className={primaryBtn} type="submit" disabled={submitting}>
          {submitting ? (
            <><SpinnerIcon /> Verifying…</>
          ) : (
            <>Verify <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
