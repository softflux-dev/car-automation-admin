import { Search, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/table/DataTable";

const formatDate = (iso) =>
  new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const COLS = ["Naam", "Datum", "Status", "Acties"];

export default function ServicesTab({
  services,
  pagination,
  loading,
  isFiltering,
  onView,
  onEdit,
  onDelete,
  viewLoadingId,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onPageChange,
}) {
  // Initial load: no data yet + fetching → full skeleton
  const showSkeleton = loading.fetch && services.length === 0;
  // Filter re-fetch: data exists but filtering → dim existing rows
  const showOverlay = loading.fetch && services.length > 0;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2">
            {isFiltering ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-[#b0b0b0]" />
            )}
          </div>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Zoek op dienstnaam..."
            className="h-11 rounded-2xl border-0 bg-white pl-9 shadow-sm placeholder:text-[#c2c2c2]"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
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
      </div>

      <span className="block text-sm text-[#8b8b8b]">
        Totaal: {pagination.total} diensten
      </span>

      <DataTable
        columns={[
          {
            key: "name",
            label: "Naam",
            headClassName:
              "h-14 bg-[#f4f4f4] px-5 text-sm font-medium text-[#7b7b7b] whitespace-nowrap rounded-l-3xl",
            cellClassName: "px-5 py-4 min-w-[180px]",
            render: (row) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={row.image?.url} alt={row.name} />
                  <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-[#111111] truncate max-w-[160px]">
                  {row.name}
                </span>
              </div>
            ),
          },
          {
            key: "date",
            label: "Datum",
            headClassName:
              "h-14 bg-[#f4f4f4] px-5 text-sm font-medium text-[#7b7b7b] whitespace-nowrap",
            cellClassName:
              "px-5 py-4 text-sm text-[#3e3e3e] whitespace-nowrap min-w-[130px]",
            render: (row) => formatDate(row.createdAt),
          },
          {
            key: "status",
            label: "Status",
            headClassName:
              "h-14 bg-[#f4f4f4] px-5 text-sm font-medium text-[#7b7b7b] whitespace-nowrap",
            cellClassName: "px-5 py-4 min-w-[90px]",
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
            headClassName:
              "h-14 bg-[#f4f4f4] px-5 text-sm font-medium text-[#7b7b7b] whitespace-nowrap rounded-r-3xl",
            cellClassName: "px-5 py-4 min-w-[110px]",
            render: (row) => (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#a9a9a9] transition-colors hover:bg-muted hover:text-[#8a8a8a]"
                  onClick={() => onView(row)}
                >
                  {viewLoadingId === row._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#a9a9a9] transition-colors hover:bg-muted hover:text-[#8a8a8a]"
                  disabled={!!loading.update?.[row._id]}
                  onClick={() => onEdit(row)}
                >
                  {loading.update?.[row._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#ff1f1f] transition-colors hover:bg-muted hover:text-[#ff1f1f]"
                  disabled={!!loading.delete?.[row._id]}
                  onClick={() => onDelete(row)}
                >
                  {loading.delete?.[row._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#ff1f1f]" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ),
          },
        ]}
        data={services}
        pagination={pagination}
        loading={showSkeleton}
        overlayLoading={showOverlay}
        emptyMessage="Geen diensten gevonden."
      />
    </div>
  );
}
