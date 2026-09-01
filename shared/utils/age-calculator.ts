/**
 * Calculate age from date of birth
 * @param dateOfBirth Date of birth in YYYY-MM-DD format or ISO string
 * @returns Age in years, or null if dateOfBirth is not provided or invalid
 */
export function calculateAgeFromDateOfBirth(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) {
    return null
  }

  try {
    const birthDate = new Date(dateOfBirth)

    // Check if the date is valid
    if (Number.isNaN(birthDate.getTime())) {
      return null
    }

    const today = new Date()

    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear()

    // Adjust if the birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age >= 0 ? age : null
  }
  catch (error) {
    console.error('Error calculating age:', error)
    return null
  }
}
