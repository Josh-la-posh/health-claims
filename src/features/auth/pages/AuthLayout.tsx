import { H1 } from "../../../components/typography/Heading";
import { Muted } from "../../../components/typography/Text";

export default function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left illustration - hidden on small */}
      <div className="hidden lg:block bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Replace with your brand image */}
        <div className="h-full w-full flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1556742043-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop"
            alt="Brand"
            className="max-w-[80%] rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <H1 className="mb-1">{title}</H1>
          {subtitle && <Muted className="mb-6">{subtitle}</Muted>}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
