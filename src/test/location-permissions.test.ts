import { describe, expect, it } from "vitest";
import { locationAllowed, isAdministrator } from "@/lib/locations";
import { homeFor } from "@/lib/auth";

describe("Location administration", () => {
  it("gives the superadmin access to every location", () => {
    expect(locationAllowed(["superadmin"], [], "bole")).toBe(true);
    expect(locationAllowed(["superadmin"], [], "arada")).toBe(true);
  });
  it("limits local admins to their assigned locations", () => {
    expect(locationAllowed(["admin"], ["bole"], "bole")).toBe(true);
    expect(locationAllowed(["admin"], ["bole"], "arada")).toBe(false);
    expect(locationAllowed(["admin"], ["bole"], null)).toBe(false);
  });
  it("supports multiple local administration memberships", () => {
    expect(locationAllowed(["admin"], ["bole", "arada"], "arada")).toBe(true);
  });
  it("never treats workers or residents as administrators", () => {
    expect(isAdministrator(["worker", "resident"])).toBe(false);
    expect(locationAllowed(["worker"], ["bole"], "bole")).toBe(false);
  });
  it("sends superadmins to the administration screen", () => {
    expect(homeFor(["superadmin"])).toBe("/admin");
  });
});