import { Routes, Route, Navigate } from 'react-router-dom';
import { usePlatform } from './store/usePlatform';
import Login from './auth/Login';

// Layouts
import SuperadminLayout from './layouts/SuperadminLayout';
import DistributorLayout from './layouts/DistributorLayout';
import OwnerLayout from './layouts/OwnerLayout';
import RestaurantLayout from './layouts/RestaurantLayout';

// Superadmin pages
import SADashboard from './portals/superadmin/Dashboard';
import SADistributors from './portals/superadmin/Distributors';
import SAOwners from './portals/superadmin/Owners';
import SARestaurants from './portals/superadmin/Restaurants';
import SAPlans from './portals/superadmin/Plans';
import SAAnalytics from './portals/superadmin/Analytics';
import SATickets from './portals/superadmin/Tickets';
import SASettings from './portals/superadmin/SASettings';

// Distributor pages
import DistDashboard from './portals/distributor/Dashboard';
import DistOwners from './portals/distributor/Owners';
import DistRestaurants from './portals/distributor/DistRestaurants';
import DistCommission from './portals/distributor/Commission';
import DistReports from './portals/distributor/Reports';

// Owner pages
import OwnDashboard from './portals/owner/Dashboard';
import OwnRestaurants from './portals/owner/Restaurants';
import OwnAnalytics from './portals/owner/Analytics';
import OwnStaff from './portals/owner/Staff';
import OwnBilling from './portals/owner/Billing';
import OwnMenu from './portals/owner/MenuManagement';

// Restaurant pages
import RstDashboard from './portals/restaurant/Dashboard';
import RstPOS from './portals/restaurant/POS';
import RstTables from './portals/restaurant/Tables';
import RstKOT from './portals/restaurant/KOT';
import RstKDS from './portals/restaurant/KDS';
import RstMenu from './portals/restaurant/Menu';
import RstInventory from './portals/restaurant/Inventory';
import RstCustomers from './portals/restaurant/Customers';
import RstOrders from './portals/restaurant/Orders';
import RstReports from './portals/restaurant/Reports';
import RstStaff from './portals/restaurant/Staff';
import RstSettings from './portals/restaurant/RstSettings';

function RoleRouter() {
  const { currentUser } = usePlatform();
  if (!currentUser) return <Navigate to="/login" replace />;
  switch (currentUser.role) {
    case 'superadmin': return <Navigate to="/sa" replace />;
    case 'distributor': return <Navigate to="/dist" replace />;
    case 'owner': return <Navigate to="/own" replace />;
    case 'restaurant': return <Navigate to="/rst" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { currentUser } = usePlatform();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRouter />} />

      {/* Superadmin */}
      <Route path="/sa" element={<RequireAuth role="superadmin"><SuperadminLayout /></RequireAuth>}>
        <Route index element={<SADashboard />} />
        <Route path="distributors" element={<SADistributors />} />
        <Route path="owners" element={<SAOwners />} />
        <Route path="restaurants" element={<SARestaurants />} />
        <Route path="plans" element={<SAPlans />} />
        <Route path="analytics" element={<SAAnalytics />} />
        <Route path="tickets" element={<SATickets />} />
        <Route path="settings" element={<SASettings />} />
      </Route>

      {/* Distributor */}
      <Route path="/dist" element={<RequireAuth role="distributor"><DistributorLayout /></RequireAuth>}>
        <Route index element={<DistDashboard />} />
        <Route path="owners" element={<DistOwners />} />
        <Route path="owners/new" element={<DistOwners />} />
        <Route path="restaurants" element={<DistRestaurants />} />
        <Route path="commission" element={<DistCommission />} />
        <Route path="reports" element={<DistReports />} />
      </Route>

      {/* Owner */}
      <Route path="/own" element={<RequireAuth role="owner"><OwnerLayout /></RequireAuth>}>
        <Route index element={<OwnDashboard />} />
        <Route path="restaurants" element={<OwnRestaurants />} />
        <Route path="restaurants/new" element={<OwnRestaurants />} />
        <Route path="menu" element={<OwnMenu />} />
        <Route path="analytics" element={<OwnAnalytics />} />
        <Route path="staff" element={<OwnStaff />} />
        <Route path="billing" element={<OwnBilling />} />
      </Route>

      {/* Restaurant */}
      <Route path="/rst" element={<RequireAuth role="restaurant"><RestaurantLayout /></RequireAuth>}>
        <Route index element={<RstDashboard />} />
        <Route path="pos" element={<RstPOS />} />
        <Route path="tables" element={<RstTables />} />
        <Route path="kot" element={<RstKOT />} />
        <Route path="kds" element={<RstKDS />} />
        <Route path="menu" element={<RstMenu />} />
        <Route path="inventory" element={<RstInventory />} />
        <Route path="customers" element={<RstCustomers />} />
        <Route path="orders" element={<RstOrders />} />
        <Route path="reports" element={<RstReports />} />
        <Route path="staff" element={<RstStaff />} />
        <Route path="settings" element={<RstSettings />} />
      </Route>
    </Routes>
  );
}
