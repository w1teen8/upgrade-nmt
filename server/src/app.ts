import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import coursesRoutes from "./routes/courses.routes";
import paymentsRoutes from "./routes/payments.routes";
import adminRoutes from "./routes/admin.routes";
import meRoutes from "./routes/me.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));

const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.path === "/api/payments/liqpay/webhook") return next();
  return jsonParser(req, res, next);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/me", meRoutes);

app.use(errorHandler);
