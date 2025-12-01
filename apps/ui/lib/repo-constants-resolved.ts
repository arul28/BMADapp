// Use a static relative import so bundlers (Turbopack/Next) can resolve it.
// This keeps the module available to both server and client bundles.
import * as constants from "./repo-constants"

export const REQUIRED_ARTIFACTS: string[] = constants.REQUIRED_ARTIFACTS
export const OPTIONAL_ARTIFACTS: string[] = constants.OPTIONAL_ARTIFACTS ?? []
