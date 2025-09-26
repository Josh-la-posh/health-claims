export type LoginPayload = { email: string; password: string };

export type ApiEnvelope<T> = {
  data: T;
  message: string;
  isSuccess: boolean;
};

export type Aggregator = {
  aggregatorCode: string;
  aggregatorName: string;
};

export type Merchant = {
  id: number;
  contactEmail: string;
  supportEmail: string;
  disputeEmail: string;
  businessEmail: string;
  phoneNumber: string;
  website: string;
  merchantCode: string;
  merchantName: string;
  postalCode: string;
  countryCode: string;
  status: string;
  returnUrl: string;
  isWhitelisted: boolean;
  notificationURL: string;
  businessDescription: string;
  industryCategoryId: number;
  businessType: string;
  registrationType: string;
};

export type LoginUser = {
  id: string;
  fullName: string;
  emailAddress: string;
  token: string;
  role: string;
  hmoId: string;
  isProvider: boolean;
  providerId: string;
};

export type LoginResponseData = LoginUser;

export type LoginApiResponse = ApiEnvelope<LoginResponseData>;

export type Country = { id: string; countryName: string; code?: string };
export type Industry = { id: number; industryName: string };
export type IndustryCategory = { id: number; categoryName: string };

export type RegisterPayload = {
  country: string;
  businessName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactFirstName: string;
  contactLastName: string;
};

export type RegisterResponseData = {
  id: number;
  contactEmail: string;
  countryCode: string;
  status: string;
  isWhitelisted: boolean;
  industryCategoryId: number;
  businessType: string;
  registrationType: string;
};

export type SetPasswordWithTokenPayload = {
  token: string;
  password: string;
  email: string;
  confirmPassword: string;
};