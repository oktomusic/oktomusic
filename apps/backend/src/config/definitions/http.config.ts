import { registerAs } from "@nestjs/config";

export default registerAs("http", () => {
  const port = Number(process.env.PORT ?? 3000);
  const trustProxy = process.env.TRUST_PROXY ?? "false";
  return {
    port,
    trustProxy,
  } as const;
});
