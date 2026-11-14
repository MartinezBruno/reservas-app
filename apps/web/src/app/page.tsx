import { healthRespSchema } from "@reservas/shared";

export default function Home() {
  const data = healthRespSchema.parse({
    status: "ok",
    timestamp: "2026-01-01T00:00:00.000Z",
  });
  return <p>shared funciona: {data.status}</p>;
}
