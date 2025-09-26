import { ThemeToggle } from "../../components/theme/ThemeToggle";
import { H4 } from "../../components/ui";
import BrandBootstrapper from "../../features/brand/BrandBootstrapper";

export default function AuthLayout({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
  <div className="min-h-screen bg-authBg text-fg">
      <BrandBootstrapper />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md md:max-w-lg rounded-xl bg-bg backdrop-blur supports-[backdrop-filter]:bg-bg/90  border-border  shadow-sm md:shadow-md p-6 md:p-8">
          <H4 className="mb-6 text-center font-semibold tracking-tight">{title}</H4>
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
