import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NotificationItem } from "@/types";

export function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"all" | "emergency" | "pledge" | "verified">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!session) return;
    try {
      const res = await api.get<{ unread_count: number; notifications: NotificationItem[] }>(
        `/notifications/user/${session.user.id}?role=${session.user.role}`
      );
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch {
      showToast("Unable to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      showToast("Failed to update notification", "error");
    }
  };

  const handleMarkAllRead = async () => {
    if (!session) return;
    try {
      await api.put(`/notifications/user/${session.user.id}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read");
    } catch {
      showToast("Failed to mark all as read", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("Notification deleted");
    } catch {
      showToast("Failed to delete notification", "error");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "emergency") return n.notification_type.includes("emergency") || n.notification_type.includes("direct");
    if (activeFilter === "pledge") return n.notification_type.includes("pledge");
    if (activeFilter === "verified") return n.notification_type.includes("donation") || n.notification_type.includes("verified");
    return true;
  });

  const getIcon = (type: string) => {
    if (type.includes("emergency") || type.includes("direct")) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (type.includes("pledge")) {
      return <HeartHandshake className="h-4 w-4 text-blue-600" />;
    }
    if (type.includes("verified") || type.includes("donation")) {
      return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
    }
    return <Bell className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <PageHeader
        backTo={session?.user.role === "hospital" ? "/hospital/dashboard" : "/donor/dashboard"}
        title="Notifications & Live Alerts"
        description="Real-time emergency blood broadcasts, donation pledges, and certificates"
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
              Mark All Read
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Alerts" },
          { id: "emergency", label: "Emergency Broadcasts" },
          { id: "pledge", label: "Pledges" },
          { id: "verified", label: "Donations & Certificates" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
              activeFilter === tab.id
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
            <p>Loading notification center...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You will receive real-time notifications when an emergency match occurs or your donation is verified."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-4 gap-4 transition ${
                  notif.is_read ? "bg-white" : "bg-red-50/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    notif.is_read ? "bg-slate-100" : "bg-red-100/70"
                  }`}>
                    {getIcon(notif.notification_type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs ${notif.is_read ? "font-bold text-slate-800" : "font-extrabold text-slate-900"}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>

                      {notif.notification_type.includes("emergency") && (
                        <Link
                          to="/donor/requests"
                          className="font-bold text-red-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          View Request <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}

                      {notif.notification_type.includes("donation_verified") && (
                        <Link
                          to="/donor/history"
                          className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          View Certificate <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(notif.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
