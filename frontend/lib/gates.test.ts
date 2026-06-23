import { describe, expect, it } from "vitest";

import { decodeGateCondition, describeGateCondition } from "@/lib/gates";

describe("decodeGateCondition", () => {
  it("decodes PriceAbove unions", () => {
    expect(
      decodeGateCondition({
        tag: "PriceAbove",
        values: [19_450_000n],
      })
    ).toEqual({ kind: "PriceAbove", thresholdUsd: 1.945 });
  });

  it("decodes PriceBelow unions", () => {
    expect(
      decodeGateCondition({
        tag: "PriceBelow",
        values: [12_500_000n],
      })
    ).toEqual({ kind: "PriceBelow", thresholdUsd: 1.25 });
  });

  it("decodes PriceRange unions", () => {
    expect(
      decodeGateCondition({
        tag: "PriceRange",
        values: [15_000_000n, 25_000_000n],
      })
    ).toEqual({
      kind: "PriceRange",
      minPriceUsd: 1.5,
      maxPriceUsd: 2.5,
    });
  });
});

describe("describeGateCondition", () => {
  it("formats range conditions for display", () => {
    expect(
      describeGateCondition({
        kind: "PriceRange",
        minPriceUsd: 1.5,
        maxPriceUsd: 2.5,
      })
    ).toContain("Price stays in range");
  });
});
