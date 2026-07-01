import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.resendApiKey);

export async function sendVerificationEmail(toEmail: string, token: string): Promise<void> {
  const link = `${env.appUrl}/#/verify-email?token=${token}`;
  await resend.emails.send({
    from: env.emailFrom,
    to: toEmail,
    subject: "Підтвердіть вашу електронну пошту",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Підтвердження реєстрації</h2>
        <p>Дякуємо за реєстрацію на курсах підготовки до НМТ 2027!</p>
        <p>Щоб завершити реєстрацію, підтвердіть вашу електронну пошту:</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Підтвердити email</a></p>
        <p>Або перейдіть за посиланням: <br/>${link}</p>
        <p style="color:#888;font-size:12px;">Посилання дійсне протягом 24 годин.</p>
      </div>
    `,
  });
}
