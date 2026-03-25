import { BadRequestException } from "@nestjs/common";
import { ZodType } from "zod";

export function zodSafeParse(schema: ZodType, data: unknown): unknown {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    }));
    throw new BadRequestException(errors);
  }
  return parseResult.data;
}
