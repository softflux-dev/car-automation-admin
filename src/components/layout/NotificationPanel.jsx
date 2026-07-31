import { useEffect, useCallback } from "react";
import { Bell, Loader2, CheckCheck, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markReadStart,
  markReadSuccess,
  markReadFailure,
  markAllReadLocally,
} from "@/store/slices/notificationsSlice";
import { fetchNotifications, markNotificationRead } from "@/api/services/notificationsService";
import { useToast } from "@/hooks/use-toast";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins}m geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u geleden`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d geleden`;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(dateStr));
}

export default function NotificationPanel() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { notifications, loading } = useAppSelector((s) => s.notifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const loadNotifications = useCallback(() => {
    dispatch(fetchNotificationsStart());
    fetchNotifications()
      .then((res) => {
        const list = res.data.data?.notifications ?? res.data.data ?? res.data ?? [];
        dispatch(fetchNotificationsSuccess(Array.isArray(list) ? list : []));
      })
      .catch(() => dispatch(fetchNotificationsFailure()));
  }, [dispatch]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (n) => {
    if (n.isRead || loading.markRead[n._id]) return;
    dispatch(markReadStart(n._id));
    try {
      const res = await markNotificationRead(n._id);
      dispatch(markReadSuccess(n._id));
      toast({ title: res.data?.message ?? "Melding gemarkeerd als gelezen." });
    } catch (err) {
      dispatch(markReadFailure(n._id));
      toast({
        title: err.response?.data?.message ?? "Markeren mislukt.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;
    dispatch(markAllReadLocally());
    const results = await Promise.allSettled(
      unread.map((n) => markNotificationRead(n._id))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      toast({
        title: `${failed} melding${failed !== 1 ? "en" : ""} kon niet worden gemarkeerd.`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Alle meldingen gemarkeerd als gelezen." });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted">
          <Bell className="h-[18px] w-[18px] text-[var(--text-muted)]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden rounded-2xl shadow-xl bg-white border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--title)]">Het bericht</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/70"
            >
              <CheckCheck size={13} />
              Alles gelezen
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading.fetch ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Bell className="h-4.5 w-4.5 text-subtitle" />
              </div>
              <p className="text-sm font-medium text-title">Geen meldingen</p>
              <p className="text-xs text-[var(--text-muted)]">U bent helemaal bij.</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((n) => {
                const isMarkingRead = !!loading.markRead[n._id];
                return (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleMarkRead(n)}
                    disabled={n.isRead || isMarkingRead}
                    className={[
                      "w-full text-left flex items-start gap-3 rounded-xl px-3.5 py-3 transition-colors",
                      n.isRead
                        ? "bg-white hover:bg-muted cursor-default"
                        : "bg-primary/5 hover:bg-primary/10 cursor-pointer",
                    ].join(" ")}
                  >
                    {/* Dot / spinner */}
                    <div className="mt-[7px] shrink-0 w-2 flex items-center justify-center">
                      {isMarkingRead ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                      ) : (
                        <span
                          className={[
                            "block h-2 w-2 rounded-full transition-colors",
                            n.isRead ? "bg-muted-foreground/20" : "bg-primary",
                          ].join(" ")}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={[
                            "text-sm leading-snug",
                            n.isRead
                              ? "font-normal text-subtitle"
                              : "font-semibold text-title",
                          ].join(" ")}
                        >
                          {n.title ?? n.message ?? "Melding"}
                        </p>
                      </div>
                      {(n.description ?? n.body) && (
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">
                          {n.description ?? n.body}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    {n.createdAt && (
                      <div className="shrink-0 flex items-center gap-0.5 mt-0.5">
                        <Clock size={10} className="text-red-500" />
                        <span className="text-[10px] text-red-500 whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-5 py-2.5">
            <p className="text-center text-[11px] text-[var(--text-muted)]">
              {unreadCount > 0
                ? `${unreadCount} ongelezen melding${unreadCount !== 1 ? "en" : ""}`
                : "Alle meldingen gelezen ✓"}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
