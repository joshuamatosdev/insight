import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {DocumentsPage} from '@/pages';

const documentsSearchSchema = z.object({
    folderId: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/documents')({
    component: () => <DocumentsPage/>,
    validateSearch: documentsSearchSchema,
});
