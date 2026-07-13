import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import DataTable from "@/components/table/DataTable";
import StatCard from "@/components/cards/StatCard";
import { useAppSelector } from "@/store/hooks";
import {
  getDashboardStats,
  getRecentInquiries,
} from "@/api/services/dashboardService";
import { getServicesDropdown } from "@/api/services/servicesService";
import { useToast } from "@/hooks/use-toast";
import totalServicesIcon from "@/assets/icons/totalServices.svg";
import totalPackagesIcon from "@/assets/icons/totalPackages.svg";
import totalInquiriesIcon from "@/assets/icons/totalInquires.svg";
import portfolioItemsIcon from "@/assets/icons/portfolioItems.svg";
import moment from "moment/moment";

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Dashboard() {
  const allServicesTextClassName =
    "text-subtitle focus:text-subtitle data-[state=checked]:text-subtitle";
  const { toast } = useToast();
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.firstName ?? user?.name?.split(" ")[0] ?? "Admin";

  // ── Stats ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Recent inquiries ──
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [servicesDropdown, setServicesDropdown] = useState([]);
  const abortRef = useRef(null);
  const initialised = useRef(false);

  // Fetch stats once
  useEffect(() => {
    setStatsLoading(true);
    getDashboardStats()
      .then((res) => setStats(res.data.data ?? res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch services dropdown once
  useEffect(() => {
    getServicesDropdown()
      .then((res) =>
        setServicesDropdown(res.data.data?.services ?? res.data.data ?? []),
      )
      .catch(() => {});
  }, []);

  // Fetch recent inquiries
  const fetchInquiries = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!initialised.current) setFetchLoading(true);

    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (serviceFilter !== "all") params.serviceId = serviceFilter;
      if (dateFilter) {
        const nextDay = new Date(dateFilter);
        nextDay.setDate(nextDay.getDate() + 1);
        params.startDate = format(dateFilter, "yyyy-MM-dd");
        params.endDate = format(nextDay, "yyyy-MM-dd");
      }

      const res = await getRecentInquiries(params, {
        signal: controller.signal,
      });
      const data = res.data.data ?? res.data;
      setInquiries(data.inquiries ?? data.data ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, limit: 10 });
      initialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
      setIsFiltering(false);
    }
  }, [page, debouncedSearch, serviceFilter, dateFilter]);

  useEffect(() => {
    fetchInquiries();
    return () => abortRef.current?.abort();
  }, [fetchInquiries]);

  // Reset page on filter change
  const prevFilter = useRef({ search: "", service: "all", date: null });
  useEffect(() => {
    const prev = prevFilter.current;
    const dateStr = dateFilter ? format(dateFilter, "yyyy-MM-dd") : null;
    const prevDateStr = prev.date ? format(prev.date, "yyyy-MM-dd") : null;
    if (
      prev.search !== debouncedSearch ||
      prev.service !== serviceFilter ||
      prevDateStr !== dateStr
    ) {
      prevFilter.current = {
        search: debouncedSearch,
        service: serviceFilter,
        date: dateFilter,
      };
      setPage(1);
    }
  }, [debouncedSearch, serviceFilter, dateFilter]);

  // Show filtering spinner immediately
  useEffect(() => {
    if (!initialised.current) return;
    setIsFiltering(true);
  }, [search, serviceFilter, dateFilter]);

  const statCards = [
    { title: "Totale Diensten", key: "totalServices", icon: totalServicesIcon },
    {
      title: "Totale Pakketten",
      key: "totalPackages",
      icon: totalPackagesIcon,
      isActive: false,
    },
    {
      title: "Totale Aanvragen",
      key: "totalInquiries",
      icon: totalInquiriesIcon,
    },
    {
      title: "Portfolio Items",
      key: "totalPortfolio",
      icon: portfolioItemsIcon,
    },
  ];

  const columns = [
    {
      key: "name",
      label: "Naam",
      cellClassName: "font-medium text-[var(--title)] min-w-[130px]",
      render: (row) => row.name || "—",
    },
    {
      key: "email",
      label: "E-mailadres",
      cellClassName: "min-w-[160px]",
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)]">
          {row.email || "—"}
        </span>
      ),
    },
    {
      key: "services",
      label: "Dienst",
      cellClassName: "min-w-[130px]",
      render: (row) => {
        const names = Array.isArray(row.services)
          ? row.services.map((s) => s.name || s).join(", ")
          : row.service || "—";
        return (
          <span className="text-sm text-[var(--text-muted)]">{names || "—"}</span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Ontvangen",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (row) =>
        row.createdAt ? format(new Date(row.createdAt), "dd/MM/yyyy") : "—",
    },
    {
      key: "bookedDate",
      label: "Geboekt op",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (row) =>
        row.bookedDate
          ? moment.utc(row.bookedDate.split("T")[0]).format("DD/MM/YYYY")
          : "—",
    },
    {
      key: "bookedTime",
      label: "Geboekt om",
      cellClassName: "whitespace-nowrap min-w-[100px]",
      render: (row) => row.bookedTime || "—",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--title)] mb-1">
          Welkom terug, {firstName}!
        </h2>
        <p className="text-subtitle text-sm">
          Hier is wat er vandaag met uw bedrijf gebeurt.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={
              statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin opacity-40" />
              ) : (
                (stats?.[card.key] ?? "—")
              )
            }
            iconSrc={card.icon}
            isActive={card.isActive}
          />
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-[var(--title)]">
          Recente Aanvragen
        </h3>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              {isFiltering ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Search className="h-4 w-4 text-subtitle" />
              )}
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek aanvragen, klanten..."
              className="h-11 w-full rounded-xl border border-border/60 bg-white pl-9 shadow-sm"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger
                className={`h-11 w-full rounded-xl border border-border/60 bg-white shadow-sm sm:w-[200px] ${serviceFilter === "all" ? "text-subtitle" : "text-[var(--title)]"}`}
              >
                <SelectValue placeholder="Alle Diensten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className={allServicesTextClassName}>
                  Alle Diensten
                </SelectItem>
                {servicesDropdown.map((svc) => (
                  <SelectItem key={svc._id} value={svc._id}>
                    {svc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button className="flex h-11 min-w-[150px] items-center justify-between gap-2 rounded-xl border border-border/60 bg-white px-4 text-sm text-subtitle shadow-sm transition-colors hover:text-title">
                  {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Kies datum"}
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={(d) => {
                    setDateFilter(d);
                    setPage(1);
                    if (d) setDatePopoverOpen(false);
                  }}
                  className="rounded-md"
                />
                <div className="flex justify-end border-t border-border/60 bg-muted px-3 py-2">
                  <button
                    type="button"
                    className="rounded-md px-3 py-1 text-sm font-medium text-title transition hover:bg-muted"
                    onClick={() => {
                      setDateFilter(null);
                      setPage(1);
                      setDatePopoverOpen(false);
                    }}
                  >
                    Wissen
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={inquiries}
          loading={fetchLoading && inquiries.length === 0}
          overlayLoading={fetchLoading && inquiries.length > 0}
          emptyMessage="Geen aanvragen gevonden voor deze filters."
          pagination={
            pagination.total > 0
              ? {
                  page: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onPageChange: setPage,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
