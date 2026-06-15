import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Eye, Pencil, Trash2, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/table/DataTable";
import DeleteDialog from "@/components/shared/DeleteDialog";
import PackageModal from "@/components/packages/PackageModal";
import PackageViewDialog from "@/components/packages/PackageViewDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPackagesStart,
  fetchPackagesSuccess,
  fetchPackagesFailure,
  createPackageStart,
  createPackageSuccess,
  createPackageFailure,
  updatePackageStart,
  updatePackageSuccess,
  updatePackageFailure,
  deletePackageStart,
  deletePackageSuccess,
  deletePackageFailure,
} from "@/store/slices/packagesSlice";
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/api/services/packagesService";
import { getServicesDropdown } from "@/api/services/servicesService";
import { useToast } from "@/hooks/use-toast";
import { PACKAGE_TYPES } from "@/validations/packageSchema";

const BADGE_LABELS = {
  most_popular: "Meest populair",
  recommended: "Aanbevolen",
};

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Packages() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { packages, pagination, loading } = useAppSelector((s) => s.packages);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [isFiltering, setIsFiltering] = useState(false);
  const abortRef = useRef(null);
  const initialised = useRef(false);

  const [servicesDropdown, setServicesDropdown] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [viewingPkg, setViewingPkg] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingPkg, setDeletingPkg] = useState(null);

  // Fetch services dropdown once
  useEffect(() => {
    getServicesDropdown()
      .then((res) => {
        const list = res.data.data?.services ?? res.data.data ?? [];
        setServicesDropdown(list);
      })
      .catch(() => {});
  }, []);

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(fetchPackagesStart());
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (serviceFilter !== "all") params.service = serviceFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (packageTypeFilter !== "all") params.packageType = packageTypeFilter;
      const res = await getAllPackages(params, { signal: controller.signal });
      dispatch(fetchPackagesSuccess(res.data.data));
      initialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      dispatch(fetchPackagesFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  }, [page, debouncedSearch, serviceFilter, statusFilter, packageTypeFilter]);

  useEffect(() => {
    fetchPackages();
    return () => abortRef.current?.abort();
  }, [fetchPackages]);

  // Reset page on filter change
  const prevFilter = useRef({ search: "", service: "all", status: "all", packageType: "all" });
  useEffect(() => {
    const prev = prevFilter.current;
    if (
      prev.search !== debouncedSearch ||
      prev.service !== serviceFilter ||
      prev.status !== statusFilter ||
      prev.packageType !== packageTypeFilter
    ) {
      prevFilter.current = {
        search: debouncedSearch,
        service: serviceFilter,
        status: statusFilter,
        packageType: packageTypeFilter,
      };
      setPage(1);
    }
  }, [debouncedSearch, serviceFilter, statusFilter, packageTypeFilter]);

  // Show filtering spinner immediately on input change
  useEffect(() => {
    if (!initialised.current) return;
    setIsFiltering(true);
  }, [search, serviceFilter, statusFilter, packageTypeFilter]);

  // View
  const handleView = async (row) => {
    setViewLoading(true);
    setViewingPkg({ _id: row._id, name: row.name });
    try {
      const res = await getPackageById(row._id);
      setViewingPkg(res.data.data?.package ?? res.data.data);
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
      setViewingPkg(null);
    } finally {
      setViewLoading(false);
    }
  };

  // Create / Update — returns true on success so modal closes itself
  const handleSubmit = async (formData) => {
    if (editingPkg?._id) {
      const id = editingPkg._id;
      dispatch(updatePackageStart(id));
      try {
        const res = await updatePackage(id, formData);
        const pkg = res.data.data?.package ?? res.data.data;
        // Normalize services: if API returned array of ids, map to service objects
        if (Array.isArray(pkg.services) && servicesDropdown.length > 0) {
          pkg.services = pkg.services.map((s) =>
            typeof s === "object"
              ? s
              : servicesDropdown.find((sd) => sd._id === s) || s,
          );
        }
        dispatch(updatePackageSuccess({ id, pkg }));
        toast({ title: res.data.message });
        setEditingPkg(null);
        return true;
      } catch (err) {
        dispatch(updatePackageFailure(id));
        toast({
          title: err.response?.data?.message || "Er is iets misgegaan.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      dispatch(createPackageStart());
      try {
        const res = await createPackage(formData);
        const pkg = res.data.data?.package ?? res.data.data;
        dispatch(createPackageSuccess(pkg));
        toast({ title: res.data.message });
        fetchPackages();
        return true;
      } catch (err) {
        dispatch(createPackageFailure());
        toast({
          title: err.response?.data?.message || "Er is iets misgegaan.",
          variant: "destructive",
        });
        return false;
      }
    }
  };

  // Delete
  const confirmDelete = async () => {
    const id = deletingPkg._id;
    setDeletingPkg(null);
    dispatch(deletePackageStart(id));
    try {
      const res = await deletePackage(id);
      dispatch(deletePackageSuccess(id));
      toast({ title: res.data.message });
    } catch (err) {
      dispatch(deletePackageFailure(id));
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "name",
      label: "Naam",
      cellClassName: "min-w-[180px]",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111111] truncate max-w-[160px]">
              {row.name}
            </span>
          </div>
          <span className="text-xs text-[#9a9a9a]">
            {Array.isArray(row.features) ? row.features.length : 0} kenmerken
          </span>
        </div>
      ),
    },
    {
      key: "services",
      label: "Diensten",
      cellClassName: "min-w-[140px]",
      render: (row) => {
        const svcs = (row.services || []).map((s) =>
          typeof s === "object" ? s.name : s,
        );
        if (!svcs.length)
          return <span className="text-sm text-[#9a9a9a]">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {svcs.map((name, i) => (
              <span
                key={i}
                className="inline-flex rounded-full bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#3e3e3e]"
              >
                {name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Prijs",
      cellClassName: "whitespace-nowrap min-w-[80px]",
      render: (row) => (
        <span className="text-sm font-medium text-[#111111]">
          {row.price != null ? `€ ${row.price}` : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Datum",
      cellClassName: "whitespace-nowrap min-w-[120px]",
      render: (row) =>
        row.createdAt
          ? new Intl.DateTimeFormat("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(row.createdAt))
          : "—",
    },
    {
      key: "status",
      label: "Status",
      cellClassName: "min-w-[90px]",
      render: (row) => (
        <Badge
          className={
            row.status === "active"
              ? "border-0 bg-emerald-100 text-emerald-600 whitespace-nowrap"
              : "border-0 bg-gray-200 text-gray-700 whitespace-nowrap"
          }
        >
          {row.status === "active" ? "Actief" : "Inactief"}
        </Badge>
      ),
    },
    {
      key: "packageType",
      label: "Type",
      cellClassName: "min-w-[100px]",
      render: (row) => {
        const val = row.packageType;
        const t = PACKAGE_TYPES.find((p) => p.value === val);
        return (
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
            {t?.label || "—"}
          </span>
        );
      },
    },
    {
      key: "highlight",
      label: "Highlight Badge",
      cellClassName: "min-w-[110px]",
      render: (row) => {
        const label = BADGE_LABELS[row.highlightBadge] || null;
        if (!label) return <span className="text-sm text-[#9a9a9a]">—</span>;
        return (
          <Badge
            variant="secondary"
            className="border-0 bg-yellow-100 text-yellow-700 whitespace-nowrap"
          >
            {label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Acties",
      cellClassName: "min-w-[110px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-[#a9a9a9] transition-colors hover:bg-muted hover:text-[#8a8a8a]"
            onClick={() => handleView(row)}
          >
            {viewLoading && viewingPkg?._id === row._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-[#a9a9a9] transition-colors hover:bg-muted hover:text-[#8a8a8a]"
            disabled={!!loading.update[row._id]}
            onClick={() => {
              setEditingPkg(row);
              setModalOpen(true);
            }}
          >
            {loading.update[row._id] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-[#ff1f1f] transition-colors hover:bg-muted hover:text-[#ff1f1f]"
            disabled={!!loading.delete[row._id]}
            onClick={() => setDeletingPkg(row)}
          >
            {loading.delete[row._id] ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#ff1f1f]" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Pakketbeheer</h1>
          <p className="text-sm text-[#8b8b8b]">
            Creëer, organiseer en beheer uw pakketten.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPkg(null);
            setModalOpen(true);
          }}
          className="h-12 rounded-[1rem] bg-primary px-6 text-white hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nieuw pakket
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {isFiltering ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-[#b0b0b0]" />
            )}
          </div>
          <Input
            placeholder="Zoek pakketten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-2xl border-0 bg-white pl-9 shadow-sm placeholder:text-[#c2c2c2]"
          />
        </div>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger
            className={`h-11 w-full rounded-2xl border-0 bg-white shadow-sm sm:w-[190px] ${serviceFilter === "all" ? "text-[#9ca3af]" : "text-[var(--title)]"}`}
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className={`h-11 w-full rounded-2xl border-0 bg-white shadow-sm sm:w-[170px] ${statusFilter === "all" ? "text-[#9ca3af]" : "text-[var(--title)]"}`}
          >
            <SelectValue placeholder="Alle statussen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="text-[#9ca3af] focus:text-[#9ca3af] data-[state=checked]:text-[#9ca3af]"
            >
              Alle statussen
            </SelectItem>
            <SelectItem value="active">Actief</SelectItem>
            <SelectItem value="inactive">Inactief</SelectItem>
          </SelectContent>
        </Select>

        <Select value={packageTypeFilter} onValueChange={setPackageTypeFilter}>
          <SelectTrigger
            className={`h-11 w-full rounded-2xl border-0 bg-white shadow-sm sm:w-[160px] ${packageTypeFilter === "all" ? "text-[#9ca3af]" : "text-[var(--title)]"}`}
          >
            <SelectValue placeholder="Alle types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="text-[#9ca3af] focus:text-[#9ca3af] data-[state=checked]:text-[#9ca3af]"
            >
              Alle types
            </SelectItem>
            {PACKAGE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-sm text-[#8b8b8b]">
        Totaal: {pagination.total} pakketten
      </span>

      <DataTable
        columns={columns}
        data={packages}
        loading={loading.fetch && packages.length === 0}
        overlayLoading={loading.fetch && packages.length > 0}
        emptyMessage="Geen pakketten gevonden."
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

      <PackageModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingPkg(null);
        }}
        packageData={editingPkg}
        onSubmit={handleSubmit}
        submitting={
          editingPkg?._id ? !!loading.update[editingPkg._id] : loading.create
        }
      />

      <PackageViewDialog
        open={!!viewingPkg}
        onOpenChange={(open) => !open && setViewingPkg(null)}
        pkg={viewingPkg}
        loading={viewLoading}
      />

      <DeleteDialog
        open={!!deletingPkg}
        onOpenChange={(open) => !open && setDeletingPkg(null)}
        onConfirm={confirmDelete}
        title="Pakket verwijderen"
        description={`Weet u zeker dat u "${deletingPkg?.name || "dit pakket"}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        warning="Waarschuwing: Dit pakket is momenteel actief en zichtbaar voor gebruikers."
        confirmText="Verwijderen"
        cancelText="Annuleren"
        loading={!!loading.delete[deletingPkg?._id]}
      />
    </div>
  );
}
