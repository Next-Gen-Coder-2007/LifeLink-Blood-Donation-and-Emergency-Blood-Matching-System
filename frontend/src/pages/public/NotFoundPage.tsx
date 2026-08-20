import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">404 — Page Not Found</h1>
      <p className="mt-2 max-w-sm text-xs text-slate-500">
        The requested resource or dashboard URL does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
}
