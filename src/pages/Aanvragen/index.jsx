import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/table/DataTable";
import InquiryViewDialog from "@/components/aanvragen/InquiryViewDialog";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchInquiriesStart,
  fetchInquiriesSuccess,
  fetchInquiriesFailure,
  setServicesDropdown,
  deleteInquiryStart,
  deleteInquirySuccess,
  deleteInquiryFailure,
} from "@/store/slices/inquiriesSlice";
import {
  getAllInquiries,
  getInquiryById,
  deleteInquiry,
} from "@/api/services/inquiriesService";
import { getServicesDropdown } from "@/api/services/servicesService";
import { useToast } from "@/hooks/use-toast";

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AanvragenPage() {
  const allServicesTextClassName =
    "text-[#9ca3af] focus:text-[#9ca3af] data-[state=checked]:text-[#9ca3af]";
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { inquiries, pagination, servicesDropdown, loading } = useAppSelector(
    (s) => s.inquiries,
  );

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [isFiltering, setIsFiltering] = useState(false);
  const abortRef = useRef(null);
  const initialised = useRef(false);

  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState(null);

  // ── Fetch services dropdown once ──
  useEffect(() => {
    getServicesDropdown()
      .then((res) => {
        const list = res.data.data?.services ?? res.data.data ?? [];
        dispatch(setServicesDropdown(list));
      })
      .catch(() => {});
  }, []);

  // ── Fetch inquiries ──
  const fetchInquiries = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(fetchInquiriesStart());
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (serviceFilter !== "all") params.service = serviceFilter;
      const res = await getAllInquiries(params, { signal: controller.signal });
      const result = res.data?.data ?? res.data;
      dispatch(fetchInquiriesSuccess({
        inquiries: result.inquiries ?? result.data ?? [],
        pagination: result.pagination ?? { total: 0, page: 1, limit: 10 },
      }));
      initialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      dispatch(fetchInquiriesFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  }, [page, debouncedSearch, serviceFilter]);

  useEffect(() => {
    fetchInquiries();
    return () => abortRef.current?.abort();
  }, [fetchInquiries]);

  const prevFilter = useRef({ search: "", service: "all" });
  useEffect(() => {
    const prev = prevFilter.current;
    if (prev.search !== debouncedSearch || prev.service !== serviceFilter) {
      prevFilter.current = { search: debouncedSearch, service: serviceFilter };
      setPage(1);
    }
  }, [debouncedSearch, serviceFilter]);

  useEffect(() => {
    if (!initialised.current) return;
    setIsFiltering(true);
  }, [search, serviceFilter]);

  // ── View ──
  const handleView = async (row) => {
    const id = row._id;
    setViewLoading(true);
    setViewingInquiry({ _id: id, name: row.name });
    try {
      const res = await getInquiryById(id);
      setViewingInquiry(res.data.data);
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
      setViewingInquiry(null);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    const id = deletingInquiry._id;
    setDeletingInquiry(null);
    dispatch(deleteInquiryStart(id));
    try {
      const res = await deleteInquiry(id);
      dispatch(deleteInquirySuccess(id));
      toast({ title: res.data.message });
    } catch (err) {
      dispatch(deleteInquiryFailure(id));
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "serial",
      label: "#",
      headClassName: "w-[62px] text-center",
      cellClassName:
        "whitespace-nowrap text-center font-semibold text-[var(--title)]",
      render: (_, rowIdx) => rowIdx + 1,
    },
    {
      key: "name",
      label: "Naam",
      cellClassName: "min-w-[140px]",
      render: (row) => (
        <span className="font-semibold text-[var(--title)] truncate max-w-[240px] block">
          {row.name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Contacten",
      cellClassName: "min-w-[160px]",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-[var(--title)] truncate max-w-[180px]">
            {row.email || "—"}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {row.phone || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "services",
      label: "Diensten",
      cellClassName: "min-w-[130px]",
      render: (row) => {
        const names = Array.isArray(row.services)
          ? row.services.map((s) => s.name || s).join(", ")
          : "—";
        return (
          <span className="text-sm font-medium text-[var(--title)] line-clamp-2">
            {names}
          </span>
        );
      },
    },
    {
      key: "message",
      label: "Bericht",
      cellClassName: "min-w-[160px] max-w-[220px]",
      render: (row) => (
        <span className="line-clamp-2 text-sm text-[var(--text-muted)]">
          {row.message || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Ontvangen",
      cellClassName: "whitespace-nowrap min-w-[100px]",
      render: (row) =>
        row.createdAt
          ? new Intl.DateTimeFormat("nl-NL").format(new Date(row.createdAt))
          : "—",
    },
    {
      key: "bookedDate",
      label: "Geboekt op",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (row) =>
        row.bookedDate
          ? new Intl.DateTimeFormat("nl-NL").format(new Date(row.bookedDate))
          : "—",
    },
    {
      key: "bookedTime",
      label: "Geboekt om",
      cellClassName: "whitespace-nowrap min-w-[90px]",
      render: (row) =>
        row.bookedTime || "—",
    },
    {
      key: "actions",
      label: "Acties",
      cellClassName: "min-w-[90px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:text-primary/80 transition-colors"
            onClick={() => handleView(row)}
          >
            {viewLoading && viewingInquiry?._id === row._id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--title)]">
          Aanvraagbeheer
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Maak, organiseer en beheer uw aanvragen.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {isFiltering ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
          <Input
            placeholder="Zoek op naam, e-mail of telefoon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-2xl border-0 bg-white shadow-sm placeholder:text-[#c2c2c2]"
          />
        </div>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger
            className={cn(
              "h-11 w-full rounded-2xl border-0 bg-white shadow-sm lg:w-[200px]",
              serviceFilter === "all"
                ? "text-[#9ca3af]"
                : "text-[var(--title)]",
            )}
          >
            <SelectValue placeholder="Alle diensten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="text-[#9ca3af] focus:text-[#9ca3af] data-[state=checked]:text-[#9ca3af]"
            >
              Alle diensten
            </SelectItem>
            {servicesDropdown.map((svc) => (
              <SelectItem key={svc._id} value={svc._id}>
                {svc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        loading={loading.fetch && inquiries.length === 0}
        overlayLoading={loading.fetch && inquiries.length > 0}
        emptyMessage="Geen aanvragen gevonden."
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

      <InquiryViewDialog
        open={!!viewingInquiry}
        onOpenChange={(open) => !open && setViewingInquiry(null)}
        inquiry={viewingInquiry}
        loading={viewLoading}
      />

      <DeleteDialog
        open={!!deletingInquiry}
        onOpenChange={(open) => !open && setDeletingInquiry(null)}
        onConfirm={confirmDelete}
        title="Aanvraag verwijderen"
        description={`Weet u zeker dat u de aanvraag van "${deletingInquiry?.name || "deze aanvrager"}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        loading={!!loading.delete[deletingInquiry?._id]}
      />
    </div>
  );
}
