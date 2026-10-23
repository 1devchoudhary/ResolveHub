import {
  CircleDot,
  Hourglass,
  Timer,
  CircleCheckBig,
  Archive,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Flame,
} from 'lucide-react';

// One place that decides how every status / priority looks.
// Keys match the backend enums in backend/models/Ticket.js.

export const STATUS_META = {
  open: { label: 'Open', tone: 'info', dot: 'bg-status-info', icon: CircleDot },
  pending: { label: 'Awaiting reply', tone: 'warning', dot: 'bg-status-warning', icon: Hourglass },
  'in-progress': { label: 'In progress', tone: 'brand', dot: 'bg-brand-500', icon: Timer },
  resolved: { label: 'Resolved', tone: 'success', dot: 'bg-status-success', icon: CircleCheckBig },
  closed: { label: 'Closed', tone: 'neutral', dot: 'bg-status-neutral', icon: Archive },
};

export const PRIORITY_META = {
  low: { label: 'Low', color: 'text-text-tertiary', icon: SignalLow },
  medium: { label: 'Medium', color: 'text-status-info', icon: SignalMedium },
  high: { label: 'High', color: 'text-status-warning', icon: SignalHigh },
  urgent: { label: 'Urgent', color: 'text-status-danger', icon: Flame },
};

export const STATUS_ORDER = ['open', 'in-progress', 'pending', 'resolved', 'closed'];
export const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent'];
