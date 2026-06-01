export interface AuthenticationSignals {
  hasAuthFiles: boolean
  hasJwtLibrary: boolean
  hasPasswordHashingLibrary: boolean
  hasGuardOrMiddleware: boolean
  hasSessionOrTokenPattern: boolean
  authFilePaths: string[]
  detectedAuthLibraries: string[]
}
