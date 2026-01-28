import {Opportunity} from '../components/domain/opportunity';

export function exportToCSV(opportunities: Opportunity[], filename?: string): void {
  const headers = [
    'Title',
    'Solicitation Number',
    'Type',
    'NAICS Code',
    'Posted Date',
    'Deadline',
    'URL',
  ];

  const rows = opportunities.map((o) => [
    `"${(o.title || '').replace(/"/g, '""')}"`,
    o.solicitationNumber || '',
    o.type || '',
    o.naicsCode || '',
    o.postedDate || '',
    o.responseDeadLine || '',
    o.url || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const datePart = new Date().toISOString().split('T').at(0) ?? 'export';
  a.download = filename ?? `sam-opportunities-${datePart}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
