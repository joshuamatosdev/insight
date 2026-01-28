import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {BudgetDetailPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/budgets/$budgetId')({
    component: BudgetDetailRoute,
});

function BudgetDetailRoute() {
    const {budgetId} = Route.useParams();
    const navigate = useNavigate();

    return (
        <BudgetDetailPage
            budgetId={budgetId}
            onBack={() => navigate({to: '/financial/budgets'})}
        />
    );
}
