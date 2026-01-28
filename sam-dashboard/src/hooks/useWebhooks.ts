import {useCallback, useEffect, useState} from 'react';
import type {
    CreateWebhookRequest,
    UpdateWebhookRequest,
    Webhook,
    WebhookDelivery,
    WebhookTestResult,
} from '../services';
import {
    createWebhook,
    deleteWebhook,
    fetchWebhook,
    fetchWebhookDeliveries,
    fetchWebhooks,
    testWebhook,
    toggleWebhookStatus,
    updateWebhook,
} from '../services';

export interface UseWebhooksReturn {
    webhooks: Webhook[];
    isLoading: boolean;
    error: Error | null;
    create: (data: CreateWebhookRequest) => Promise<Webhook>;
    update: (id: string, data: UpdateWebhookRequest) => Promise<Webhook>;
    remove: (id: string) => Promise<void>;
    test: (id: string) => Promise<WebhookTestResult>;
    toggle: (id: string) => Promise<Webhook>;
    refresh: () => Promise<void>;
}

export function useWebhooks(): UseWebhooksReturn {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadWebhooks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWebhooks();
            setWebhooks(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load webhooks'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadWebhooks();
    }, [loadWebhooks]);

    const create = useCallback(async (data: CreateWebhookRequest) => {
        const webhook = await createWebhook(data);
        await loadWebhooks();
        return webhook;
    }, [loadWebhooks]);

    const update = useCallback(async (id: string, data: UpdateWebhookRequest) => {
        const webhook = await updateWebhook(id, data);
        await loadWebhooks();
        return webhook;
    }, [loadWebhooks]);

    const remove = useCallback(async (id: string) => {
        await deleteWebhook(id);
        await loadWebhooks();
    }, [loadWebhooks]);

    const test = useCallback(async (id: string) => {
        return await testWebhook(id);
    }, []);

    const toggle = useCallback(async (id: string) => {
        const webhook = await toggleWebhookStatus(id);
        await loadWebhooks();
        return webhook;
    }, [loadWebhooks]);

    return {
        webhooks,
        isLoading,
        error,
        create,
        update,
        remove,
        test,
        toggle,
        refresh: loadWebhooks,
    };
}

export interface UseWebhookReturn {
    webhook: Webhook | null;
    isLoading: boolean;
    error: Error | null;
    update: (data: UpdateWebhookRequest) => Promise<Webhook>;
    test: () => Promise<WebhookTestResult>;
    toggle: () => Promise<Webhook>;
    refresh: () => Promise<void>;
}

export function useWebhook(id: string | null): UseWebhookReturn {
    const [webhook, setWebhook] = useState<Webhook | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadWebhook = useCallback(async () => {
        if (id === null || id === '') {
            setWebhook(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWebhook(id);
            setWebhook(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load webhook'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadWebhook();
    }, [loadWebhook]);

    const update = useCallback(async (data: UpdateWebhookRequest) => {
        if (id === null) throw new Error('No webhook ID');
        const updated = await updateWebhook(id, data);
        setWebhook(updated);
        return updated;
    }, [id]);

    const test = useCallback(async () => {
        if (id === null) throw new Error('No webhook ID');
        return await testWebhook(id);
    }, [id]);

    const toggle = useCallback(async () => {
        if (id === null) throw new Error('No webhook ID');
        const updated = await toggleWebhookStatus(id);
        setWebhook(updated);
        return updated;
    }, [id]);

    return {
        webhook,
        isLoading,
        error,
        update,
        test,
        toggle,
        refresh: loadWebhook,
    };
}

export interface UseWebhookDeliveriesReturn {
    deliveries: WebhookDelivery[];
    totalElements: number;
    page: number;
    isLoading: boolean;
    error: Error | null;
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
}

export function useWebhookDeliveries(
    webhookId: string | null,
    pageSize: number = 20
): UseWebhookDeliveriesReturn {
    const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadDeliveries = useCallback(async () => {
        if (webhookId === null || webhookId === '') {
            setDeliveries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWebhookDeliveries(webhookId, page, pageSize);
            setDeliveries(data.content);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load deliveries'));
        } finally {
            setIsLoading(false);
        }
    }, [webhookId, page, pageSize]);

    useEffect(() => {
        void loadDeliveries();
    }, [loadDeliveries]);

    return {
        deliveries,
        totalElements,
        page,
        isLoading,
        error,
        setPage,
        refresh: loadDeliveries,
    };
}
