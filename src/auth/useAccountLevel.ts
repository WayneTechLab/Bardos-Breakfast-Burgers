import { useSyncExternalStore } from 'react'
import { getAccountCapabilities, getAccountLevelDefinition } from './accountLevels'
import { subscribeAuth, getAuthSnapshot } from './authStore'

export function useAccountLevel() {
  const state = useSyncExternalStore(subscribeAuth, getAuthSnapshot)
  return {
    ...state,
    definition: getAccountLevelDefinition(state.level),
    capabilities: getAccountCapabilities(state.level),
  }
}
