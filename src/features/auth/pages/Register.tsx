import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Spinner from "../../../components/ui/spinner";
import { Mail, Phone, User, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "../api";
import type { ApiEnvelope, RegisterPayload, RegisterResponseData } from "../../../types/auth";
import { useRegister } from "../hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { getUserMessage, type AppError } from "../../../lib/error";
import AuthLayout from "../../../app/layouts/AuthLaoyout";
import { useFieldControl } from "../../../hooks/useFieldState";
import { registerSchema, type RegisterInput } from "../../../utils/schemas";

export default function Register() {
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // countries query
  const {
    data: countries,
    isLoading: loadingCountries,
    isError: errCountries,
    refetch: refetchCountries,
  } = useQuery({ queryKey: ["countries"], queryFn: fetchCountries });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: "NG",
      businessName: "",
      contactEmail: "",
      contactPhoneNumber: "",
      contactFirstName: "",
      contactLastName: "",
    },
  });

  useEffect(() => {
    if (countries && !watch("country")) {
      const ng = countries.find(c => c.code === "NG" || c.id === "NG");
      setValue("country", ng?.id ?? countries[0]?.id ?? "");
    }
  }, [countries, setValue, watch]);

  const { mutateAsync } = useRegister();

  const onSubmit = async (values: RegisterInput) => {
    setErrMsg(null);
    const payload: RegisterPayload = {
      country: values.country,
      businessName: values.businessName.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhoneNumber: values.contactPhoneNumber.trim(),
      contactFirstName: values.contactFirstName.trim(),
      contactLastName: values.contactLastName.trim(),
    };

    try {
      const res: ApiEnvelope<RegisterResponseData> = await mutateAsync(payload);
      toast.success(res.message || "Registration successful! Check your email to confirm your account.");
      reset();
      navigate("/register/success", {
        replace: true,
        state: { message: res.message, email: res.responseData?.contactEmail },
      });
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  const blockingLoads = loadingCountries;

  // helpers
  const businessName = useFieldControl("businessName", errors, touchedFields, watch("businessName"));
  const email = useFieldControl("contactEmail", errors, touchedFields, watch("contactEmail"));
  const phone = useFieldControl("contactPhoneNumber", errors, touchedFields, watch("contactPhoneNumber"));
  const firstName = useFieldControl("contactFirstName", errors, touchedFields, watch("contactFirstName"));
  const lastName = useFieldControl("contactLastName", errors, touchedFields, watch("contactLastName"));
  const country = useFieldControl("country", errors, touchedFields, watch("country"));

  return (
    <AuthLayout title="Create your merchant account" subtitle="Onboard in minutes and start processing transactions">
      {errMsg && <div className="w-full py-3 mb-4 rounded bg-red-100 text-red-800 text-center font-medium">{errMsg}</div>}

      {blockingLoads ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner /> Loading form…
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Business Name */}
          <Input
            label="Business Name"
            leftIcon={<Home size={18} />}
            placeholder="e.g., Naira Stores Ltd."
            maxLength={50}
            minLength={3}
            helper={businessName.errorMessage || "3–50 chars; letters, numbers, spaces, - and ' only"}
            id="businessName"
            state={businessName.state}
            {...register("businessName")}
          />

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              leftIcon={<Mail size={18} />}
              placeholder="you@company.com"
              helper={email.errorMessage || "Must be a valid email address"}
              id="contactEmail"
              state={email.state}
              {...register("contactEmail")}
            />
            <Input
              label="Phone Number"
              type="tel"
              minLength={10}
              maxLength={15}
              leftIcon={<Phone size={18} />}
              placeholder="0812 345 6789"
              helper={phone.errorMessage || "10–15 digits (spaces or dashes allowed)"}
              id="contactPhoneNumber"
              state={phone.state}
              {...register("contactPhoneNumber")}
            />
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              leftIcon={<User size={18} />}
              placeholder="Jane"
              helper={firstName.errorMessage || "2–24 letters, no spaces"}
              id="contactFirstName"
              state={firstName.state}
              {...register("contactFirstName")}
            />
            <Input
              label="Last Name"
              leftIcon={<User size={18} />}
              placeholder="Doe"
              helper={lastName.errorMessage || "2–24 letters, no spaces"}
              id="contactLastName"
              state={lastName.state}
              {...register("contactLastName")}
            />
          </div>

          {/* Country */}
          <DropdownSelect
            label="Country"
            helper={country.errorMessage || "Choose your country"}
            id="country"
            options={(countries || []).map((c) => ({ value: c.id, label: c.countryName }))}
            placeholder="Select country"
            value={watch("country")}
            state={country.state}
            onChange={(val) => setValue("country", String(val))}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Registering…"
          >
            Register
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
