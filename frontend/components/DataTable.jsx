import { EmptyState } from '@/components/EmptyState';
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';

export function DataTable({
  columns,
  rows,
  loading = false,
  emptyTitle = 'Tidak ada data',
  emptyDescription,
  emptyAction,
  keyField = 'id',
}) {
  if (loading) {
    return (
      <div className="space-y-3 p-6">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="h-11 w-full animate-pulse rounded-lg bg-cream" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <tr>
          {columns.map((col) => (
            <TableHeaderCell key={col.key} className={col.headerClassName}>
              {col.label}
            </TableHeaderCell>
          ))}
        </tr>
      </TableHead>
      <tbody>
        {rows.map((row) => (
          <TableRow key={row[keyField]}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.cellClassName}>
                {col.render ? col.render(row) : row[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
