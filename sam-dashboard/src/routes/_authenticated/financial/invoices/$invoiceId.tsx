import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {InvoiceDetailPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/invoices/$invoiceId')({
  component: InvoiceDetailRoute,
});

function InvoiceDetailRoute() {
  const {invoiceId} = Route.useParams();
  const navigate = useNavigate();

  return (
    <InvoiceDetailPage
      invoiceId={invoiceId}
      onBack={() => navigate({to: '/financial/invoices'})}
    />
  );
}
