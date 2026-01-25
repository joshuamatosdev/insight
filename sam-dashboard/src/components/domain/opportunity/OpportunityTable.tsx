import { Opportunity, getOpportunityType } from './Opportunity.types';
import { Text } from '../../primitives';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '../../layout';
import { NAICSBadge } from '../naics';
import { TypeBadge } from './TypeBadge';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  maxRows?: number;
}

export function OpportunityTable({ opportunities, maxRows }: OpportunityTableProps) {
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDeadlineColor = (deadline: string | undefined): 'danger' | 'warning' | 'success' | 'muted' => {
    if (!deadline) return 'muted';
    const now = new Date();
    const dl = new Date(deadline);
    const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0) return 'muted';
    if (daysUntil <= 3) return 'danger';
    if (daysUntil <= 7) return 'warning';
    return 'success';
  };

  const truncate = (str: string | undefined, len: number): string => {
    if (!str) return 'N/A';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const displayOpportunities = maxRows ? opportunities.slice(0, maxRows) : opportunities;

  if (opportunities.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
        <Text variant="body" color="muted">
          No opportunities to display.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow isHoverable={false}>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>NAICS</TableHeaderCell>
            <TableHeaderCell>Deadline</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayOpportunities.map((opp) => (
            <TableRow key={opp.id}>
              <TableCell>
                <a
                  href={opp.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Text variant="bodySmall" color="primary">
                    {truncate(opp.title, 50)}
                  </Text>
                </a>
              </TableCell>
              <TableCell>
                <TypeBadge type={getOpportunityType(opp.type)} label={opp.type} />
              </TableCell>
              <TableCell>
                <NAICSBadge code={opp.naicsCode} />
              </TableCell>
              <TableCell>
                <Text variant="bodySmall" color={getDeadlineColor(opp.responseDeadLine)}>
                  {formatDate(opp.responseDeadLine)}
                </Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default OpportunityTable;
