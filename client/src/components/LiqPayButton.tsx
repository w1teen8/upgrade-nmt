import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPayment } from "../api/payments.api";

export function LiqPayButton({ courseId }: { courseId: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = await createPayment(courseId);
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = form.checkoutUrl;
      formEl.style.display = "none";

      const dataInput = document.createElement("input");
      dataInput.name = "data";
      dataInput.value = form.data;
      formEl.appendChild(dataInput);

      const signatureInput = document.createElement("input");
      signatureInput.name = "signature";
      signatureInput.value = form.signature;
      formEl.appendChild(signatureInput);

      document.body.appendChild(formEl);
      formEl.submit();
    } catch {
      setError("Не вдалося створити оплату. Спробуйте ще раз.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={handleBuy} disabled={loading}>
        {loading ? "Зачекайте..." : "Купити (Google Pay / Apple Pay / картка)"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
