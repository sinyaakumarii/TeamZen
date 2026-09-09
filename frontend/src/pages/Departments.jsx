// frontend/src/pages/Departments.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, PlusCircle } from 'lucide-react';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ department_name: '', department_head: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', form);
      setMsg('Department added successfully!');
      setForm({ department_name: '', department_head: '' });
      fetchDepartments();
    } catch (err) {
      setMsg('Error adding department.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar"><h2>Department Management</h2></div>
      <div className="dash-content">
        
        {msg && <p style={{ color: 'green', fontWeight: 'bold' }}>{msg}</p>}

        <div className="action-card" style={{ marginBottom: '20px' }}>
          <h3><PlusCircle size={20} /> Add New Department</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <input type="text" placeholder="Department Name (e.g., HR, Finance)" value={form.department_name} required onChange={e => setForm({...form, department_name: e.target.value})} style={{padding: '10px', flex: 1}} />
            <input type="text" placeholder="Department Head Name" value={form.department_head} required onChange={e => setForm({...form, department_head: e.target.value})} style={{padding: '10px', flex: 1}} />
            <button type="submit" style={{ background: '#2980b9', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Save Department</button>
          </form>
        </div>

        <div className="action-card">
          <h3><Building2 size={20} /> Departments Overview</h3>
          <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#ecf0f1' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Department Name</th>
                <th style={{ padding: '12px' }}>Department Head</th>
                <th style={{ padding: '12px' }}>Live Employee Count</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{dept.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{dept.department_name}</td>
                  <td style={{ padding: '12px' }}>{dept.department_head}</td>
                  <td style={{ padding: '12px', color: '#27ae60', fontWeight: 'bold' }}>{dept.live_employee_count} Employees</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Departments;