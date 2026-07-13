import { useEffect, useState, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AddServiceDialog from "@/components/services/AddServiceDialog";
import AddCertificateDialog from "@/components/services/AddCertificateDialog";
import ServiceViewDialog from "@/components/services/ServiceViewDialog";
import CertificateViewDialog from "@/components/certificates/CertificateViewDialog";
import DeleteDialog from "@/components/shared/DeleteDialog";
import ServicesTab from "@/components/services/ServicesTab";
import CertificatesTab from "@/components/services/CertificatesTab";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServicesStart, fetchServicesSuccess, fetchServicesFailure,
  createServiceStart, createServiceSuccess, createServiceFailure,
  updateServiceStart, updateServiceSuccess, updateServiceFailure,
  deleteServiceStart, deleteServiceSuccess, deleteServiceFailure,
} from "@/store/slices/servicesSlice";
import {
  fetchCertificatesStart, fetchCertificatesSuccess, fetchCertificatesFailure,
  createCertificateStart, createCertificateSuccess, createCertificateFailure,
  updateCertificateStart, updateCertificateSuccess, updateCertificateFailure,
  deleteCertificateStart, deleteCertificateSuccess, deleteCertificateFailure,
} from "@/store/slices/certificatesSlice";
import {
  getAllServices, getServiceById, createService, updateService, deleteService,
} from "@/api/services/servicesService";
import {
  getAllCertificates, getCertificateById, createCertificate, updateCertificate, deleteCertificate,
} from "@/api/services/certificatesService";
import { useToast } from "@/hooks/use-toast";

