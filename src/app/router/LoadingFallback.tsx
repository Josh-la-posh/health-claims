import Spinner from "../../components/ui/spinner";

export default function LoadingFallback() {
  return (
    <div className="m-auto flex items-center gap-2 text-sm text-gray-600">
        <Spinner /> Loading…
    </div>
  );
}
