import { useForm } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import { User, Mail, Phone, Upload } from "lucide-react";
import { useState } from "react";
import { AxiosError } from "axios";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export default function ProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  async function onSubmit(values: ProfileFormValues) {
    try {
      // Save profile fields
      await api.put("/me", values);

      // Save avatar if uploaded
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.post("/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Profile updated successfully!");
      reset(values);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || "Failed to update profile");
      } else {
        toast.error("Failed to update profile");
      }
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground text-sm">
        Manage your personal information and avatar.
      </p>

      {/* Avatar uploader */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center text-lg font-medium">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            "U" // fallback initial, replace with user initial if available
          )}
        </div>
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Upload size={16} />
            <span>Upload Avatar</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
          <p className="text-xs text-muted mt-1">
            PNG, JPG, JPEG. Max 2MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="First Name"
            leftIcon={<User size={16} />}
            state={errors.firstName ? "error" : "default"}
            helper={errors.firstName?.message as string}
            {...register("firstName", { required: "First name is required" })}
          />
          <Input
            label="Last Name"
            leftIcon={<User size={16} />}
            state={errors.lastName ? "error" : "default"}
            helper={errors.lastName?.message as string}
            {...register("lastName", { required: "Last name is required" })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          leftIcon={<Mail size={16} />}
          state={errors.email ? "error" : "default"}
          helper={errors.email?.message as string}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" },
          })}
        />

        <Input
          label="Phone Number"
          type="tel"
          leftIcon={<Phone size={16} />}
          state={errors.phoneNumber ? "error" : "default"}
          helper={errors.phoneNumber?.message as string}
          {...register("phoneNumber", { required: "Phone number is required" })}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
