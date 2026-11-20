import { describe, expect, it } from "vitest";
import { healthRespSchema } from "./index.js";

describe("schema de /health", () => {
  const valido = { status: "ok", timestamp: "2026-11-19T12:00:00.000Z" };

  it("acepta una respuesta con status ok y timestamp ISO", () => {
    expect(healthRespSchema.safeParse(valido).success).toBe(true);
  });

  it("rechaza un status distinto de ok", () => {
    const resultado = healthRespSchema.safeParse({ ...valido, status: "down" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un timestamp que no es ISO 8601", () => {
    const resultado = healthRespSchema.safeParse({
      ...valido,
      timestamp: "19/11/2026 12:00",
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una respuesta sin timestamp", () => {
    const resultado = healthRespSchema.safeParse({ status: "ok" });
    expect(resultado.success).toBe(false);
  });
});
