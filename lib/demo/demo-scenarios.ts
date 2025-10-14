/**
 * DEPRECATED: Demo scenarios have been moved to lib/scenarios/predefined-scenarios.ts
 * This stub exists only for backward compatibility.
 */

import { PREDEFINED_SCENARIOS } from "@/lib/scenarios/predefined-scenarios"

export function getDemoScenario(id: string) {
  return PREDEFINED_SCENARIOS.find(s => s.id === id) || null
}
