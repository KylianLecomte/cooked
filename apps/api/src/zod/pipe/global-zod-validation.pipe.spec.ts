import { type ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import z from "zod";
import { createZodDto } from "../util/zod.util";
import { GlobalZodValidationPipe } from "./global-zod-validation.pipe";

const schema = z.object({ name: z.string(), age: z.number() });
const DtoWithSchema = createZodDto(schema);

const metaWithSchema: ArgumentMetadata = {
  type: "body",
  metatype: DtoWithSchema as unknown as new (...args: unknown[]) => unknown,
};

const metaWithoutSchema: ArgumentMetadata = {
  type: "body",
  metatype: class Plain {},
};

const metaNoMetatype: ArgumentMetadata = {
  type: "body",
  metatype: undefined,
};

describe("GlobalZodValidationPipe", () => {
  const pipe = new GlobalZodValidationPipe();

  describe("passthrough — no schema attached", () => {
    it("should return the value unchanged when metatype is undefined", () => {
      const value = { raw: true };
      expect(pipe.transform(value, metaNoMetatype)).toBe(value);
    });

    it("should return the value unchanged when metatype has no schema property", () => {
      const value = { raw: true };
      expect(pipe.transform(value, metaWithoutSchema)).toBe(value);
    });
  });

  describe("validation — schema is attached", () => {
    it("should return the parsed value on valid input", () => {
      const result = pipe.transform({ name: "Alice", age: 30 }, metaWithSchema);
      expect(result).toEqual({ name: "Alice", age: 30 });
    });

    it("should throw BadRequestException on invalid input", () => {
      expect(() => pipe.transform({ name: "Alice", age: "wrong" }, metaWithSchema)).toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when a required field is missing", () => {
      expect(() => pipe.transform({ name: "Alice" }, metaWithSchema)).toThrow(BadRequestException);
    });
  });
});
