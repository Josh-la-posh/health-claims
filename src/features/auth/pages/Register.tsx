// src/features/auth/pages/Register.tsx
import AuthLayout from "./AuthLayout";
import { FormLabel, Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import Spinner from "../../../components/ui/spinner";
import { Mail, Phone, User, Home, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCountries, fetchIndustries, fetchIndustryCategories } from "../api";
import type { ApiEnvelope, Country, Industry, IndustryCategory, RegisterPayload, RegisterResponseData } from "../../../types/auth";
import { useRegister } from '../hooks';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { Dropdown } from "../../../components/ui/dropdown";
import { DropdownSelect } from "../../../components/ui/DropdownSelect";

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
  industryId: z.coerce.number().optional(),            // shadow field to fetch categories
  industryCategoryId: z.coerce.number().min(1, "Select a category"),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [industryId, setIndustryId] = useState<number | null>(null);

  const { data: countries, isLoading: loadingCountries, isError: errCountries, refetch: refetchCountries } =
    useQuery({ queryKey: ["countries"], queryFn: fetchCountries });

  const { data: industries, isLoading: loadingIndustries, isError: errIndustries, refetch: refetchIndustries } =
    useQuery({ queryKey: ["industries"], queryFn: fetchIndustries });

  const { data: categories, isFetching: fetchingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ["industry-categories", industryId],
    queryFn: () => fetchIndustryCategories(industryId as number),
    enabled: !!industryId,
  });

  const defaultCountry = useMemo(() => {
    const ng = countries?.find((c) => c.code === "NG" || c.id === "NG");
    return ng?.id ?? "NG";
  }, [countries]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        country: defaultCountry || "NG",
        businessName: "",
        contactEmail: "",
        contactPhoneNumber: "",
        contactFirstName: "",
        contactLastName: "",
        industryCategoryId: 1,
      },
    });

  useEffect(() => {
    if (defaultCountry) setValue("country", defaultCountry);
  }, [defaultCountry, setValue]);

  useEffect(() => {
    if (industryId) refetchCategories();
  }, [industryId, refetchCategories]);

  // const { mutateAsync } = useMutation({
  //   mutationFn: (payload: RegisterPayload) => useRegister(),
  // });

  const { mutateAsync } = useRegister()

  const onSubmit = async (values: FormValues) => {
    const payload: RegisterPayload = {
      country: values.country,
      businessName: values.businessName.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhoneNumber: values.contactPhoneNumber.trim(),
      contactFirstName: values.contactFirstName.trim(),
      contactLastName: values.contactLastName.trim(),
      industryCategoryId: values.industryCategoryId,
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
      let msg = "Registration failed. Please try again.";
      if (typeof e === "object" && e !== null && "response" in e) {
        const err = e as { response?: { data?: { message?: string } } };
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    }
  };

  const blockingLoads = loadingCountries || loadingIndustries;

  function setCountryId(value: string | number): void {
    setValue("country", String(value));
  }

  return (
    <AuthLayout
      title="Create your merchant account"
      subtitle="Onboard in minutes and start processing transactions"
    >
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
              leftIcon={<Home size={18} />}
              placeholder="e.g., Naira Stores Ltd."
              {...register("businessName")}
            />
            <FieldErrorText error={errors.businessName} />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>              
              <Input
                title="Email"
                leftIcon={<Mail size={18} />} placeholder="you@company.com" {...register("contactEmail")} />
              <FieldErrorText error={errors.contactEmail} />
            </div>
            <div>              
              <Input
                title="Phone Number"
                leftIcon={<Phone size={18} />} placeholder="0812 345 6789" {...register("contactPhoneNumber")} />
              <FieldErrorText error={errors.contactPhoneNumber} />
            </div>
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>              
              <Input
                title="First Name"
                leftIcon={<User size={18} />} placeholder="Jane" {...register("contactFirstName")} />
              <FieldErrorText error={errors.contactFirstName} />
            </div>
            <div>              
              <Input
                title="Last Name"
                leftIcon={<User size={18} />} placeholder="Doe" {...register("contactLastName")} />
              <FieldErrorText error={errors.contactLastName} />
            </div>
          </div>

          {/* Country + Industry */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="">
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
            </div>

            <div className="">
              <FormLabel title="Country"/>
              <DropdownSelect
                options={(countries || []).map((c) => ({ value: c.id, label: c.countryName }))}
                placeholder="Select country"
                value={defaultCountry}
                onChange={setCountryId}
              />
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
          {industryId && (
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
          )}

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
