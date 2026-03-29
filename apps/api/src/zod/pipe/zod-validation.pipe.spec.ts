import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import z from "zod";
import { GlobalZodValidationPipe } from "./zod-validation.pipe";

describe("GlobalZodValidationPipe (schema-constructor variant)", () => {
  const schema = z.object({ name: z.string(), age: z.number() });
  const pipe = new GlobalZodValidationPipe(schema);

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should return the parsed value on valid input", () => {
    const result = pipe.transform({ name: "Alice", age: 30 }, {} as never);
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("should throw BadRequestException on invalid input", () => {
    expect(() => pipe.transform({ name: "Alice", age: "wrong" }, {} as never)).toThrow(
      BadRequestException,
    );
  });
});
