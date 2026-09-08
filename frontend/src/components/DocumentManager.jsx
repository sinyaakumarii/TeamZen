// frontend/src/components/DocumentManager.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

function DocumentManager({ employeeId }) {
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ document_type: 'CNIC', file_url: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (employeeId) fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/${employeeId}`);
      setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', { employee_id: employeeId, ...formData });
      setMessage('Document added!');
      setFormData({ document_type: 'CNIC', file_url: '' });
      fetchDocuments();
    } catch (err) {
      setMessage('Error adding document.');
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '8px' }}>
      <h4>Employee Documents</h4>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={formData.document_type} onChange={e => setFormData({...formData, document_type: e.target.value})}>
          <option value="CNIC">CNIC</option>
          <option value="Resume">Resume</option>
          <option value="Contract">Contract</option>
        </select>
        <input type="text" placeholder="File URL (e.g., Google Drive link)" required value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} />
        <button type="submit" style={{ background: '#3498db', color: '#fff', border: 'none', padding: '5px 10px' }}>Add</button>
      </form>

      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            <strong>{doc.document_type}:</strong> <a href={doc.file_url} target="_blank" rel="noreferrer">View File</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DocumentManager;