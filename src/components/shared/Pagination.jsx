import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageRangeLabel = "",
}) {

  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-muted-foreground">
        {pageRangeLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-border"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={16} className="mr-1" />
          Vorige
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-border"
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Volgende
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}