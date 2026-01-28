import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {InvoicesPage} from '@/pages';

export const Route = createFileRoute('/_authenticated/financial/invoices/')({
  component: InvoicesRoute,
});

function InvoicesRoute() {
  const navigate = useNavigate();

  const handleViewInvoice = (invoiceId: string) => {
    navigate({to: '/financial/invoices/$invoiceId', params: {invoiceId}});
  };

  return <InvoicesPage onViewInvoice={handleViewInvoice} />;
}
