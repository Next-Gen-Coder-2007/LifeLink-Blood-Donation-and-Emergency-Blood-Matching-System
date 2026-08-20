import { Droplet } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-slate-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white shadow-2xs">
            <Droplet className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm tracking-tight">Life<span className="text-red-500">Link</span></span>
          <span className="text-xs font-normal text-slate-400">© 2026</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
          <Link to="/" className="hover:text-red-500 transition">Home</Link>
          <Link to="/register/donor" className="hover:text-red-500 transition">Donor Registration</Link>
          <Link to="/register/hospital" className="hover:text-blue-600 transition">Hospital Registration</Link>
          <Link to="/admin/login" className="hover:text-slate-900 transition">Admin Portal</Link>
        </div>

        <p className="text-xs text-slate-400">
          Intelligent Emergency Blood Matching System
        </p>
      </div>
    </footer>
  );
}
