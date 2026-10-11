import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/authApi.js";

const RESEND_COOLDOWN = 60; // seconds

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

  // count down the resend timer
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
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">Huddle</div>
        <h1 className="auth-title">Verify your email</h1>
        <div className="auth-hint">
          We sent a 6-digit code to {cleanEmail || "your email"}. It expires in 10 minutes.
          Check your spam folder if you don't see it.
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-hint">{message}</div>}

        <form onSubmit={handleVerify} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="otp">6-digit code</label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Verifying…" : "Verify"}
          </button>
        </form>

        <div className="auth-switch">
          Didn't get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {resending
              ? "Sending…"
              : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
          </button>{" "}
          · <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
