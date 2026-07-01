import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { resendVerification } from "../api/auth.api";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Невірна пошта або пароль.",
  EMAIL_NOT_VERIFIED: "Підтвердіть email перед входом.",
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;
      setErrorCode(code ?? null);
      setError((code && ERROR_MESSAGES[code]) ?? "Сталася помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendVerification(email);
      setResent(true);
    } catch {
      setResent(true);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Вхід</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        {errorCode === "EMAIL_NOT_VERIFIED" && !resent && (
          <button type="button" className="link-button" onClick={handleResend}>
            Надіслати лист підтвердження ще раз
          </button>
        )}
        {resent && <p>Лист надіслано, якщо акаунт існує.</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>
      <p>
        Немає акаунта? <Link to="/register">Зареєструватися</Link>
      </p>
    </div>
  );
}
