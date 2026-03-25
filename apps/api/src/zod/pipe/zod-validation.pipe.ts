import { Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";
import { zodSafeParse } from "../util/zod.util";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    return zodSafeParse(this.schema, value);
  }
}
