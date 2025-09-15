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

const validPayload = {
  country: 'NG',
  businessName: "Acme Stores Ltd",
  contactEmail: "test.user+1@example.com",
  contactPhoneNumber: "08123456789",
  contactFirstName: "Jane",
  contactLastName: "Doe",
};

const invalidPayload = {
  country: '',
  businessName: "!!",
  contactEmail: "not-an-email",
  contactPhoneNumber: "123",
  contactFirstName: "J",
  contactLastName: "Doe123",
};

function run() {
  console.log('Validating valid payload...');
  try {
    const res = schema.parse(validPayload);
    console.log('Valid payload passed validation:', res);
  } catch (e) {
    console.error('Valid payload failed:', e.errors || e);
  }

  console.log('\nValidating invalid payload...');
  try {
    schema.parse(invalidPayload);
    console.error('Invalid payload unexpectedly passed');
  } catch (e) {
    console.log('Invalid payload errors:');
    for (const err of e.errors) console.log('-', err.path.join('.'), ':', err.message);
  }
}

run();
