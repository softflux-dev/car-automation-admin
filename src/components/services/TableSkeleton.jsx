import { TableRow, TableCell } from "@/components/ui/table";

export default function TableSkeleton({ rows = 5, cols = 7 }) {
  return Array.from({ length: rows }, (_, r) => (
    <TableRow key={r} className="border-b border-border">
      {Array.from({ length: cols }, (_, c) => (
        <TableCell key={c} className="px-5 py-4 border-b border-border">
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
