import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { healthRespSchema } from "@reservas/shared";
import { buildApp } from "./app.js";

describe("GET /health", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responde 200 con un body que cumple el schema compartido", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(healthRespSchema.safeParse(res.json()).success).toBe(true);
  });
});
