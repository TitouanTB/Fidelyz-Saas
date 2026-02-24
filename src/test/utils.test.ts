import { describe, it, expect } from "vitest";
import { cn, generateSlug, getInitials, truncate, formatCurrency } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("generateSlug", () => {
  it("converts name to slug", () => {
    expect(generateSlug("Acme Corp")).toBe("acme-corp");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("My   Company")).toBe("my-company");
  });
});

describe("getInitials", () => {
  it("gets initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("handles single word", () => {
    expect(getInitials("John")).toBe("JO");
  });

  it("limits to 2 characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("does not truncate short strings", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("formatCurrency", () => {
  it("formats currency in euros", () => {
    const result = formatCurrency(100, "EUR");
    expect(result).toContain("100");
  });
});
