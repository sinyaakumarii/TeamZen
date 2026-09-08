// frontend/src/pages/Payroll.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, PlusCircle } from 'lucide-react';

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '', salary_month: 'September', salary_year: 2026, allowances: 0, overtime_pay: 0, deductions: 0
  });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/all');
      setPayrolls(response.data.data);
    } catch (err) {
      console.error("Failed to fetch payrolls", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payroll/generate', formData);
      setMessage('Payroll generated successfully!');
      fetchPayrolls(); // Refresh table
    } catch (err) {
      setMessage('Error generating payroll.');
    }
    setLoading(false);
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar"><h2>Payroll Management</h2></div>
      <div className="dash-content">
        {message && <div className="result-box">{message}</div>}
        
        {/* Generate Payroll Form */}
        <div className="action-card" style={{ marginBottom: '20px' }}>
          <h3><PlusCircle size={20} /> Generate Salary</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <input type="number" placeholder="Employee ID" required onChange={e => setFormData({...formData, employee_id: e.target.value})} />
            <input type="text" placeholder="Month" defaultValue="September" required onChange={e => setFormData({...formData, salary_month: e.target.value})} />
            <input type="number" placeholder="Allowances (Rs)" onChange={e => setFormData({...formData, allowances: e.target.value})} />
            <input type="number" placeholder="Overtime (Rs)" onChange={e => setFormData({...formData, overtime_pay: e.target.value})} />
            <input type="number" placeholder="Deductions (Rs)" onChange={e => setFormData({...formData, deductions: e.target.value})} />
            <button type="submit" disabled={loading} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer' }}>Generate</button>
          </form>
        </div>

        {/* Payroll History Table */}
        <div className="action-card">
          <h3><DollarSign size={20} /> Salary Records</h3>
          <table style={{ width: '100%', textAlign: 'left', marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ecf0f1' }}>
                <th>Employee</th><th>Month</th><th>Basic</th><th>Tax</th><th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{p.first_name} {p.last_name}</td>
                  <td>{p.salary_month} {p.salary_year}</td>
                  <td>Rs {p.basic_salary}</td>
                  <td style={{ color: 'red' }}>Rs {p.tax}</td>
                  <td style={{ color: 'green', fontWeight: 'bold' }}>Rs {p.net_salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payroll;