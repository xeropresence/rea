import { satisfies } from "semver";

/**
 * Supported Node.js releases, kept in sync with the published package engines.
 * The patch floors are Node.js security releases.
 */
export const SUPPORTED_NODE_VERSION_RANGE = "^22.23.4 || ^24.22.1 || >=26.12.1";

/** Human-readable form of {@link SUPPORTED_NODE_VERSION_RANGE} for remediation. */
export const SUPPORTED_NODE_VERSION_PROSE =
  "Node.js 22.x (>=22.23.4), 24.x (>=24.22.1), or 26.12.1+";

/**
 * Node.js API families a Bun runtime must declare compatibility with. Bun
 * implements these APIs itself instead of shipping Node.js, so Node.js
 * security patch floors do not describe a Bun release.
 */
const BUN_NODE_COMPATIBILITY_RANGE = "^22.19.0 || ^24.11.0 || >=26.0.0";

const BUN_NODE_COMPATIBILITY_PROSE =
  "Node.js 22.x (>=22.19.0), 24.x (>=24.11.0), or 26.0.0+";

/** JavaScript runtime executing REA. Bun also reports a Node.js compatibility version. */
export type JavaScriptRuntime =
  | { readonly id: "node"; readonly version: string }
  | {
      readonly id: "bun";
      readonly version: string;
      readonly nodeCompatibilityVersion: string;
    };

/** Identify the runtime from `process.versions`; only Bun reports `bun`. */
export const javaScriptRuntime = (versions: {
  readonly node: string;
  readonly bun?: string | undefined;
}): JavaScriptRuntime =>
  versions.bun === undefined
    ? { id: "node", version: versions.node }
    : {
        id: "bun",
        version: versions.bun,
        nodeCompatibilityVersion: versions.node,
      };

/**
 * Range a runtime is judged against: Node.js by its own version, Bun by the
 * Node.js compatibility version it declares.
 */
export const supportedRuntimeRange = (runtime: JavaScriptRuntime): string =>
  runtime.id === "node"
    ? SUPPORTED_NODE_VERSION_RANGE
    : BUN_NODE_COMPATIBILITY_RANGE;

export const supportsJavaScriptRuntime = (
  runtime: JavaScriptRuntime,
): boolean =>
  satisfies(
    runtime.id === "node" ? runtime.version : runtime.nodeCompatibilityVersion,
    supportedRuntimeRange(runtime),
  );

/** Recovery for an unsupported runtime; installing Node.js does not change the runtime Bun runs. */
export const unsupportedRuntimeAction = (runtime: JavaScriptRuntime): string =>
  runtime.id === "node"
    ? `Install ${SUPPORTED_NODE_VERSION_PROSE}`
    : `Upgrade Bun to a release that declares ${BUN_NODE_COMPATIBILITY_PROSE} compatibility`;
