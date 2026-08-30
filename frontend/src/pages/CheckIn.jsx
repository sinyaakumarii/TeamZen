// frontend/src/pages/CheckIn.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, LogIn, LogOut, CheckCircle2, AlertCircle,
  MapPin, Clock, ScanFace, Timer
} from 'lucide-react';

function CheckIn() {
  const { user } = useAuth();
  
  // Shared & Admin States
  const [allAttendance, setAllAttendance] = useState([]);
  
  // Employee Camera States
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [checkOutResult, setCheckOutResult] = useState(null);
  const [checkOutError, setCheckOutError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    // ADMIN: Fetch table data
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      const fetchAllAttendance = async () => {
        try {
          const response = await api.get('/attendance/all');
          setAllAttendance(response.data.data);
        } catch (err) {
          console.error("Failed to load attendance records", err);
          setError("Failed to load attendance records.");
        }
      };
      fetchAllAttendance();
      return; 
    }

    // EMPLOYEE: Load camera and AI models
    const setup = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('Center your face in the frame, then check in.');
      } catch (err) {
        setError('Could not access camera or load models. Please allow camera permission and refresh.');
        console.error(err);
      }
    };

    setup();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [user]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => reject(new Error('Location access denied. Please enable location to check in.')),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleCheckIn = async () => {
    setError(''); setResult(null); setProcessing(true);
    try {
      setStatus('Detecting face...');
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please make sure your face is clearly visible and try again.');
        setProcessing(false);
        return;
      }

      const faceDescriptor = Array.from(detection.descriptor);
      setStatus('Getting your location...');
      const { latitude, longitude } = await getLocation();

      setStatus('Verifying and checking in...');
      const response = await api.post('/attendance/check-in', { latitude, longitude, faceDescriptor });
      setResult(response.data.data);
      setStatus('Checked in successfully!');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Check-in failed. Please try again.';
      setError(message);
      setStatus('Center your face in the frame, then check in.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutError(''); setCheckOutResult(null); setCheckingOut(true);
    try {
      const response = await api.post('/attendance/check-out');
      setCheckOutResult(response.data.data);
    } catch (err) {
      const message = err.response?.data?.message || 'Check-out failed. Please try again.';
      setCheckOutError(message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Attendance Management</h2>
      </div>

      <div className="dash-content">
        {/* ============================== */}
        {/* ADMIN VIEW: Attendance Table   */}
        {/* ============================== */}
        {(user?.role === 'admin' || user?.role === 'super_admin') ? (
          <div className="action-card">
            <h3>Company Attendance Records</h3>
            {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
            
            {allAttendance.length === 0 ? (
              <p>No attendance records found for today.</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                    <th style={{ padding: '12px' }}>Employee</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Check In</th>
                    <th style={{ padding: '12px' }}>Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {allAttendance.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{record.employee_email}</td>
                      <td style={{ padding: '12px' }}>{new Date(record.check_in_time).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', color: '#2ecc71' }}>
                        {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px', color: record.check_out_time ? '#e74c3c' : '#7f8c8d' }}>
                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* ============================== */
          /* EMPLOYEE VIEW: Face Camera     */
          /* ============================== */
          <div style={{ textAlign: 'center' }}>
            <div className="icon-circle teal" style={{ margin: '0 auto 14px' }}>
              <ScanFace size={20} />
            </div>
            <h2 className="form-title">Mark Attendance</h2>
            <p className="form-subtitle">{status}</p>

            {error && (
              <div className="error-box" style={{ maxWidth: '420px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {result && (
              <div className="result-box success">
                <div className="result-box-title">
                  <CheckCircle2 size={18} color="#2E7D32" /> Check-in confirmed
                </div>
                <div className="result-row"><span><Clock size={13} style={{ verticalAlign: '-2px' }} /> Status</span><span>{result.lateStatus?.replace('_', ' ')} ({result.lateMinutes} min)</span></div>
              </div>
            )}

            <div className="camera-wrap" style={{ margin: '0 auto' }}>
              <video ref={videoRef} autoPlay muted className="camera-video" />
              <div className="camera-guide" />
              {modelsLoaded && (
                <div className="camera-badge">
                  <span className="pulse-dot" /> Live
                </div>
              )}
            </div>

            <div className="btn-row" style={{ justifyContent: 'center', marginTop: '20px' }}>
              <button
                className="btn-primary btn-with-icon"
                style={{ maxWidth: '180px' }}
                onClick={handleCheckIn}
                disabled={!modelsLoaded || processing}
              >
                <LogIn size={16} /> {processing ? 'Processing...' : 'Check In'}
              </button>

              <button
                className="btn-secondary"
                style={{ maxWidth: '180px' }}
                onClick={handleCheckOut}
                disabled={checkingOut}
              >
                <LogOut size={16} /> {checkingOut ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;