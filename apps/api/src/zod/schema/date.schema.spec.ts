import { describe, expect, it } from "vitest";
import { dateSchema, uuidSchema } from "./date.schema";

describe("dateSchema", () => {
  it("should accept a valid ISO date string", () => {
    expect(dateSchema.safeParse("2024-03-15").success).toBe(true);
  });

  it("should reject a non-ISO date string", () => {
    expect(dateSchema.safeParse("15/03/2024").success).toBe(false);
  });

  it("should reject a datetime string (date only expected)", () => {
    expect(dateSchema.safeParse("2024-03-15T12:00:00Z").success).toBe(false);
  });

  it("should reject an invalid date", () => {
    expect(dateSchema.safeParse("not-a-date").success).toBe(false);
  });
});

describe("uuidSchema", () => {
  it("should accept a valid UUID v4", () => {
    expect(uuidSchema.safeParse("b0a8c2d4-b239-47b6-b276-14afffc872c9").success).toBe(true);
  });

  it("should reject a non-UUID string", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
  });

  it("should reject an empty string", () => {
    expect(uuidSchema.safeParse("").success).toBe(false);
  });
});
