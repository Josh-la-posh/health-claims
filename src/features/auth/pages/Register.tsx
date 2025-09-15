import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import Spinner from "../../../components/ui/spinner";
import { Mail, Phone, User, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "../api";
import type { ApiEnvelope, RegisterPayload, RegisterResponseData } from "../../../types/auth";
import { useRegister } from '../hooks';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { getUserMessage, type AppError } from "../../../lib/error";
import AuthLayout from "../../../app/layouts/AuthLaoyout";

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

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { data: countries, isLoading: loadingCountries, isError: errCountries, refetch: refetchCountries } =
    useQuery({ queryKey: ["countries"], queryFn: fetchCountries });

  const defaultCountry = useMemo(() => {
    const ng = countries?.find((c) => c.code === "NG" || c.id === "NG");
    return ng?.id ?? "NG";
  }, [countries]);

  const { register, handleSubmit, formState: { errors, isSubmitting, touchedFields }, reset, setValue, watch } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        country: defaultCountry || "NG",
        businessName: "",
        contactEmail: "",
        contactPhoneNumber: "",
        contactFirstName: "",
        contactLastName: "",
        // industryCategoryId: 1,
      },
    });

  useEffect(() => {
    if (defaultCountry) setValue("country", defaultCountry);
  }, [defaultCountry, setValue]);

  const { mutateAsync } = useRegister()

  const onSubmit = async (values: FormValues) => {
    setErrMsg(null);
    const payload: RegisterPayload = {
      country: values.country,
      businessName: values.businessName.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhoneNumber: values.contactPhoneNumber.trim(),
      contactFirstName: values.contactFirstName.trim(),
      contactLastName: values.contactLastName.trim()
    };

    try {
      const res: ApiEnvelope<RegisterResponseData> = await mutateAsync(payload);
      toast.success(res.message || "Registration successful! Check your email to confirm your account.");
      reset();
      navigate("/register/success", {
        replace: true,
        state: {
          message: res.message,
          email: res.responseData?.contactEmail
        }
      });
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  const blockingLoads = loadingCountries;

  function setCountryId(value: string | number): void {
    setValue("country", String(value));
  }

  return (
    <AuthLayout
      title="Create your merchant account"
      subtitle="Onboard in minutes and start processing transactions"
    >
      <div className={errMsg ? 'w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]' : 'hidden'}>{errMsg}</div>
      {blockingLoads ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner /> Loading form…
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Business Name */}
          <div>
            <Input
              title="Business Name"
              maxLength={50}
              minLength={5}
              leftIcon={<Home size={18} />}
              placeholder="e.g., Naira Stores Ltd."
              helper="3–50 chars; letters, numbers, spaces, - and ' only"
              id="businessName"
              hasError={!!errors.businessName}
              isValid={touchedFields.businessName ? (!errors.businessName && !!(watch?.("businessName") ?? "")) : false}
              {...register("businessName")}
            />
            <FieldErrorText id="businessName-error" error={errors.businessName} />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                title="Email"
                type="email"
                leftIcon={<Mail size={18} />}
                placeholder="you@company.com"
                helper="Must be a valid email address"
                id="contactEmail"
                hasError={!!errors.contactEmail}
                isValid={touchedFields.contactEmail ? (!errors.contactEmail && !!(watch?.("contactEmail") ?? "")) : false}
                {...register("contactEmail")}
              />
              <FieldErrorText id="contactEmail-error" error={errors.contactEmail} />
            </div>
            <div>
              <Input
                title="Phone Number"
                type="tel"
                minLength={10}
                maxLength={11}
                leftIcon={<Phone size={18} />}
                placeholder="0812 345 6789"
                helper="10–15 digits (spaces or dashes allowed)"
                id="contactPhoneNumber"
                hasError={!!errors.contactPhoneNumber}
                isValid={touchedFields.contactPhoneNumber ? (!errors.contactPhoneNumber && !!(watch?.("contactPhoneNumber") ?? "")) : false}
                {...register("contactPhoneNumber")}
              />
              <FieldErrorText id="contactPhoneNumber-error" error={errors.contactPhoneNumber} />
            </div>
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                title="First Name"
                maxLength={20}
                minLength={2}
                leftIcon={<User size={18} />}
                placeholder="Jane"
                helper="2–24 letters, no spaces"
                id="contactFirstName"
                hasError={!!errors.contactFirstName}
                isValid={touchedFields.contactFirstName ? (!errors.contactFirstName && !!(watch?.("contactFirstName") ?? "")) : false}
                {...register("contactFirstName")}
              />
              <FieldErrorText id="contactFirstName-error" error={errors.contactFirstName} />
            </div>
            <div>
              <Input
                title="Last Name"
                maxLength={20}
                minLength={2}
                leftIcon={<User size={18} />}
                placeholder="Doe"
                helper="2–24 letters, no spaces"
                id="contactLastName"
                hasError={!!errors.contactLastName}
                isValid={touchedFields.contactLastName ? (!errors.contactLastName && !!(watch?.("contactLastName") ?? "")) : false}
                {...register("contactLastName")}
              />
              <FieldErrorText id="contactLastName-error" error={errors.contactLastName} />
            </div>
          </div>

          {/* Country + Industry */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* <div className="">
              <FormLabel title="Industry"/>
              <DropdownSelect
                options={(industries || []).map((i) => ({ value: i.id, label: i.industryName }))}
                placeholder="Select industry"
                value={industryId ?? ""}
                onChange={(value) => setIndustryId(Number(value))}
              />
              {errIndustries && (
                <button
                  type="button"
                  className="mt-1 text-xs text-blue-600 hover:underline"
                  onClick={() => refetchIndustries()}
                >
                  Retry loading industries
                </button>
              )}
            </div> */}

            <div className="">
              <DropdownSelect
                title="Country"
                helper="Choose your country"
                id="country"
                options={(countries || []).map((c) => ({ value: c.id, label: c.countryName }))}
                placeholder="Select country"
                value={defaultCountry}
                onChange={setCountryId}
                hasError={!!errors.country}
                isValid={touchedFields.country ? (!errors.country && !!(watch?.("country") ?? "")) : false}
              />
              <FieldErrorText id="country-error" error={errors.country} />
              {errCountries && (
                <button
                  type="button"
                  className="mt-1 text-xs text-blue-600 hover:underline"
                  onClick={() => refetchCountries()}
                >
                  Retry loading countries
                </button>
              )}
            </div>
          </div>

          {/* Industry Category (appears after industry chosen) */}
          {/* {industryId && (
            <div>
              <label className="mb-1 block text-sm font-medium">Industry Category</label>
              <select
                className={cn(
                  "w-full h-10 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-4",
                  "border-gray-300 focus:ring-blue-100"
                )}
                {...register("industryCategoryId")}
                disabled={fetchingCategories}
              >
                {(categories || []).map((c: IndustryCategory) => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
              </select>
              <FieldErrorText error={errors.industryCategoryId} />
              {fetchingCategories && (
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <Spinner /> Loading categories…
                </div>
              )}
            </div>
          )} */}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering…" : "Register"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">Log in</a>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
