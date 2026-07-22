import { describe, expect, it } from "vitest";
import { ApiAuthError, ApiError, normalizeError } from "@/lib/api/http";

describe("normalizeError", () => {
  it("reads the bare {error} envelope used by world-data routes", () => {
    const err = normalizeError(404, { error: "Scene 'x' not found" });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Scene 'x' not found");
    expect(err.status).toBe(404);
    expect(err.code).toBeUndefined();
  });

  it("reads the {error, code, details} envelope used by validated writes", () => {
    const err = normalizeError(400, {
      error: "The NPC could not be updated because some fields are invalid.",
      code: "VALIDATION_ERROR",
      details: [{ field: "name", message: "name cannot be blank." }],
    });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual([
      { field: "name", message: "name cannot be blank." },
    ]);
  });

  it("falls back to a generic message for non-JSON bodies (Render 502 HTML)", () => {
    const err = normalizeError(502, null);
    expect(err.message).toBe("Server error: 502");
    expect(err.status).toBe(502);
  });

  it("maps 401s to ApiAuthError regardless of envelope", () => {
    const err = normalizeError(401, { error: "Invalid or expired token" });
    expect(err).toBeInstanceOf(ApiAuthError);
    expect(err.message).toBe("Invalid or expired token");
  });
});
