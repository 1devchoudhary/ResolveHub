import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { buttonStyles } from '../../components/ui/styles';
import { TicketList } from '../../components/tickets/TicketList';

export const MyTickets = () => (
  <>
    <PageHeader
      title="My tickets"
      description="Track the progress of every request you’ve raised."
      actions={
        <Link to="/app/tickets/new" className={buttonStyles()} id="btn-new-ticket">
          <Plus className="h-4 w-4" /> New ticket
        </Link>
      }
    />

    <TicketList
      basePath="/app/tickets"
      emptyAction={
        <Link to="/app/tickets/new" className={buttonStyles({ variant: 'secondary' })}>
          <Plus className="h-4 w-4" /> New ticket
        </Link>
      }
    />
  </>
);
