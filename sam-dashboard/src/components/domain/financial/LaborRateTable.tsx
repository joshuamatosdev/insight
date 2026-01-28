/**
 * LaborRateTable - Table display of labor rates
 */

import {Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../catalyst';
import {PencilIcon, TrashIcon} from '@heroicons/react/20/solid';
import type {LaborRateTableProps} from './Financial.types';
import {formatCurrency, formatDate} from '../../../services/financialService';

export function LaborRateTable({
                                   rates,
                                   onEdit,
                                   onToggleActive,
                                   onDelete,
                                   className,
                               }: LaborRateTableProps) {
    if (rates.length === 0) {
        return (
            <div>
                <div>
                    <p>
                        No labor rates configured yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Labor Category</TableHeader>
                        <TableHeader>Experience</TableHeader>
                        <TableHeader>Base Rate</TableHeader>
                        <TableHeader>Fully Burdened</TableHeader>
                        <TableHeader>Billing Rate</TableHeader>
                        <TableHeader>Effective Period</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actions</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rates.map((rate) => (
                        <TableRow key={rate.id}>
                            <TableCell>
                                <div>
                                    <p>
                                        {rate.laborCategory}
                                    </p>
                                    {rate.laborCategoryDescription !== null && (
                                        <p>
                                            {rate.laborCategoryDescription}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p>
                                        {rate.minYearsExperience !== null || rate.maxYearsExperience !== null
                                            ? `${rate.minYearsExperience ?? 0}-${rate.maxYearsExperience ?? '+'} years`
                                            : '-'}
                                    </p>
                                    {rate.educationRequirement !== null && (
                                        <p>
                                            {rate.educationRequirement}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p>{formatCurrency(rate.baseRate)}</p>
                                    {rate.rateType !== null && (
                                        <p>
                                            /{rate.rateType.toLowerCase()}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {rate.fullyBurdenedRate !== null
                                    ? formatCurrency(rate.fullyBurdenedRate)
                                    : '-'}
                            </TableCell>
                            <TableCell>
                                {rate.billingRate !== null ? formatCurrency(rate.billingRate) : '-'}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p>
                                        {rate.effectiveDate !== null
                                            ? formatDate(rate.effectiveDate)
                                            : 'No start'}
                                        {' - '}
                                        {rate.endDate !== null ? formatDate(rate.endDate) : 'Ongoing'}
                                    </p>
                                    {rate.fiscalYear !== null && (
                                        <p>
                                            FY{rate.fiscalYear}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge color={rate.isActive ? 'green' : 'zinc'}>
                                    {rate.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div>
                                    {onToggleActive !== undefined && (
                                        <Button
                                            plain
                                            onClick={() => onToggleActive(rate.id, !rate.isActive)}
                                            aria-label={rate.isActive ? 'Deactivate rate' : 'Activate rate'}
                                        >
                      <span>
                        {rate.isActive ? 'Disable' : 'Enable'}
                      </span>
                                        </Button>
                                    )}
                                    {onEdit !== undefined && (
                                        <Button
                                            plain
                                            onClick={() => onEdit(rate)}
                                            aria-label="Edit labor rate"
                                        >
                                            <PencilIcon/>
                                        </Button>
                                    )}
                                    {onDelete !== undefined && (
                                        <Button
                                            plain
                                            onClick={() => onDelete(rate.id)}
                                            aria-label="Delete labor rate"
                                        >
                                            <TrashIcon/>
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default LaborRateTable;
