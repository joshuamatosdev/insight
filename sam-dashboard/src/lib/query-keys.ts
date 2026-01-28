export const queryKeys = {
    opportunities: {
        all: ['opportunities'] as const,
        list: () => [...queryKeys.opportunities.all, 'list'] as const,
    },
    contracts: {
        all: ['contracts'] as const,
        list: (filters?: object) => [...queryKeys.contracts.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.contracts.all, 'detail', id] as const,
        summary: (id: string) => [...queryKeys.contracts.all, 'summary', id] as const,
        clins: (id: string) => [...queryKeys.contracts.all, 'clins', id] as const,
        modifications: (id: string) => [...queryKeys.contracts.all, 'modifications', id] as const,
        deliverables: (id: string) => [...queryKeys.contracts.all, 'deliverables', id] as const,
    },
    contacts: {
        all: ['contacts'] as const,
        list: (filters?: object) => [...queryKeys.contacts.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.contacts.all, 'detail', id] as const,
    },
    organizations: {
        all: ['organizations'] as const,
        list: (filters?: object) => [...queryKeys.organizations.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
    },
    pipelines: {
        all: ['pipelines'] as const,
        list: () => [...queryKeys.pipelines.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.pipelines.all, 'detail', id] as const,
        stages: (id: string) => [...queryKeys.pipelines.all, 'stages', id] as const,
        opportunities: (id: string) => [...queryKeys.pipelines.all, 'opportunities', id] as const,
    },
    documents: {
        all: ['documents'] as const,
        list: (filters?: object) => [...queryKeys.documents.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.documents.all, 'detail', id] as const,
    },
    budgets: {
        all: ['budgets'] as const,
        list: (filters?: object) => [...queryKeys.budgets.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.budgets.all, 'detail', id] as const,
    },
    invoices: {
        all: ['invoices'] as const,
        list: (filters?: object) => [...queryKeys.invoices.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.invoices.all, 'detail', id] as const,
    },
    laborRates: {
        all: ['laborRates'] as const,
        list: (filters?: object) => [...queryKeys.laborRates.all, 'list', filters] as const,
    },
    compliance: {
        all: ['compliance'] as const,
        certifications: () => [...queryKeys.compliance.all, 'certifications'] as const,
        alerts: () => [...queryKeys.compliance.all, 'alerts'] as const,
    },
    dashboard: {
        all: ['dashboard'] as const,
        summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
    },
} as const;
