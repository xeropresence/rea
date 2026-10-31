import { describe, expect, it } from "vitest";

import { SUPPORTED_NODE_VERSION_RANGE } from "./runtimeVersion.js";
import { versionReport, versionReportSchema } from "./versionReport.js";

const host = {
  packageName: "rea-agents",
  packageVersion: "6.7.0",
  platform: "linux",
  architecture: "x64",
} as const;

describe("version report", () => {
  it("reports the package, Node.js runtime, platform and support", () => {
    const report = versionReport({ ...host, versions: { node: "24.22.1" } });

    expect(versionReportSchema.parse(report)).toEqual({
      name: "rea-agents",
      version: "6.7.0",
      runtime: { id: "node", version: "24.22.1" },
      platform: "linux",
      architecture: "x64",
      supported_runtime: {
        range: SUPPORTED_NODE_VERSION_RANGE,
        satisfied: true,
      },
    });
  });

  it("reports the Node.js compatibility range Bun is judged against", () => {
    const report = versionReport({
      ...host,
      versions: { node: "26.3.0", bun: "1.4.4" },
    });

    expect(versionReportSchema.parse(report)).toMatchObject({
      runtime: {
        id: "bun",
        version: "1.4.4",
        node_compatibility_version: "26.3.0",
      },
      supported_runtime: {
        range: "^22.19.0 || ^24.11.0 || >=26.0.0",
        satisfied: true,
      },
    });
  });

  it("rejects fields outside the documented schema", () => {
    const report = versionReport({ ...host, versions: { node: "24.22.1" } });

    expect(
      versionReportSchema.safeParse({ ...report, home: "/home/user" }).success,
    ).toBe(false);
  });
});
