import { useState } from "react";
import { useThemeStore } from "../../../store/theme";
import { Button } from "../../../components/ui/button";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import { BrandPicker } from "../../../components/theme/BrandPicker";
import { writeBrandCache, getTenantFromLocation } from "../../brand/brand";

export default function BrandingPage() {
  const { primaryHsl, setPrimaryHsl } = useThemeStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const formData = new FormData();
      if (logoFile) formData.append("logo", logoFile);
      if (primaryHsl) formData.append("primaryHsl", primaryHsl);

      const { data } = await api.post("/settings/brand", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Update cache + theme immediately
      const tenant = getTenantFromLocation();
      if (tenant) {
        writeBrandCache(tenant, {
          primaryHsl,
          logoUrl: logoPreview || data?.logoUrl,
          name: data?.name,
        });
      }
      setPrimaryHsl(primaryHsl);

      toast.success("Brand updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update brand");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Branding</h1>
      <p className="text-muted-foreground text-sm">
        Customize your logo and theme color. This is what your team will see across the dashboard.
      </p>

      {/* Logo upload */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-lg font-medium">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
          ) : (
            "Logo"
          )}
        </div>
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary">
            <span>Upload Logo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
          <p className="text-xs text-muted mt-1">PNG, JPG, max 2MB.</p>
        </div>
      </div>

      {/* Brand color picker */}
      <div>
        <label className="block text-sm font-medium mb-2">Primary Color</label>
        <BrandPicker />
        <p className="text-xs text-muted mt-1">
          Accepts `H S L` values (e.g. <code>222 89% 56%</code>) or <code>#hex</code>.
        </p>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium">Preview</p>
        <Button className="bg-[hsl(var(--primary))] text-white">Primary Button</Button>
        <div className="h-2 w-full rounded bg-[hsl(var(--primary))]" />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
