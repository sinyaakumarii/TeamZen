// frontend/src/pages/Employees.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserPlus } from 'lucide-react';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    user_id: '', cnic: '', department: '', designation: '', organization: '',
    joining_date: '', employment_status: 'Active', salary: '', bank_name_iban: '',
    skills: '', emergency_contact: '', date_of_birth: '', gender: 'Male', 
    contact_number: '', address: '', experience: '', certifications: ''
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', form);
      setMsg('Employee added successfully!');
      fetchEmployees();
    } catch (err) {
      setMsg('Error adding employee record.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar"><h2>Employee Management & Records</h2></div>
      <div className="dash-content">
        
        {msg && <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '15px' }}>{msg}</p>}

        {/* Add Employee Form */}
        <div className="action-card" style={{ marginBottom: '20px' }}>
          <h3><UserPlus size={20} /> Register New Employee Record</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '15px' }}>
            <input type="number" placeholder="User ID (Login ID)" required onChange={e => setForm({...form, user_id: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="CNIC (e.g., 35202-...)" required onChange={e => setForm({...form, cnic: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Department" required onChange={e => setForm({...form, department: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Designation" required onChange={e => setForm({...form, designation: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Organization" required onChange={e => setForm({...form, organization: e.target.value})} style={{padding: '8px'}} />
            <input type="date" placeholder="Joining Date" required onChange={e => setForm({...form, joining_date: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Employment Status" onChange={e => setForm({...form, employment_status: e.target.value})} style={{padding: '8px'}} />
            <input type="number" placeholder="Basic Salary (PKR)" required onChange={e => setForm({...form, salary: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Bank Name & IBAN" onChange={e => setForm({...form, bank_name_iban: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Skills & Qualifications" onChange={e => setForm({...form, skills: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Emergency Contact" onChange={e => setForm({...form, emergency_contact: e.target.value})} style={{padding: '8px'}} />
            <input type="date" placeholder="Date of Birth" onChange={e => setForm({...form, date_of_birth: e.target.value})} style={{padding: '8px'}} />
            <select onChange={e => setForm({...form, gender: e.target.value})} style={{padding: '8px'}}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input type="text" placeholder="Contact Number" onChange={e => setForm({...form, contact_number: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Address" onChange={e => setForm({...form, address: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Experience" onChange={e => setForm({...form, experience: e.target.value})} style={{padding: '8px'}} />
            <input type="text" placeholder="Certifications" onChange={e => setForm({...form, certifications: e.target.value})} style={{padding: '8px'}} />
            <div style={{ gridColumn: 'span 3', marginTop: '10px' }}>
              <button type="submit" style={{ background: '#2980b9', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Save Employee Record</button>
            </div>
          </form>
        </div>

        {/* Employee Directory Table */}
        <div className="action-card">
          <h3><Users size={20} /> Employee Directory</h3>
          <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#ecf0f1' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Designation</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{emp.id}</td>
                  <td style={{ padding: '10px' }}>{emp.first_name} {emp.last_name}</td>
                  <td style={{ padding: '10px' }}>{emp.department}</td>
                  <td style={{ padding: '10px' }}>{emp.designation}</td>
                  <td style={{ padding: '10px' }}>{emp.employment_status}</td>
                  <td style={{ padding: '10px' }}>Rs {emp.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Employees;