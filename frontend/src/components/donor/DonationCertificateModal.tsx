import { Award, Printer, Droplet, ShieldCheck, Calendar, Building2 } from "lucide-react";
import type { DonationHistoryItem } from "@/types";
import { Modal } from "@/components/ui/Modal";

interface DonationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: DonationHistoryItem | null;
}

export function DonationCertificateModal({
  isOpen,
  onClose,
  donation,
}: DonationCertificateModalProps) {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="max-h-[90vh] overflow-y-auto">
      {/* Certificate Container (print-area) */}
      <div className="print-area relative rounded-2xl border-4 border-double border-amber-300/80 bg-gradient-to-b from-amber-50/40 via-white to-red-50/30 p-6 sm:p-10 shadow-inner text-center space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-xs">
            <Droplet className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Life<span className="text-red-500">Link</span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
            <Award className="h-3.5 w-3.5" />
            Official Transfusion Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Certificate of Life-Saving Contribution
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This certificate is proudly awarded in recognition of outstanding humanitarian service and voluntary blood donation.
          </p>
        </div>

        {/* Recipient Name */}
        <div className="py-2 border-y border-amber-200/60 my-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presented to</p>
          <h2 className="text-2xl sm:text-4xl font-black text-red-600 tracking-tight font-serif">
            {donation.donor_name}
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            For donating <span className="font-extrabold text-red-600">{donation.units} Unit(s)</span> of Group{" "}
            <span className="font-extrabold text-slate-900">{donation.blood_group}</span> Blood
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-white/80 rounded-xl p-4 border border-slate-200/60 shadow-2xs">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-blue-500" />
              Medical Facility
            </p>
            <p className="text-xs font-bold text-slate-800">{donation.hospital_name}</p>
            {donation.hospital_address && (
              <p className="text-[11px] text-slate-500 truncate">{donation.hospital_address}</p>
            )}
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center sm:justify-end gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-500" />
              Donation Date
            </p>
            <p className="text-xs font-bold text-slate-800">
              {new Date(donation.donation_date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-[11px] text-slate-500">
              Time: {new Date(donation.donation_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Verification Badge & Serial */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60">
          <div className="flex items-center gap-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Clinically Verified</p>
              <p className="text-[10px] text-slate-400">DBMS Database Hash Verified</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Certificate Serial ID</p>
            <p className="font-mono text-xs font-black tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {donation.certificate_id}
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Print / Save Certificate
        </button>
      </div>
    </Modal>
  );
}
