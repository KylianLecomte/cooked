import { BadRequestException } from "@nestjs/common";
import { ZodType } from "zod";
import { ZodDto } from "../type/zod.type";

export function zodSafeParse<T>(schema: ZodType<T>, data: unknown): T {
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

export function createZodDto<T>(schema: ZodType<T>) {
  class ZodDto {
    static readonly schema = schema;

    static create(input: unknown): T {
      return schema.parse(input);
    }
  }

  return ZodDto as unknown as {
    new (): T;
    schema: ZodType<T>;
  };
}

export function hasSchema(obj: unknown): obj is ZodDto {
  return typeof obj === "function" && "schema" in obj;
}
