import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { hasSchema, zodSafeParse } from "../util/zod.util";

@Injectable()
export class GlobalZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const metatype = metadata.metatype;

    if (!metatype || !hasSchema(metatype)) {
      return value;
    }

    return zodSafeParse(metatype.schema, value);
  }
}
