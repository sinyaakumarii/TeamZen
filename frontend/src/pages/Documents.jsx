// frontend/src/pages/Documents.jsx
import { useState } from 'react';
import DocumentManager from '../components/DocumentManager';
import { FileText } from 'lucide-react';

function Documents() {
  const [empId, setEmpId] = useState(1);

  return (
    <div className="dash-shell">
      <div className="dash-topbar"><h2>Employee Documents</h2></div>
      <div className="dash-content">
        <div className="action-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <FileText size={24} color="#e67e22" />
            <h3>Secure Document Vault</h3>
          </div>
          <p>Enter Employee ID to view or upload documents (CNIC, Resume, etc.):</p>
          <input 
            type="number" 
            value={empId} 
            onChange={(e) => setEmpId(e.target.value)} 
            style={{ padding: '8px', marginBottom: '15px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {/* Yeh wo component hai jo humne pehle banaya tha */}
          {empId && <DocumentManager employeeId={empId} />}
        </div>
      </div>
    </div>
  );
}

export default Documents;