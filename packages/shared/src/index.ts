import { z } from "zod";

export const healthRespSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthRespSchema>;
