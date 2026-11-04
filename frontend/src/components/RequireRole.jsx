import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { homeFor, loginFor } from '../utilities/portals';
import { FullPageSpinner } from './ui/Spinner';

// Route guard for a whole portal:  <Route element={<RequireRole role="agent" />}>…</Route>
// - still checking the session -> spinner (no flash of the login page on reload)
// - signed out                 -> that portal's login, remembering where they were going
// - signed in as another role  -> their own portal
export const RequireRole = ({ role }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;

  if (status === 'anonymous') {
    return <Navigate to={loginFor(role)} replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;

  return <Outlet />;
};
