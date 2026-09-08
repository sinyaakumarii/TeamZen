// frontend/src/pages/Payroll.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, PlusCircle, Download } from 'lucide-react';

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

  // --- NAYA FUNCTION: EXPORT TO EXCEL (CSV) ---
  const exportToCSV = () => {
    if (payrolls.length === 0) {
      alert("No data to export!");
      return;
    }
    
    const headers = ['Employee,Month,Basic Salary,Tax,Net Salary'];
    const rows = payrolls.map(p => 
      `"${p.first_name} ${p.last_name}","${p.salary_month} ${p.salary_year}",${p.basic_salary},${p.tax},${p.net_salary}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TeamZen_Payroll_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Payroll Management</h2>
        {/* NAYA BUTTON */}
        <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Download size={18} /> Export to Excel
        </button>
      </div>
      
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
            <button type="submit" disabled={loading} style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>Generate</button>
          </form>
        </div>

        {/* Payroll History Table */}
        <div className="action-card">
          <h3><DollarSign size={20} /> Salary Records</h3>
          <table style={{ width: '100%', textAlign: 'left', marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ecf0f1' }}>
                <th style={{ padding: '10px' }}>Employee</th>
                <th style={{ padding: '10px' }}>Month</th>
                <th style={{ padding: '10px' }}>Basic</th>
                <th style={{ padding: '10px' }}>Tax</th>
                <th style={{ padding: '10px' }}>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{p.first_name} {p.last_name}</td>
                  <td style={{ padding: '10px' }}>{p.salary_month} {p.salary_year}</td>
                  <td style={{ padding: '10px' }}>Rs {p.basic_salary}</td>
                  <td style={{ padding: '10px', color: 'red' }}>Rs {p.tax}</td>
                  <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>Rs {p.net_salary}</td>
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