import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {BudgetsPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/budgets/')({
  component: BudgetsRoute,
});

function BudgetsRoute() {
  const navigate = useNavigate();

  const handleViewBudget = (budgetId: string) => {
    navigate({to: '/financial/budgets/$budgetId', params: {budgetId}});
  };

  return <BudgetsPage onViewBudget={handleViewBudget} />;
}
