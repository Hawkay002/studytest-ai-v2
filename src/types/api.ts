// API key validation state types.

export type ApiKeyStatus =
  | "unset"
  | "saved"
  | "testing"
  | "valid"
  | "invalid"

export interface StoredApiKey {
  key: string
  // ISO timestamp of last successful validation, if any
  validatedAt?: string
}
