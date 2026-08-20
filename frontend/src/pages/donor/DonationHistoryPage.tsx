import { CalendarDays } from "lucide-react";
import { getSession } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function DonationHistoryPage() {
  const session = getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Donation History"
        description={`Record of verified contributions for ${session?.user.name || "donor"}`}
      />

      <Card>
        <EmptyState
          icon={CalendarDays}
          title="No verified past donations"
          description="Completed emergency transfusion donations verified by hospitals will be recorded here."
        />
      </Card>
    </div>
  );
}
