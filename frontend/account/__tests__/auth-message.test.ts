import { afterEach, describe, expect, it, vi } from "vitest";
import { authMessage, isSetupError } from "@/frontend/account/auth";

const fail = (code: string) => Object.assign(new Error("firebase"), { code });

describe("authMessage: what a reader sees when sign-in fails", () => {
  afterEach(() => vi.restoreAllMocks());

  it("says a bad setup isn't the reader's fault, and logs only the code", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    // The code Firebase builds from Google's "API key not valid. Please pass a valid API key." answer.
    const text = authMessage(fail("auth/api-key-not-valid.-please-pass-a-valid-api-key."));
    expect(text).toMatch(/isn't set up correctly/);
    expect(text).toMatch(/not your email or password/);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"code":"auth/api-key-not-valid.-please-pass-a-valid-api-key."'));
    for (const code of ["auth/invalid-api-key", "auth/configuration-not-found", "auth/unauthorized-domain", "auth/app-not-authorized"]) {
      expect(isSetupError(code)).toBe(true);
    }
  });

  it("keeps the usual messages for the reader's own mistakes", () => {
    expect(isSetupError("auth/invalid-credential")).toBe(false);
    expect(isSetupError("auth/invalid-api-keyring")).toBe(false);
    expect(authMessage(fail("auth/invalid-credential"))).toMatch(/don't match/);
    expect(authMessage(fail("auth/operation-not-allowed"))).toMatch(/isn't turned on/);
    expect(authMessage(new Error("no code"))).toBe("Sign-in didn't work. Try again.");
  });
});
