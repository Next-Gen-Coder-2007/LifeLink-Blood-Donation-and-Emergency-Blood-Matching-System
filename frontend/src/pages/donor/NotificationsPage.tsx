import { Bell } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Notifications & Alerts"
        description="Live emergency broadcasts and system dispatches"
      />

      <Card>
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You will receive live alerts when an emergency blood request matches your blood type."
        />
      </Card>
    </div>
  );
}
