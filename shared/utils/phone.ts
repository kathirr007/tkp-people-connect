import { isValidPhoneNumber as libphonenumberIsValid } from 'libphonenumber-js'

/**
 * Validates if a string is a valid international phone number.
 * Accepts numbers with or without country code (e.g., "+255123456789" or "0712345678").
 * Empty strings are considered valid (phone is optional).
 */
export function isValidPhoneNumber(value: string): boolean {
  if (!value || value.trim() === '') {
    return true
  }
  try {
    return libphonenumberIsValid(value)
  }
  catch {
    return false
  }
}
