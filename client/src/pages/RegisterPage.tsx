import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth.api";
import { ApiError } from "../api/client";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: "Введіть коректну електронну пошту.",
  PASSWORD_TOO_SHORT: "Пароль має містити щонайменше 8 символів.",
  EMAIL_TAKEN: "Ця пошта вже зареєстрована.",
};

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
      setSubmitted(true);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;
      setError((code && ERROR_MESSAGES[code]) ?? "Сталася помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="page auth-page">
        <h1>Перевірте пошту</h1>
        <p>
          Ми надіслали лист із посиланням для підтвердження на <strong>{email}</strong>.
          Підтвердіть email, а потім увійдіть.
        </p>
        <Link to="/login" className="btn btn-primary">
          Перейти до входу
        </Link>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <h1>Реєстрація</h1>
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
            minLength={8}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Реєстрація..." : "Зареєструватися"}
        </button>
      </form>
      <p>
        Вже маєте акаунт? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
}
