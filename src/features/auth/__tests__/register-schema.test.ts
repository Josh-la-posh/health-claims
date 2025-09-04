import { describe, it, expect } from 'vitest';
import * as z from 'zod';

const BUSINESS_REGEX = /^[a-zA-Z0-9\s\-']{3,50}$/;
const NAME_REGEX = /^[a-zA-Z]{2,24}$/;
const PHONE_REGEX = /^[0-9\s\-()]{10,15}$/;
const EMAIL_REGEX = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const schema = z.object({
  country: z.string().min(1, "Country is required"),
  businessName: z.string().regex(BUSINESS_REGEX, "3–50 chars; letters, numbers, spaces, - and ' only"),
  contactEmail: z.string().regex(EMAIL_REGEX, "Enter a valid email"),
  contactPhoneNumber: z.string().regex(PHONE_REGEX, "10–15 digits (spaces or dashes allowed)"),
  contactFirstName: z.string().regex(NAME_REGEX, "2–24 letters, no spaces"),
  contactLastName: z.string().regex(NAME_REGEX, "2–24 letters, no spaces"),
});

describe('register schema', () => {
  it('accepts valid payload', () => {
    const payload = {
      country: 'NG',
      businessName: 'Acme Stores Ltd',
      contactEmail: 'jane.doe@example.com',
      contactPhoneNumber: '08123456789',
      contactFirstName: 'Jane',
      contactLastName: 'Doe'
    };
    expect(() => schema.parse(payload)).not.toThrow();
  });

  it('rejects invalid payload', () => {
    const payload = {
      country: '',
      businessName: '!!',
      contactEmail: 'not-email',
      contactPhoneNumber: '123',
      contactFirstName: 'J',
      contactLastName: 'Doe123'
    };
    try {
      schema.parse(payload);
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        expect(e.errors.length).toBeGreaterThanOrEqual(1);
      } else {
        throw e;
      }
    }
  });
});
