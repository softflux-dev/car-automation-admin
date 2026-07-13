import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import TablePagination from "./TablePagination";
import TableSkeleton from "@/components/services/TableSkeleton";

export default function DataTable({
  columns = [],
  data = [],
  title,
  pagination,
  emptyMessage = "Geen gegevens gevonden",
  containerClassName = "",
  tableClassName = "",
  loading = false,
  overlayLoading = false,
}) {
  const showSkeleton = loading && data.length === 0;
  const showOverlay = overlayLoading && data.length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm",
        containerClassName,
      )}
    >
      {title && (
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--title)]">
            {title}
          </h2>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table className={cn("min-w-full", tableClassName)}>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-14 bg-muted px-5 text-sm font-medium text-muted-foreground whitespace-nowrap",
                    index === 0 && "pl-5",
                    col.headClassName,
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody
            className={cn(
              "transition-opacity duration-200 [&_tr:last-child>td]:border-b-0",
              showOverlay && "pointer-events-none opacity-40",
            )}
          >
            {showSkeleton ? (
              <TableSkeleton rows={5} cols={columns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-[var(--text-muted)]"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow key={row._id ?? row.id ?? rowIdx}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "border-b border-border/60 px-5 py-4 text-sm text-[var(--text-muted)] transition-colors duration-150",
                        col.cellClassName,
                      )}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="border-t border-border/60 px-5 py-3">
          <TablePagination {...pagination} />
        </div>
      )}
    </div>
  );
}
