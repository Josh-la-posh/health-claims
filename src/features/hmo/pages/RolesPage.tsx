import { Button } from '../../../components/ui/button';
import { NavLink } from 'react-router-dom';

export default function RolesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roles</h1>
        <NavLink to="/hmo/settings/roles/new"><Button size="sm">New Role</Button></NavLink>
      </div>
      <p className="text-sm text-muted-foreground">Role management coming soon. This placeholder will display a table of roles with name, description, users count, status and actions.</p>
      <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">Roles table placeholder</div>
    </div>
  );
}
