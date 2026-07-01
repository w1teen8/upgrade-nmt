import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/auth.api";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div className="page auth-page">
      <h1>Підтвердження email</h1>
      {status === "loading" && <p>Перевіряємо...</p>}
      {status === "success" && (
        <>
          <p>Email підтверджено! Тепер ви можете увійти.</p>
          <Link to="/login" className="btn btn-primary">
            Перейти до входу
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p>Посилання недійсне або застаріле.</p>
          <Link to="/login">Спробувати увійти та надіслати лист повторно</Link>
        </>
      )}
    </div>
  );
}
