import { Eye, Trash2, AlertCircle, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { useState } from "react";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle className="mb-3 h-12 w-12 text-[var(--text-muted)]" />
    <p className="text-[var(--text-muted)]">Geen offertes beschikbaar</p>
    <p className="text-sm text-[var(--text-muted)]">Begin met het toevoegen van nieuwe offertes</p>
  </div>
);

const getStatusBadge = (status) => {
  const statusMap = {
    "goedgekeurd": { label: "Goedgekeurd", className: "bg-green-100 text-green-700", icon: CheckCircle },
    "in-behandeling": { label: "In Behandeling", className: "bg-amber-100 text-amber-700", icon: Clock },
    "afgewezen": { label: "Afgewezen", className: "bg-red-100 text-red-700", icon: XCircle },
    "nieuw": { label: "Nieuw", className: "bg-blue-100 text-blue-700", icon: AlertCircle },
  };
  
  const config = statusMap[status] || statusMap["in-behandeling"];
  return config;
};

export default function OfferteTable({ 
  data = [], 
  onView,
  onDelete, 
  onStatusChange,
  pagination,
  loading = false,
  error = null,
  deletingId = null,
}) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });

  const handleDeleteClick = (item) => {
    setDeleteDialog({
      open: true,
      item,
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.item && onDelete) {
      onDelete(deleteDialog.item);
    }
    setDeleteDialog({ open: false, item: null });
  };

  const columns = [
    {
      key: "offerteId",
      label: "Offerte ID",
      render: (row) => (
        <span className="font-medium text-[var(--text-main)]">{row.offerteId || row.requestId || "-"}</span>
      ),
    },
    {
      key: "klantNaam",
      label: "Klantnaam",
      render: (row) => (
        <span className="font-medium text-[var(--text-main)]">{row.customerName || row.klantNaam || "-"}</span>
      ),
    },
    {
      key: "bedrijfsnaam",
      label: "Bedrijfsnaam",
      render: (row) => (
        <span className="text-[var(--text-muted)]">{row.companyName || row.bedrijfsnaam || "-"}</span>
      ),
    },
    {
      key: "categorie",
      label: "Categorie",
      render: (row) => {
        const statusConfig = getStatusBadge(row.status || "in-behandeling");
        const Icon = statusConfig.icon;
        return (
          <Badge className={`${statusConfig.className} gap-1.5`}>
            <Icon size={14} />
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      key: "datum",
      label: "Datum",
      render: (row) => new Date(row.createdAt || row.datum || Date.now()).toLocaleDateString("nl-NL"),
    },
    {
      key: "bedrag",
      label: "Bedrag",
      render: (row) => {
        const amount = row.amount || row.bedrag || 0;
        return (
          <span className="font-semibold text-[var(--text-main)]">
            €{amount.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Acties",
      render: (row) => (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              onClick={() => onView(row)}
              title="Bekijk details"
            >
              <Eye size={16} />
            </Button>
          )}
          {onStatusChange && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--text-muted)] hover:text-amber-500"
              onClick={() => onStatusChange(row)}
              title="Status wijzigen"
            >
              <Clock size={16} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--text-muted)] hover:text-red-500"
              disabled={deletingId === row._id || deletingId === row.id}
              onClick={() => handleDeleteClick(row)}
              title="Verwijder"
            >
              {deletingId === row._id || deletingId === row.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-color)] bg-white">
        <div className="border-b border-[var(--border-color)] px-6 py-4">
          <h3 className="font-semibold text-[var(--text-main)]">Offerte Overzicht</h3>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        title="Offerte Overzicht"
        pagination={pagination}
        loading={loading}
        tableClassName="offerte-table"
      />

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        title={`Offerte verwijderen`}
        description={`Weet je zeker dat je de offerte voor "${deleteDialog.item?.customerName || deleteDialog.item?.klantNaam || 'deze klant'}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        type="delete"
        confirmText="Ja, verwijderen"
        cancelText="Annuleren"
        loading={deletingId === deleteDialog.item?._id || deletingId === deleteDialog.item?.id}
      />
    </>
  );
}