import { BadRequestException } from "@nestjs/common";
import { ZodType } from "zod";

export function zodSafeParse(schema: ZodType, data: unknown): unknown {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    throw new BadRequestException(parseResult.error.message);
  }
  return parseResult.data;
}
