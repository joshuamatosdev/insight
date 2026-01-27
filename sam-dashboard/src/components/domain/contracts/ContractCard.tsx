import clsx from 'clsx';
import { Badge } from '../../catalyst';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { ContractCardProps } from './Contract.types';
import { getContractTypeLabel, formatCurrency, formatDate } from './Contract.types';

export function ContractCard({
  contract,
  onClick,
  className,
}: ContractCardProps) {
  const getDaysUntilExpiration = (): number | null => {
    if (contract.popEndDate === null) {
      return null;
    }
    const endDate = new Date(contract.popEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationColor = (): string => {
    const days = getDaysUntilExpiration();
    if (days === null) {
      return 'text-on-surface-muted';
    }
    if (days < 0) {
      return 'text-on-surface-muted';
    }
    if (days <= 30) {
      return 'text-danger';
    }
    if (days <= 90) {
      return 'text-warning';
    }
    return 'text-success';
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick !== undefined && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={clsx(
        'rounded-lg bg-surface ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10',
        'mb-4 overflow-hidden',
        onClick !== undefined && 'cursor-pointer transition-shadow hover:ring-zinc-950/10 dark:hover:ring-white/20',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-on-surface truncate mb-1">
              {contract.title}
            </h3>
            <p className="text-sm text-on-surface-muted">
              {contract.contractNumber}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Badge color="blue">
              {getContractTypeLabel(contract.contractType)}
            </Badge>
            <ContractStatusBadge status={contract.status} />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-4 gap-6">
          <div>
            <dt className="text-xs text-on-surface-muted">
              Agency
            </dt>
            <dd className="mt-1 text-sm font-semibold text-on-surface">
              {contract.agency ?? 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-muted">
              Total Value
            </dt>
            <dd className="mt-1 text-sm font-semibold text-on-surface">
              {formatCurrency(contract.totalValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-muted">
              Funded Value
            </dt>
            <dd className="mt-1 text-sm font-semibold text-on-surface">
              {formatCurrency(contract.fundedValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-muted">
              PoP End Date
            </dt>
            <dd className={clsx('mt-1 text-sm font-semibold', getExpirationColor())}>
              {formatDate(contract.popEndDate)}
            </dd>
          </div>
        </dl>

        {(contract.contractingOfficerName !== null ||
          contract.programManagerName !== null) && (
          <div className="mt-6 pt-6 border-t border-border dark:border-white/10">
            <dl className="grid grid-cols-2 gap-6">
              {contract.contractingOfficerName !== null && (
                <div>
                  <dt className="text-xs text-on-surface-muted">
                    Contracting Officer
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {contract.contractingOfficerName}
                  </dd>
                </div>
              )}
              {contract.programManagerName !== null && (
                <div>
                  <dt className="text-xs text-on-surface-muted">
                    Program Manager
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {contract.programManagerName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractCard;
