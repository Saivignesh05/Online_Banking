import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ApplyPage from './pages/auth/ApplyPage';

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';

// Branches
import BranchList from './pages/branches/BranchList';
import BranchForm from './pages/branches/BranchForm';
import BranchDetail from './pages/branches/BranchDetail';

// Managers
import ManagerList from './pages/managers/ManagerList';
import ManagerForm from './pages/managers/ManagerForm';

// Employees
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';

// Customers
import CustomerList from './pages/customers/CustomerList';
import CustomerProfile from './pages/customers/CustomerProfile';

// Accounts
import AccountList from './pages/accounts/AccountList';
import AccountForm from './pages/accounts/AccountForm';
import AccountDetail from './pages/accounts/AccountDetail';

// Beneficiaries
import BeneficiaryList from './pages/beneficiaries/BeneficiaryList';
import BeneficiaryForm from './pages/beneficiaries/BeneficiaryForm';

// Transactions
import TransactionList from './pages/transactions/TransactionList';
import TransferForm from './pages/transactions/TransferForm';
import CreditForm from './pages/transactions/CreditForm';
import DebitForm from './pages/transactions/DebitForm';

// Loans
import LoanList from './pages/loans/LoanList';
import LoanApplyForm from './pages/loans/LoanApplyForm';
import LoanDetail from './pages/loans/LoanDetail';

// Applications
import ApplicationList from './pages/applications/ApplicationList';

// Logs
import LoginLogs from './pages/logs/LoginLogs';
import AuditLogs from './pages/logs/AuditLogs';

// ── Role-based dashboard redirect ──────────────────────────────
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role_id) {
    case 1: return <AdminDashboard />;
    case 2: return <ManagerDashboard />;
    case 3: return <EmployeeDashboard />;
    case 4: return <CustomerDashboard />;
    default: return <CustomerDashboard />;
  }
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply" element={<ApplyPage />} />

      {/* ── Protected (Dashboard Layout) ─────────────────────── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Branches — role ≤ 1 for CUD, ≤ 2 for view */}
        <Route path="/branches" element={<ProtectedRoute maxRole={1}><BranchList /></ProtectedRoute>} />
        <Route path="/branches/new" element={<ProtectedRoute maxRole={1}><BranchForm /></ProtectedRoute>} />
        <Route path="/branches/:id" element={<ProtectedRoute maxRole={2}><BranchDetail /></ProtectedRoute>} />
        <Route path="/branches/:id/edit" element={<ProtectedRoute maxRole={1}><BranchForm /></ProtectedRoute>} />

        {/* Managers — role ≤ 1 */}
        <Route path="/managers" element={<ProtectedRoute maxRole={1}><ManagerList /></ProtectedRoute>} />
        <Route path="/managers/new" element={<ProtectedRoute maxRole={1}><ManagerForm /></ProtectedRoute>} />

        {/* Employees — role ≤ 2 */}
        <Route path="/employees" element={<ProtectedRoute maxRole={2}><EmployeeList /></ProtectedRoute>} />
        <Route path="/employees/new" element={<ProtectedRoute maxRole={2}><EmployeeForm /></ProtectedRoute>} />
        <Route path="/employees/:id/edit" element={<ProtectedRoute maxRole={2}><EmployeeForm /></ProtectedRoute>} />

        {/* Customers — role ≤ 3 for list, 4 for own profile */}
        <Route path="/customers" element={<ProtectedRoute maxRole={3}><CustomerList /></ProtectedRoute>} />
        <Route path="/customers/profile" element={<ProtectedRoute exactRoles={[4]}><CustomerProfile /></ProtectedRoute>} />

        {/* Accounts — all roles can view, ≤ 3 can create */}
        <Route path="/accounts" element={<AccountList />} />
        <Route path="/accounts/new" element={<ProtectedRoute maxRole={3}><AccountForm /></ProtectedRoute>} />
        <Route path="/accounts/:id" element={<AccountDetail />} />

        {/* Beneficiaries — role 4 only */}
        <Route path="/beneficiaries" element={<ProtectedRoute exactRoles={[4]}><BeneficiaryList /></ProtectedRoute>} />
        <Route path="/beneficiaries/new" element={<ProtectedRoute exactRoles={[4]}><BeneficiaryForm /></ProtectedRoute>} />

        {/* Transactions */}
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/transfer" element={<ProtectedRoute exactRoles={[4]}><TransferForm /></ProtectedRoute>} />
        <Route path="/transactions/credit" element={<ProtectedRoute maxRole={3}><CreditForm /></ProtectedRoute>} />
        <Route path="/transactions/debit" element={<ProtectedRoute exactRoles={[4]}><DebitForm /></ProtectedRoute>} />

        {/* Loans */}
        <Route path="/loans" element={<LoanList />} />
        <Route path="/loans/apply" element={<ProtectedRoute exactRoles={[4]}><LoanApplyForm /></ProtectedRoute>} />
        <Route path="/loans/:id" element={<LoanDetail />} />

        {/* Applications */}
        <Route path="/applications" element={<ProtectedRoute maxRole={3}><ApplicationList /></ProtectedRoute>} />

        {/* Logs */}
        <Route path="/logs/login" element={<ProtectedRoute maxRole={2}><LoginLogs /></ProtectedRoute>} />
        <Route path="/logs/audit" element={<ProtectedRoute maxRole={1}><AuditLogs /></ProtectedRoute>} />
      </Route>

      {/* ── Catch-all ───────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
