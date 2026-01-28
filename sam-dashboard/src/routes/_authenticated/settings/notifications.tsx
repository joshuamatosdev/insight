import {createFileRoute} from '@tanstack/react-router';
import {NotificationPreferencesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/settings/notifications')({
    component: () => <NotificationPreferencesPage/>,
});
