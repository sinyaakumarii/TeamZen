// pages/CheckIn.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, LogIn, LogOut, CheckCircle2, AlertCircle,
  MapPin, Clock, ScanFace, Timer
} from 'lucide-react';

function CheckIn() {
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
  }, []);

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
    setError('');
    setResult(null);
    setProcessing(true);

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
      const response = await api.post('/attendance/check-in', {
        latitude,
        longitude,
        faceDescriptor
      });

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
    setCheckOutError('');
    setCheckOutResult(null);
    setCheckingOut(true);

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
        <div className="dash-wordmark">TeamZen</div>
        <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to Dashboard</Link>
      </div>

      <div className="dash-content" style={{ textAlign: 'center' }}>
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
            <div className="result-row"><span><Clock size={13} style={{ verticalAlign: '-2px' }} /> Status</span><span>{result.lateStatus.replace('_', ' ')} ({result.lateMinutes} min)</span></div>
            <div className="result-row"><span><MapPin size={13} style={{ verticalAlign: '-2px' }} /> Distance</span><span>{result.distanceMeters}m from office</span></div>
            <div className="result-row"><span><ScanFace size={13} style={{ verticalAlign: '-2px' }} /> Face match</span><span>{(1 - result.faceMatchDistance).toFixed(2)} confidence</span></div>
          </div>
        )}

        <div className="camera-wrap">
          <video ref={videoRef} autoPlay muted className="camera-video" />
          <div className="camera-guide" />
          {modelsLoaded && (
            <div className="camera-badge">
              <span className="pulse-dot" /> Live
            </div>
          )}
        </div>

        <div className="btn-row">
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

        {checkOutError && (
          <div className="error-box" style={{ maxWidth: '420px', margin: '20px auto 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {checkOutError}
          </div>
        )}

        {checkOutResult && (
          <div className="result-box warning" style={{ marginTop: '20px' }}>
            <div className="result-box-title" style={{ color: '#E65100' }}>
              <Timer size={18} /> Check-out confirmed
            </div>
            <div className="result-row"><span>Working hours</span><span>{checkOutResult.workingHours}h</span></div>
            <div className="result-row"><span>Overtime</span><span>{checkOutResult.overtimeHours}h</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;