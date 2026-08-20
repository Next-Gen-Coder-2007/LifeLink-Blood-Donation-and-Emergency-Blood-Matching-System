import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { BloodGroupBadge } from "@/components/ui/Badge";

export interface DataRow {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  blood_group?: string;
  phone?: string;
  hospital_name?: string;
  emergency_contact?: string;
  address?: string;
  created_at?: string;
}

interface DataTableProps {
  data: DataRow[];
  onDelete: (id: string) => void;
  emptyText?: string;
}

export function DataTable({ data, onDelete, emptyText = "No records found." }: DataTableProps) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.hospital_name && item.hospital_name.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.blood_group && item.blood_group.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter records..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">{emptyText}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Identifier / Name</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {item.hospital_name || item.name || "N/A"}
                    <span className="block text-[11px] font-normal text-slate-400 font-mono">{item.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.blood_group && <BloodGroupBadge group={item.blood_group} />}
                    {item.role && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                        {item.role}
                      </span>
                    )}
                    {item.address && <span className="text-slate-500 line-clamp-1">{item.address}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.email && <span className="block">{item.email}</span>}
                    {item.phone && <span className="block text-slate-500">{item.phone}</span>}
                    {item.emergency_contact && <span className="block text-red-600 font-medium">Hotline: {item.emergency_contact}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
