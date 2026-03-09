import { daysFromNow, getExpiryLabel, getExpiryStatus, defaultExpiry } from "../../src/utils/dates";

describe("daysFromNow", () => {
  it("should return 999 for empty string", () => {
    expect(daysFromNow("")).toBe(999);
  });

  it("should return 0 for today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(daysFromNow(today)).toBe(0);
  });

  it("should return negative for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysFromNow(past.toISOString().split("T")[0])).toBe(-3);
  });
});

describe("getExpiryLabel", () => {
  it("should return empty for no date", () => {
    expect(getExpiryLabel("")).toBe("");
  });

  it("should return 'Today!' for today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(getExpiryLabel(today)).toBe("Today!");
  });
});

describe("defaultExpiry", () => {
  it("should return a date 7 days ahead by default", () => {
    const result = defaultExpiry();
    expect(daysFromNow(result)).toBe(7);
  });
});
