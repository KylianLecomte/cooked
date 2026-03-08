import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/nestjs";

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    // HttpException (4xx) = erreurs attendues — pas de bruit dans Sentry
    // Error non-HTTP = vrai problème — capturer
    if (!(exception instanceof HttpException)) {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }
}
