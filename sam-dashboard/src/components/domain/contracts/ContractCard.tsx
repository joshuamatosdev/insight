import {Badge} from '../../catalyst';
import {ContractStatusBadge} from './ContractStatusBadge';
import type {ContractCardProps} from './Contract.types';
import {formatCurrency, formatDate, getContractTypeLabel} from './Contract.types';

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
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={onClick !== undefined ? 0 : undefined}
            role={onClick !== undefined ? 'button' : undefined}
        >
            <div>
                <div>
                    <div>
                        <h3>
                            {contract.title}
                        </h3>
                        <p>
                            {contract.contractNumber}
                        </p>
                    </div>
                    <div>
                        <Badge color="blue">
                            {getContractTypeLabel(contract.contractType)}
                        </Badge>
                        <ContractStatusBadge status={contract.status}/>
                    </div>
                </div>

                <dl>
                    <div>
                        <dt>
                            Agency
                        </dt>
                        <dd>
                            {contract.agency ?? 'N/A'}
                        </dd>
                    </div>
                    <div>
                        <dt>
                            Total Value
                        </dt>
                        <dd>
                            {formatCurrency(contract.totalValue)}
                        </dd>
                    </div>
                    <div>
                        <dt>
                            Funded Value
                        </dt>
                        <dd>
                            {formatCurrency(contract.fundedValue)}
                        </dd>
                    </div>
                    <div>
                        <dt>
                            PoP End Date
                        </dt>
                        <dd>
                            {formatDate(contract.popEndDate)}
                        </dd>
                    </div>
                </dl>

                {(contract.contractingOfficerName !== null ||
                    contract.programManagerName !== null) && (
                    <div>
                        <dl>
                            {contract.contractingOfficerName !== null && (
                                <div>
                                    <dt>
                                        Contracting Officer
                                    </dt>
                                    <dd>
                                        {contract.contractingOfficerName}
                                    </dd>
                                </div>
                            )}
                            {contract.programManagerName !== null && (
                                <div>
                                    <dt>
                                        Program Manager
                                    </dt>
                                    <dd>
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
