import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";

// Displays a user-friendly unauthorized screen with contextual messaging.
// Query params:
//   reason=tenant | permission | role | access-denied
// Falls back to generic message if unknown.
export default function FriendlyUnauthorized() {
	const loc = useLocation();
	const params = new URLSearchParams(loc.search);
	const reason = params.get("reason") || "access-denied";

	const title = (() => {
		switch (reason) {
			case "tenant":
				return "Wrong Tenant Area";
			case "permission":
				return "Insufficient Permission";
			case "role":
				return "Role Restricted";
			default:
				return "Access Restricted";
		}
	})();

	const message = (() => {
		switch (reason) {
			case "tenant":
				return "This section belongs to a different tenant type. Switch accounts or contact an administrator if you believe you should have access.";
			case "permission":
				return "You are authenticated but lack the specific permission required for this action or page.";
			case "role":
				return "Your current role does not allow access to this area. An administrator can adjust your role if needed.";
			default:
				return "You do not have access to this resource right now.";
		}
	})();

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="space-y-3 max-w-xl">
				<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
				<p className="text-muted-foreground leading-relaxed">{message}</p>
				<p className="text-xs text-muted-foreground/70">Reference code: {reason}</p>
			</div>
			<div className="flex gap-3 flex-wrap justify-center">
				<Button>
					<Link to="/">Go Home</Link>
				</Button>
				<Button variant="secondary">
					<Link to={document.referrer ? "#" : "/"} onClick={(e) => { if (document.referrer) { e.preventDefault(); window.history.back(); } }}>Go Back</Link>
				</Button>
				<Button variant="outline">
					<Link to="/settings">Settings</Link>
				</Button>
			</div>
		</div>
	);
}

