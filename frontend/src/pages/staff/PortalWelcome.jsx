import { Construction } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/authContext';

// Temporary landing page for the staff portals while their screens are being built
export const PortalWelcome = () => {
  const { user } = useAuth();
  return (
    <EmptyState
      icon={Construction}
      title={`Welcome, ${user.name.split(' ')[0]}`}
      description="Your workspace is being set up. Check back shortly."
    />
  );
};
