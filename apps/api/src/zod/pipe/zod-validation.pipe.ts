import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";
import { zodSafeParse } from "../util/zod.util";

@Injectable()
export class GlobalZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    return zodSafeParse(this.schema, value);
  }
}
