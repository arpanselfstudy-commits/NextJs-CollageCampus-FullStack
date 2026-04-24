'use client'

/** Returns a 0–4 strength score and label for a given password string. */
export function usePasswordStrength(password: string) {
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[^a-zA-Z0-9]/.test(password) ? 4
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength]

  return { strength, strengthLabel }
}