const formatDate = (iso) =>
  new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { services, pagination: svcPagination, loading: svcLoading } = useAppSelector((s) => s.services);
  const { certificates, pagination: certPagination, loading: certLoading } = useAppSelector((s) => s.certificates);

  const [activeTab, setActiveTab] = useState("services");

  // ── Services filter state ──
  const [svcSearch, setSvcSearch] = useState("");
  const [svcStatus, setSvcStatus] = useState("all");
  const [svcPage, setSvcPage] = useState(1);
  const debouncedSvcSearch = useDebounce(svcSearch);

  // ── Certificates filter state ──
  const [certSearch, setCertSearch] = useState("");
  const [certStatus, setCertStatus] = useState("all");
  const [certPage, setCertPage] = useState(1);
  const debouncedCertSearch = useDebounce(certSearch);

  // ── Separate "is filtering" flags (only true on filter-triggered re-fetches) ──
  const [svcFiltering, setSvcFiltering] = useState(false);
  const [certFiltering, setCertFiltering] = useState(false);

  // ── AbortController refs ──
  const svcAbortRef = useRef(null);
  const certAbortRef = useRef(null);

  // ── Services modal state ──
  const [svcModalOpen, setSvcModalOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState(null);
  const [viewingSvc, setViewingSvc] = useState(null);
  const [viewSvcLoadingId, setViewSvcLoadingId] = useState(null);
  const [deletingSvcId, setDeletingSvcId] = useState(null);
  const [deletingSvcName, setDeletingSvcName] = useState("");

  // ── Certificates modal state ──
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);
  const [viewCertLoadingId, setViewCertLoadingId] = useState(null);
  const [deletingCertId, setDeletingCertId] = useState(null);
  const [deletingCertName, setDeletingCertName] = useState("");

  // ── Track whether this is the very first services/certs fetch ──
  const svcInitialised = useRef(false);
  const certInitialised = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // Fetch services
  // ─────────────────────────────────────────────────────────────
  const fetchServices = useCallback(async (isFilterChange = false) => {
    // Cancel previous in-flight request
    if (svcAbortRef.current) svcAbortRef.current.abort();
    const controller = new AbortController();
    svcAbortRef.current = controller;

    if (isFilterChange) setSvcFiltering(true);
    dispatch(fetchServicesStart());

    try {
      const params = { page: svcPage, limit: 10 };
      if (debouncedSvcSearch) params.search = debouncedSvcSearch;
      if (svcStatus !== "all") params.status = svcStatus;
      const res = await getAllServices(params, { signal: controller.signal });
      dispatch(fetchServicesSuccess(res.data.data));
      svcInitialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      dispatch(fetchServicesFailure());
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
    } finally {
      setSvcFiltering(false);
    }
  }, [svcPage, debouncedSvcSearch, svcStatus]);

  // Initial fetch
  useEffect(() => {
    fetchServices(false);
    return () => svcAbortRef.current?.abort();
  }, [fetchServices]);

  // Reset page on filter change (but not on page change itself)
  const prevSvcFilter = useRef({ search: "", status: "all" });
  useEffect(() => {
    const prev = prevSvcFilter.current;
    if (prev.search !== debouncedSvcSearch || prev.status !== svcStatus) {
      prevSvcFilter.current = { search: debouncedSvcSearch, status: svcStatus };
      setSvcPage(1);
    }
  }, [debouncedSvcSearch, svcStatus]);

  // ─────────────────────────────────────────────────────────────
  // Fetch certificates
  // ─────────────────────────────────────────────────────────────
  const fetchCertificates = useCallback(async (isFilterChange = false) => {
    if (certAbortRef.current) certAbortRef.current.abort();
    const controller = new AbortController();
    certAbortRef.current = controller;

    if (isFilterChange) setCertFiltering(true);
    dispatch(fetchCertificatesStart());

    try {
      const params = { page: certPage, limit: 10 };
      if (debouncedCertSearch) params.search = debouncedCertSearch;
      if (certStatus !== "all") params.status = certStatus;
      const res = await getAllCertificates(params, { signal: controller.signal });
      dispatch(fetchCertificatesSuccess(res.data.data));
      certInitialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      dispatch(fetchCertificatesFailure());
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
    } finally {
      setCertFiltering(false);
    }
  }, [certPage, debouncedCertSearch, certStatus]);

  useEffect(() => {
    fetchCertificates(false);
    return () => certAbortRef.current?.abort();
  }, [fetchCertificates]);

  const prevCertFilter = useRef({ search: "", status: "all" });
  useEffect(() => {
    const prev = prevCertFilter.current;
    if (prev.search !== debouncedCertSearch || prev.status !== certStatus) {
      prevCertFilter.current = { search: debouncedCertSearch, status: certStatus };
      setCertPage(1);
    }
  }, [debouncedCertSearch, certStatus]);

  // ─────────────────────────────────────────────────────────────
  // Trigger filtering spinner when user types / changes filter
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!svcInitialised.current) return;
    setSvcFiltering(true);
  }, [svcSearch, svcStatus]);

  useEffect(() => {
    if (!certInitialised.current) return;
    setCertFiltering(true);
  }, [certSearch, certStatus]);

  // ─────────────────────────────────────────────────────────────
  // SERVICES handlers
  // ─────────────────────────────────────────────────────────────
  const handleViewSvc = async (row) => {
    setViewSvcLoadingId(row._id);
    setViewingSvc({ _id: row._id, name: row.name });
    try {
      const res = await getServiceById(row._id);
      setViewingSvc(res.data.data.service);
    } catch (err) {
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      setViewingSvc(null);
    } finally {
      setViewSvcLoadingId(null);
    }
  };

  const handleSvcSubmit = async (formData) => {
    if (editingSvc) {
      const id = editingSvc._id;
      dispatch(updateServiceStart(id));
      try {
        const res = await updateService(id, formData);
        dispatch(updateServiceSuccess({ id, service: res.data.data.service }));
        toast({ title: res.data.message });
        setSvcModalOpen(false);
        setEditingSvc(null);
      } catch (err) {
        dispatch(updateServiceFailure(id));
        toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      }
    } else {
      dispatch(createServiceStart());
      try {
        const res = await createService(formData);
        dispatch(createServiceSuccess(res.data.data.service));
        toast({ title: res.data.message });
        setSvcModalOpen(false);
        fetchServices(false);
      } catch (err) {
        dispatch(createServiceFailure());
        toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      }
    }
  };

  const confirmDeleteSvc = async () => {
    const id = deletingSvcId;
    setDeletingSvcId(null);
    dispatch(deleteServiceStart(id));
    try {
      const res = await deleteService(id);
      dispatch(deleteServiceSuccess(id));
      toast({ title: res.data.message });
    } catch (err) {
      dispatch(deleteServiceFailure(id));
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CERTIFICATES handlers
  // ─────────────────────────────────────────────────────────────
  const handleViewCert = async (row) => {
    const id = row._id || row.id;
    setViewCertLoadingId(id);
    setViewingCert({ _id: id, name: row.name });
    try {
      const res = await getCertificateById(id);
      setViewingCert(res.data.data.certificate);
    } catch (err) {
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      setViewingCert(null);
    } finally {
      setViewCertLoadingId(null);
    }
  };

  const handleCertSubmit = async (formData) => {
    if (editingCert) {
      const id = editingCert._id || editingCert.id;
      dispatch(updateCertificateStart(id));
      try {
        const res = await updateCertificate(id, formData);
        dispatch(updateCertificateSuccess({ id, certificate: res.data.data.certificate }));
        toast({ title: res.data.message });
        setCertModalOpen(false);
        setEditingCert(null);
      } catch (err) {
        dispatch(updateCertificateFailure(id));
        toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      }
    } else {
      dispatch(createCertificateStart());
      try {
        const res = await createCertificate(formData);
        dispatch(createCertificateSuccess(res.data.data.certificate));
        toast({ title: res.data.message });
        setCertModalOpen(false);
        fetchCertificates(false);
      } catch (err) {
        dispatch(createCertificateFailure());
        toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
      }
    }
  };

  const confirmDeleteCert = async () => {
    const id = deletingCertId;
    setDeletingCertId(null);
    dispatch(deleteCertificateStart(id));
    try {
      const res = await deleteCertificate(id);
      dispatch(deleteCertificateSuccess(id));
      toast({ title: res.data.message });
    } catch (err) {
      dispatch(deleteCertificateFailure(id));
      toast({ title: err.response?.data?.message || "Er is iets misgegaan.", variant: "destructive" });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // View data builders
  // ─────────────────────────────────────────────────────────────
  const svcViewData = viewingSvc ? {
    images: viewingSvc.image ?? {},
    details: {
      Naam: viewingSvc.name ?? "",
      Omschrijving: viewingSvc.description ?? "",
      Status: viewingSvc.status === "active" ? "Actief" : "Inactief",
      "Aangemaakt op": viewingSvc.createdAt ? formatDate(viewingSvc.createdAt) : "",
    },

  } : null;


  const certViewData = viewingCert ? {
    images: viewingCert.images?.map((i) => i.url) ?? (viewingCert.image ? [viewingCert.image] : []),
    details: {
      Naam: viewingCert.name ?? "",
      Omschrijving: viewingCert.description ?? "",
      // Categorie: viewingCert.category ?? "",
      Status: viewingCert.status === "active" ? "Actief" : "Inactief",
      Datum: viewingCert.receivedDate
        ? new Intl.DateTimeFormat("nl-NL").format(new Date(viewingCert.receivedDate))
        : viewingCert.date ?? "",
    },
  } : null;

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full rounded-[var(--radius)] border border-border bg-white p-2">
          <TabsTrigger value="services" className="h-12 flex-1 rounded-[var(--radius-sm)] text-base font-semibold text-title data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none">
            Diensten
          </TabsTrigger>
          <TabsTrigger value="certificates" className="h-12 flex-1 rounded-[var(--radius-sm)] text-base font-semibold text-title data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none">
            Certificaten
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[2rem] font-bold text-title">
              {activeTab === "services" ? "Dienstenbeheer" : "Certificatenbeheer"}
            </h1>
            <p className="text-sm text-subtitle">
              {activeTab === "services"
                ? "Maak, organiseer en beheer uw dienstenaanbod."
                : "Maak, organiseer en beheer uw certificaten."}
            </p>
          </div>
          <Button
            onClick={() => {
              if (activeTab === "services") { setEditingSvc(null); setSvcModalOpen(true); }
              else { setEditingCert(null); setCertModalOpen(true); }
            }}
            className="h-12 rounded-[var(--radius-sm)] bg-primary px-6 text-white hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "services" ? "Nieuwe dienst" : "Nieuw certificaat"}
          </Button>
        </div>

        <TabsContent value="services" className="mt-6">
          <ServicesTab
            services={services}
            pagination={svcPagination}
            loading={svcLoading}
            isFiltering={svcFiltering}
            viewLoadingId={viewSvcLoadingId}
            search={svcSearch}
            onSearchChange={setSvcSearch}
            statusFilter={svcStatus}
            onStatusChange={setSvcStatus}
            onPageChange={setSvcPage}
            onView={handleViewSvc}
            onEdit={(row) => { setEditingSvc(row); setSvcModalOpen(true); }}
            onDelete={(row) => { setDeletingSvcId(row._id); setDeletingSvcName(row.name); }}
          />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CertificatesTab
            certificates={certificates}
            pagination={certPagination}
            loading={certLoading}
            isFiltering={certFiltering}
            viewLoadingId={viewCertLoadingId}
            search={certSearch}
            onSearchChange={setCertSearch}
            statusFilter={certStatus}
            onStatusChange={setCertStatus}
            onPageChange={setCertPage}
            onView={handleViewCert}
            onEdit={(row) => { setEditingCert(row); setCertModalOpen(true); }}
            onDelete={(row) => { setDeletingCertId(row._id || row.id); setDeletingCertName(row.name); }}
          />
        </TabsContent>
      </Tabs>

      <AddServiceDialog
        open={svcModalOpen}
        onOpenChange={setSvcModalOpen}
        service={editingSvc}
        onSubmit={handleSvcSubmit}
        submitting={editingSvc ? !!svcLoading.update[editingSvc._id] : svcLoading.create}
      />
      <ServiceViewDialog
        open={!!viewingSvc}
        onOpenChange={(open) => !open && setViewingSvc(null)}
        title="Dienstdetails"
        loading={!!viewSvcLoadingId}
        data={svcViewData}
      />
      <DeleteDialog
        open={!!deletingSvcId}
        onOpenChange={(open) => !open && setDeletingSvcId(null)}
        onConfirm={confirmDeleteSvc}
        title="Dienst verwijderen"
        description={`Weet je zeker dat je "${deletingSvcName || "deze dienst"}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        loading={!!svcLoading.delete[deletingSvcId]}
      />

      <AddCertificateDialog
        open={certModalOpen}
        onOpenChange={setCertModalOpen}
        certificate={editingCert}
        onSubmit={handleCertSubmit}
        submitting={editingCert ? !!certLoading.update[editingCert._id || editingCert.id] : certLoading.create}
      />
      <CertificateViewDialog
        open={!!viewingCert}
        onOpenChange={(open) => !open && setViewingCert(null)}
        title="Certificaatdetails"
        loading={!!viewCertLoadingId}
        data={certViewData}
      />
      <DeleteDialog
        open={!!deletingCertId}
        onOpenChange={(open) => !open && setDeletingCertId(null)}
        onConfirm={confirmDeleteCert}
        title="Certificaat verwijderen"
        description={`Weet je zeker dat je "${deletingCertName || "dit certificaat"}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        loading={!!certLoading.delete[deletingCertId]}
      />
    </div>
  );
}
