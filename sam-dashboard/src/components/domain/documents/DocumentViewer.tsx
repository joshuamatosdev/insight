import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Badge, Button, DownloadIcon, FileIcon, Text} from '../../catalyst/primitives';
import type {Document} from '../../../types/documents';
import {
    formatFileSize,
    getAccessLevelVariant,
    getDocumentStatusVariant,
    getDocumentTypeLabel,
} from '../../../services/documentService';

export interface DocumentViewerProps {
    document: Document;
    onDownload?: () => void;
    onCheckout?: () => void;
    onCheckin?: () => void;
    onEdit?: () => void;
    onViewVersions?: () => void;
}

function formatDate(dateString: string | null): string {
    if (dateString === null) {
        return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface DetailRowProps {
    label: string;
    value: string | null | undefined;
}

function DetailRow({label, value}: DetailRowProps) {
    const displayValue = value === null || value === undefined || value === '' ? '-' : value;
    return (
        <HStack justify="between" align="start">
            <Text variant="bodySmall" color="secondary" style={{minWidth: '140px'}}>
                {label}
            </Text>
            <Text variant="bodySmall" style={{textAlign: 'right'}}>
                {displayValue}
            </Text>
        </HStack>
    );
}

export function DocumentViewer({
                                   document,
                                   onDownload,
                                   onCheckout,
                                   onCheckin,
                                   onEdit,
                                   onViewVersions,
                               }: DocumentViewerProps) {
    const isCheckedOut = document.isCheckedOut === true;

    return (
        <Stack gap="lg">
            <Card>
                <CardHeader>
                    <HStack justify="between" align="center">
                        <HStack gap="md" align="center">
                            <FileIcon size="lg"/>
                            <Stack gap="xs">
                                <Text variant="heading4">{document.name}</Text>
                                <Text variant="bodySmall" color="secondary">
                                    {document.fileName}
                                </Text>
                            </Stack>
                        </HStack>
                        <HStack gap="sm">
                            {onDownload !== undefined && (
                                <Button variant="secondary" onClick={onDownload}>
                                    <DownloadIcon size="sm"/>
                                    Download
                                </Button>
                            )}
                            {isCheckedOut === false && onCheckout !== undefined && (
                                <Button variant="secondary" onClick={onCheckout}>
                                    Check Out
                                </Button>
                            )}
                            {isCheckedOut === true && onCheckin !== undefined && (
                                <Button variant="secondary" onClick={onCheckin}>
                                    Check In
                                </Button>
                            )}
                            {onEdit !== undefined && (
                                <Button variant="primary" onClick={onEdit}>
                                    Edit
                                </Button>
                            )}
                        </HStack>
                    </HStack>
                </CardHeader>
                <CardBody>
                    <HStack gap="sm">
                        <Badge color={getDocumentStatusVariant(document.status)}>
                            {document.status}
                        </Badge>
                        <Badge color="gray">
                            {getDocumentTypeLabel(document.documentType)}
                        </Badge>
                        <Badge color={getAccessLevelVariant(document.accessLevel)}>
                            {document.accessLevel}
                        </Badge>
                        {document.versionNumber > 1 && (
                            <Badge color="blue">v{document.versionNumber}</Badge>
                        )}
                        {isCheckedOut && (
                            <Badge color="yellow">
                                Checked out by {document.checkedOutByName}
                            </Badge>
                        )}
                    </HStack>

                    {document.description !== null && (
                        <Text variant="body">
                            {document.description}
                        </Text>
                    )}

                    {onViewVersions !== undefined && document.versionNumber > 1 && (
                        <Button variant="ghost" size="sm" onClick={onViewVersions}>
                            View Version History ({document.versionNumber} versions)
                        </Button>
                    )}
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Text variant="heading5">File Details</Text>
                </CardHeader>
                <CardBody>
                    <Stack gap="sm">
                        <DetailRow label="File Size" value={formatFileSize(document.fileSize)}/>
                        <DetailRow label="Content Type" value={document.contentType}/>
                        <DetailRow label="Author" value={document.author}/>
                        <DetailRow label="Source" value={document.source}/>
                        <DetailRow label="Tags" value={document.tags}/>
                        <DetailRow label="Keywords" value={document.keywords}/>
                    </Stack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Text variant="heading5">Dates</Text>
                </CardHeader>
                <CardBody>
                    <Stack gap="sm">
                        <DetailRow label="Created" value={formatDate(document.createdAt)}/>
                        <DetailRow label="Created By" value={document.createdByName}/>
                        <DetailRow label="Last Updated" value={formatDate(document.updatedAt)}/>
                        <DetailRow label="Updated By" value={document.updatedByName}/>
                        <DetailRow label="Effective Date" value={formatDate(document.effectiveDate)}/>
                        <DetailRow label="Expiration Date" value={formatDate(document.expirationDate)}/>
                    </Stack>
                </CardBody>
            </Card>

            {document.status === 'APPROVED' && (
                <Card>
                    <CardHeader>
                        <Text variant="heading5">Approval Information</Text>
                    </CardHeader>
                    <CardBody>
                        <Stack gap="sm">
                            <DetailRow label="Approved By" value={document.approvedByName}/>
                            <DetailRow label="Approved At" value={formatDate(document.approvedAt)}/>
                            <DetailRow label="Approval Notes" value={document.approvalNotes}/>
                        </Stack>
                    </CardBody>
                </Card>
            )}

            {document.folderName !== null && (
                <Card>
                    <CardHeader>
                        <Text variant="heading5">Location</Text>
                    </CardHeader>
                    <CardBody>
                        <Stack gap="sm">
                            <DetailRow label="Folder" value={document.folderName}/>
                            {document.opportunityId !== null && (
                                <DetailRow label="Opportunity ID" value={document.opportunityId}/>
                            )}
                            {document.contractId !== null && (
                                <DetailRow label="Contract ID" value={document.contractId}/>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            )}
        </Stack>
    );
}
