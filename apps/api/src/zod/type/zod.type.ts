import { ZodType } from "zod";

export type ZodDto<T = unknown> = {
  schema: ZodType<T>;
};
