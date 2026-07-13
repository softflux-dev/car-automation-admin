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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DataTable from "@/components/table/DataTable";
import DeleteDialog from "@/components/shared/DeleteDialog";
import ProjectViewDialog from "@/components/portfolio/ProjectViewDialog";
import AddProjectDialog from "@/components/portfolio/AddProjectDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
} from "@/store/slices/portfolioSlice";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/api/services/portfolioService";
import { useToast } from "@/hooks/use-toast";

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function PortfolioPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { projects, pagination, loading } = useAppSelector((s) => s.portfolio);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [isFiltering, setIsFiltering] = useState(false);
  const abortRef = useRef(null);
  const initialised = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  // ── Fetch projects ──
  const fetchProjects = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(fetchProjectsStart());
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await getAllProjects(params, { signal: controller.signal });
      dispatch(fetchProjectsSuccess(res.data.data));
      initialised.current = true;
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      dispatch(fetchProjectsFailure());
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchProjects();
    return () => abortRef.current?.abort();
  }, [fetchProjects]);

  // Reset page on filter change
  const prevFilter = useRef({ search: "", status: "all" });
  useEffect(() => {
    const prev = prevFilter.current;
    if (prev.search !== debouncedSearch || prev.status !== statusFilter) {
      prevFilter.current = { search: debouncedSearch, status: statusFilter };
      setPage(1);
    }
  }, [debouncedSearch, statusFilter]);

  // Show filtering spinner immediately on input change
  useEffect(() => {
    if (!initialised.current) return;
    setIsFiltering(true);
  }, [search, statusFilter]);

  // ── View ──
  const handleView = async (row) => {
    setViewLoading(true);
    setViewingProject({ _id: row._id, title: row.title });
    try {
      const res = await getProjectById(row._id);
      setViewingProject(res.data.data.project ?? res.data.data);
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
      setViewingProject(null);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Create / Update — returns true on success so dialog can close itself ──
  const handleSubmit = async (formData) => {
    if (editingProject?._id) {
      const id = editingProject._id;
      dispatch(updateProjectStart(id));
      try {
        const res = await updateProject(id, formData);
        const project = res.data.data?.project ?? res.data.data;
        dispatch(updateProjectSuccess({ id, project }));
        toast({ title: res.data.message });
        setEditingProject(null);
        return true;
      } catch (err) {
        dispatch(updateProjectFailure(id));
        toast({
          title: err.response?.data?.message || "Er is iets misgegaan.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      dispatch(createProjectStart());
      try {
        const res = await createProject(formData);
        const project = res.data.data?.project ?? res.data.data;
        dispatch(createProjectSuccess(project));
        toast({ title: res.data.message });
        fetchProjects();
        return true;
      } catch (err) {
        dispatch(createProjectFailure());
        toast({
          title: err.response?.data?.message || "Er is iets misgegaan.",
          variant: "destructive",
        });
        return false;
      }
    }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    const id = deletingProject._id;
    setDeletingProject(null);
    dispatch(deleteProjectStart(id));
    try {
      const res = await deleteProject(id);
      dispatch(deleteProjectSuccess(id));
      toast({ title: res.data.message });
    } catch (err) {
      dispatch(deleteProjectFailure(id));
      toast({
        title: err.response?.data?.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "title",
      label: "Project",
      cellClassName: "min-w-[180px]",
      render: (row) => {
        const thumb = row.media?.find((m) => m.type === "image")?.url;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0 rounded-lg">
              <AvatarImage
                src={thumb}
                alt={row.title}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg">
                {row.title?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-title truncate max-w-[160px]">
              {row.title}
            </span>
          </div>
        );
      },
    },
    {
      key: "media",
      label: "Media",
      cellClassName: "min-w-[80px]",
      render: (row) => (
        <span className="text-sm text-title">
          {row.media?.length ?? 0} bestand(en)
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
      key: "actions",
      label: "Acties",
      cellClassName: "min-w-[110px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-subtitle transition-colors hover:bg-muted hover:text-title"
            onClick={() => handleView(row)}
          >
            {viewLoading && viewingProject?._id === row._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-subtitle transition-colors hover:bg-muted hover:text-title"
            disabled={!!loading.update[row._id]}
            onClick={() => {
              setEditingProject(row);
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
            className="rounded-lg p-2 text-destructive transition-colors hover:bg-muted hover:text-destructive"
            disabled={!!loading.delete[row._id]}
            onClick={() => setDeletingProject(row)}
          >
            {loading.delete[row._id] ? (
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
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
          <h1 className="text-2xl font-bold text-title">Portfoliobeheer</h1>
          <p className="text-sm text-subtitle">
            Maak, organiseer en beheer uw projecten.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
          className="h-12 rounded-[var(--radius-sm)] bg-primary px-6 text-white hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nieuw project
        </Button>
      </div>

      {/* Filter bar — fixed height to prevent layout shift */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {isFiltering ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-subtitle" />
            )}
          </div>
          <Input
            placeholder="Zoek op projecttitel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-2xl border-0 bg-white pl-9 shadow-sm placeholder:text-subtitle"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className={`h-11 w-full rounded-2xl border-0 bg-white shadow-sm sm:w-[170px] ${statusFilter === "all" ? "text-subtitle" : "text-[var(--title)]"}`}
          >
            <SelectValue placeholder="Alle statussen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className="text-subtitle focus:text-subtitle data-[state=checked]:text-subtitle"
            >
              Alle statussen
            </SelectItem>
            <SelectItem value="active">Actief</SelectItem>
            <SelectItem value="inactive">Inactief</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <span className="text-sm text-subtitle">
        Totaal: {pagination.total} projecten
      </span>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading.fetch && projects.length === 0}
        overlayLoading={loading.fetch && projects.length > 0}
        emptyMessage="Geen projecten gevonden."
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

      <AddProjectDialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
        onSubmit={handleSubmit}
        submitting={
          editingProject?._id
            ? !!loading.update[editingProject._id]
            : loading.create
        }
      />

      <ProjectViewDialog
        open={!!viewingProject}
        onOpenChange={(open) => !open && setViewingProject(null)}
        project={viewingProject}
        loading={viewLoading}
      />

      <DeleteDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirm={confirmDelete}
        title="Project verwijderen"
        description={`Weet u zeker dat u "${deletingProject?.title || "dit project"}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        loading={!!loading.delete[deletingProject?._id]}
      />
    </div>
  );
}
