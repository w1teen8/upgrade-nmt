import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  resendApiKey: required("RESEND_API_KEY"),
  emailFrom: required("EMAIL_FROM"),
  liqpayPublicKey: required("LIQPAY_PUBLIC_KEY"),
  liqpayPrivateKey: required("LIQPAY_PRIVATE_KEY"),
  liqpaySandbox: process.env.LIQPAY_SANDBOX !== "false",
  appUrl: required("APP_URL"),
  serverUrl: required("SERVER_URL"),
  corsOrigin: required("CORS_ORIGIN"),
  r2AccountId: required("R2_ACCOUNT_ID"),
  r2AccessKeyId: required("R2_ACCESS_KEY_ID"),
  r2SecretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  r2Bucket: required("R2_BUCKET"),
  r2PublicUrl: required("R2_PUBLIC_URL"),
};
