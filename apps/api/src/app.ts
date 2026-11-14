import Fastify from "fastify";
import { healthRespSchema } from "@reservas/shared";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return healthRespSchema.parse({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
