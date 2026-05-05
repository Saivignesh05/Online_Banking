import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Accounts.css';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [aRes, bRes] = await Promise.all([
        api.get(`/accounts/${id}`),
        api.get(`/accounts/${id}/balance`),
      ]);
      setAccount(aRes.data);
      setBalance(bRes.data.balance);
    } catch { navigate('/accounts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading || !account) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Wallet size={24} /> Account #{account.account_number}</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/accounts')}><ArrowLeft size={16} /> Back</button>
          <button className="btn btn-ghost" onClick={fetchData}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="account-detail-grid">
        <div className="balance-card glass-card">
          <span className="balance-label">Current Balance</span>
          <span className="balance-amount">{formatCurrency(balance)}</span>
          <StatusBadge status={account.status} />
        </div>

        <div className="detail-card glass-card">
          <div className="detail-grid">
            <div className="detail-item"><div><span className="detail-label">Account Type</span><span className="detail-value" style={{textTransform:'capitalize'}}>{account.account_type}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Opened Date</span><span className="detail-value">{formatDate(account.opened_date)}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Daily Limit</span><span className="detail-value">{formatCurrency(account.daily_limit)}</span></div></div>
            <div className="detail-item"><div><span className="detail-label">Min Balance</span><span className="detail-value">{formatCurrency(account.min_balance)}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
