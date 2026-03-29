import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import z from "zod";
import { createZodDto, hasSchema, zodSafeParse } from "./zod.util";

describe("zodSafeParse", () => {
  const schema = z.object({ name: z.string(), age: z.number() });

  it("should return the parsed data on valid input", () => {
    const result = zodSafeParse(schema, { name: "Alice", age: 25 });
    expect(result).toEqual({ name: "Alice", age: 25 });
  });

  it("should throw BadRequestException on invalid input", () => {
    expect(() => zodSafeParse(schema, { name: "Alice", age: "wrong" })).toThrow(
      BadRequestException,
    );
  });

  it("should include the field path in the error payload", () => {
    try {
      zodSafeParse(schema, { name: "Alice", age: "wrong" });
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as { message: { path: string }[] };
      expect(body.message[0].path).toBe("age");
    }
  });

  it("should use (root) for top-level errors without a path", () => {
    const rootSchema = z.string();
    try {
      zodSafeParse(rootSchema, 42);
    } catch (err) {
      const body = (err as BadRequestException).getResponse() as { message: { path: string }[] };
      expect(body.message[0].path).toBe("(root)");
    }
  });

  it("should join nested paths with a dot", () => {
    const nested = z.object({ address: z.object({ city: z.string() }) });
    try {
      zodSafeParse(nested, { address: { city: 123 } });
    } catch (err) {
      const body = (err as BadRequestException).getResponse() as { message: { path: string }[] };
      expect(body.message[0].path).toBe("address.city");
    }
  });
});

describe("createZodDto", () => {
  const schema = z.object({ email: z.string().email() });

  it("should expose the schema as a static property", () => {
    const Dto = createZodDto(schema);
    expect(Dto.schema).toBe(schema);
  });

  it("should be instantiable (NestJS pipe compatibility)", () => {
    const Dto = createZodDto(schema);
    expect(new Dto()).toBeDefined();
  });
});

describe("hasSchema", () => {
  it("should return true for a class with a schema property", () => {
    const Dto = createZodDto(z.object({ x: z.number() }));
    expect(hasSchema(Dto)).toBe(true);
  });

  it("should return false for a plain class without a schema property", () => {
    class Plain {}
    expect(hasSchema(Plain)).toBe(false);
  });

  it("should return false for a non-function value", () => {
    expect(hasSchema({ schema: z.string() })).toBe(false);
    expect(hasSchema(null)).toBe(false);
    expect(hasSchema("string")).toBe(false);
  });
});
