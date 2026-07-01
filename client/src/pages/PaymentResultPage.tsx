import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paymentStatus } from "../api/payments.api";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [status, setStatus] = useState<string>("pending");
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await paymentStatus(orderId!);
        if (cancelled) return;
        setStatus(res.status);
        attemptsRef.current += 1;
        if (res.status === "pending" && attemptsRef.current < 15) {
          setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="page auth-page">
      <h1>Статус оплати</h1>
      {status === "paid" && (
        <>
          <p>Оплата успішна! Курс уже доступний у вашому кабінеті.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Перейти до кабінету
          </Link>
        </>
      )}
      {status === "pending" && <p>Обробляємо вашу оплату, зачекайте...</p>}
      {status === "failed" && <p>Оплата не пройшла. Спробуйте ще раз.</p>}
      {status === "error" && <p>Не вдалося перевірити статус оплати.</p>}
    </div>
  );
}
