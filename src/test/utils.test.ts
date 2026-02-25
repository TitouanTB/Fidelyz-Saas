import { describe, it, expect } from "vitest";
import { cn, generateSlug, getInitials, truncate, formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";

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
  
  it("formats currency in dollars", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toContain("100");
  });
  
  it("handles zero amount", () => {
    const result = formatCurrency(0, "EUR");
    expect(result).toContain("0");
  });
  
  it("handles decimal amounts", () => {
    const result = formatCurrency(99.99, "EUR");
    expect(result).toContain("99,99");
  });
});

describe("formatDate", () => {
  it("formats date from Date object", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toContain("15");
    expect(result).toContain("jan");
    expect(result).toContain("2024");
  });
  
  it("formats date from string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("15");
  });
});

describe("formatRelativeDate", () => {
  it("returns Today for current date", () => {
    const today = new Date();
    const result = formatRelativeDate(today);
    expect(result).toBe("Today");
  });
  
  it("returns Yesterday for previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatRelativeDate(yesterday);
    expect(result).toBe("Yesterday");
  });
  
  it("returns days ago for less than a week", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const result = formatRelativeDate(threeDaysAgo);
    expect(result).toBe("3 days ago");
  });
  
  it("returns weeks ago for less than a month", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const result = formatRelativeDate(twoWeeksAgo);
    expect(result).toContain("weeks ago");
  });
  
  it("returns months ago for less than a year", () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const result = formatRelativeDate(twoMonthsAgo);
    expect(result).toContain("months ago");
  });
  
  it("returns years ago for dates older than a year", () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const result = formatRelativeDate(twoYearsAgo);
    expect(result).toContain("years ago");
  });
});

describe("getInitials", () => {
  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });
  
  it("handles names with special characters", () => {
    expect(getInitials("Jean-Pierre Dumas")).toBe("JD");
  });
  
  it("handles lowercase names", () => {
    expect(getInitials("john doe").toUpperCase()).toBe("JD");
  });
});

describe("generateSlug", () => {
  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });
  
  it("converts uppercase to lowercase", () => {
    expect(generateSlug("HELLO")).toBe("hello");
  });
  
  it("removes leading and trailing dashes", () => {
    expect(generateSlug("  hello  ")).toBe("hello");
  });
  
  it("handles underscores", () => {
    expect(generateSlug("hello_world")).toBe("hello-world");
  });
});

describe("truncate", () => {
  it("returns same string if equal to length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
  
  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
  
  it("handles length of 0", () => {
    expect(truncate("Hello", 0)).toBe("...");
  });
});
