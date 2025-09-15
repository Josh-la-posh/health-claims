import { ThemeToggle } from "../../components/theme/ThemeToggle";
import { H1, Muted } from "../../components/ui";
import AuthIllustration from "../../features/auth/components/AuthIllustration";
import BrandBootstrapper from "../../features/brand/BrandBootstapper";

export default function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BrandBootstrapper />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left illustration - hidden on small */}
        <div className="hidden lg:block bg-gradient-to-br from-black-50 to-black-100">
          <AuthIllustration
            headline="Payments made easy with"
            brand="PelPay"
            subtitle="We help businesses in Africa accept payments from anywhere—fast, secure, and beautifully simple."
          />
        </div>

        {/* Right form */}
        <div className="flex min-h-screen flex-col">
          {/* Top utility bar */}
          <div className="flex items-center justify-end p-4">
            <ThemeToggle />
          </div>

          {/* Form content */}
          <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              <H1 className="mb-1">{title}</H1>
              {subtitle && <Muted className="mb-6">{subtitle}</Muted>}
              <div className="space-y-4">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
