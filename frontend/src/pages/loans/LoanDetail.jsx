import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, Calculator } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Loans.css';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [emi, setEmi] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lRes, eRes, pRes] = await Promise.all([
          api.get(`/loans/${id}`),
          api.get(`/loans/${id}/emi`).catch(() => ({ data: {} })),
          api.get(`/loans/${id}/payments`).catch(() => ({ data: [] })),
        ]);
        setLoan(lRes.data);
        setEmi(eRes.data?.emi);
        setPayments(pRes.data);
      } catch { navigate('/loans'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const paymentCols = [
    { key: 'emi_id', label: 'ID', width: '60px' },
    { key: 'emi_amount', label: 'EMI Amount', render: (r) => formatCurrency(r.emi_amount) },
    { key: 'due_date', label: 'Due Date', render: (r) => formatDate(r.due_date) },
    { key: 'paid_date', label: 'Paid Date', render: (r) => formatDate(r.paid_date) },
    { key: 'payment_status', label: 'Status', render: (r) => <StatusBadge status={r.payment_status} /> },
    { key: 'penalty_amount', label: 'Penalty', render: (r) => r.penalty_amount ? formatCurrency(r.penalty_amount) : '—' },
  ];

  if (loading || !loan) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Landmark size={24} /> Loan #{loan.loan_id}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/loans')}><ArrowLeft size={16} /> Back</button>
      </div>

      <div className="loan-detail-grid">
        <div className="detail-card glass-card">
          <div className="detail-grid">
            <div className="detail-item"><div><span className="detail-label">Type</span><span className="detail-value" style={{textTransform:'capitalize'}}>{loan.loan_type}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Amount</span><span className="detail-value">{formatCurrency(loan.loan_amount)}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Interest Rate</span><span className="detail-value">{loan.interest_rate}%</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Tenure</span><span className="detail-value">{loan.tenure_months} months</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Start Date</span><span className="detail-value">{formatDate(loan.start_date)}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Status</span><StatusBadge status={loan.status} /></div></div>
          </div>
        </div>

        {emi && (
          <div className="emi-card glass-card">
            <Calculator size={24} color="var(--accent)" />
            <span className="emi-label">Calculated Monthly EMI</span>
            <span className="emi-amount">{formatCurrency(emi)}</span>
          </div>
        )}
      </div>

      <div className="dashboard-section" style={{ marginTop: 24 }}>
        <h3>EMI Payments</h3>
        <DataTable columns={paymentCols} data={payments} emptyMessage="No EMI payments recorded." />
      </div>
    </div>
  );
}
