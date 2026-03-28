import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodSafeParse } from "./zod.util";

describe("zodSafeParse<T>", () => {
  it("should infer and return correct type", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const result = zodSafeParse(schema, {
      name: "Alice",
      age: 25,
    });

    // Typage vérifié implicitement
    expect(result.name).toBe("Alice");
    expect(result.age).toBe(25);
  });

  it("should throw formatted errors", () => {
    const schema = z.object({
      age: z.number(),
    });

    expect(() => zodSafeParse(schema, { age: "wrong" })).toThrow(BadRequestException);
  });
});
