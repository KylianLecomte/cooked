import { ArgumentsHost, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/nestjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SentryExceptionFilter } from "./sentry-exception.filter";

vi.mock("@sentry/nestjs", () => ({
  captureException: vi.fn(),
}));

describe("SentryExceptionFilter", () => {
  let filter: SentryExceptionFilter;
  let mockHost: ArgumentsHost;
  let superCatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new SentryExceptionFilter();
    mockHost = {} as ArgumentsHost;
    superCatchSpy = vi.spyOn(BaseExceptionFilter.prototype, "catch").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("HttpException (4xx/5xx expected errors)", () => {
    it("should NOT capture a 400 BadRequest in Sentry", () => {
      const exception = new HttpException("Bad Request", 400);
      filter.catch(exception, mockHost);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("should NOT capture a 404 NotFoundException in Sentry", () => {
      const exception = new HttpException("Not Found", 404);
      filter.catch(exception, mockHost);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("should still delegate to BaseExceptionFilter for HttpExceptions", () => {
      const exception = new HttpException("Forbidden", 403);
      filter.catch(exception, mockHost);
      expect(superCatchSpy).toHaveBeenCalledWith(exception, mockHost);
    });
  });

  describe("Non-HTTP errors (unexpected failures)", () => {
    it("should capture a generic Error in Sentry", () => {
      const exception = new Error("Database crashed");
      filter.catch(exception, mockHost);
      expect(Sentry.captureException).toHaveBeenCalledWith(exception);
    });

    it("should capture a non-Error object in Sentry", () => {
      const exception = { code: "UNKNOWN", detail: "something went wrong" };
      filter.catch(exception, mockHost);
      expect(Sentry.captureException).toHaveBeenCalledWith(exception);
    });

    it("should still delegate to BaseExceptionFilter for non-HTTP errors", () => {
      const exception = new Error("Unexpected");
      filter.catch(exception, mockHost);
      expect(superCatchSpy).toHaveBeenCalledWith(exception, mockHost);
    });
  });
});
