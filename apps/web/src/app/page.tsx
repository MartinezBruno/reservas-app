import { healthRespSchema } from "@reservas/shared";

export default function Home() {
  const data = healthRespSchema.parse({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
  return <p>shared funciona: {data.status}</p>;
}
