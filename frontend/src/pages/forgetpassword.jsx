import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authApi.js";
import {
  AuthShell,
  Notice,
  TextField,
  PasswordField,
  MailIcon,
  KeyIcon,
  ArrowIcon,
  SpinnerIcon,
  primaryBtn,
} from "../components/ui/shared";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={<>Reset your<br />password<span className="text-[#2563EB]">.</span></>}
      subtitle={
        step === 1
          ? "Enter your email and we'll send you a 6-digit code."
          : "Enter the code we sent and choose a new password."
      }
      footer={
        <Link className="font-bold text-[#B8F34A] underline decoration-[#B8F34A]/50 underline-offset-4 transition hover:text-white" to="/login">
          Back to login
        </Link>
      }
    >
      <div className="mb-6 flex gap-1.5" aria-hidden="true">
        {[1, 2].map((n) => (
          <span key={n} className={`h-1 flex-1 transition-colors ${n <= step ? "bg-[#2563EB]" : "bg-white/10"}`} />
        ))}
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      {step === 1 && (
        <form onSubmit={handleSendOtp} noValidate className="space-y-5">
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
          <button className={primaryBtn} type="submit" disabled={loading}>
            {loading ? (
              <><SpinnerIcon /> Sending…</>
            ) : (
              <>Send code <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} noValidate className="space-y-5">
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
          <PasswordField
            id="newPassword"
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className={primaryBtn} type="submit" disabled={loading}>
            {loading ? (
              <><SpinnerIcon /> Resetting…</>
            ) : (
              <>Reset password <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError("");
              setMessage("");
            }}
            className="w-full text-center text-xs font-bold uppercase tracking-[0.18em] text-[#A8B5CC] transition hover:text-[#22D3EE]"
          >
            Use a different email
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
