// features/merchants/pages/MerchantLayout.tsx
import { Outlet, useParams } from "react-router-dom";
import { PageTabs } from "../../../components/system/PageTabs";

export default function MerchantLayout() {
  const { id } = useParams();

  const tabs = [
    { to: `/merchants/${id}/profile`, label: "Profile" },
    { to: `/merchants/${id}/documents`, label: "Documents" },
    { to: `/merchants/${id}/credentials`, label: "Credentials" },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageTabs tabs={tabs} />
      <Outlet />
    </div>
  );
}
