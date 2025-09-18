// src/utils/validation.ts

/** Business name: letters, numbers, spaces, hyphens, apostrophes, 3–50 chars */
export const BUSINESS_REGEX = /^[a-zA-Z0-9\s\-']{3,50}$/;

/** Name: only letters, 2–24 chars */
export const NAME_REGEX = /^[a-zA-Z]{2,24}$/;

/** Email: basic RFC-compliant */
export const EMAIL_REGEX = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Phone: 10–15 digits, allows spaces, hyphens, parentheses */
export const PHONE_REGEX = /^[0-9\s\-()]{10,15}$/;

/** Password: 7–24 chars, at least one lowercase, uppercase, digit, special char */
export const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{7,24}$/;

export function isValidBusinessName(value: string): boolean {
  return BUSINESS_REGEX.test(value);
}

export function isValidName(value: string): boolean {
  return NAME_REGEX.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

export function isValidPassword(value: string): boolean {
  return PWD_REGEX.test(value);
}
