export interface StateManagementSignals {
  hasStateLibrary: boolean
  detectedStateLibrary: string | null
  hasContextApi: boolean
  hasCustomHooks: boolean
  customHookPaths: string[]
}
