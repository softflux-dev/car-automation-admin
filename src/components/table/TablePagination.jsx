import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Functional pagination for DataTable
 */
export default function TablePagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <p className="text-sm text-gray-500">
        {from}–{to} van {total} resultaten
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="h-9 rounded-lg border-border/60 bg-white"
        >
          <ChevronLeft size={16} className="mr-1" />
          Vorige
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="h-9 rounded-lg border-border/60 bg-white"
        >
          Volgende
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
