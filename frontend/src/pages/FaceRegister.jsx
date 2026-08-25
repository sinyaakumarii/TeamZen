// pages/FaceRegister.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Fingerprint, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

function FaceRegister() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Loading face detection models...');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModelsAndCamera = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setModelsLoaded(true);
        setStatus('Starting camera...');

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('Center your face inside the frame, then capture.');
      } catch (err) {
        setError('Could not access camera or load models. Please allow camera permission and refresh.');
        console.error(err);
      }
    };

    loadModelsAndCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    setError('');
    setCapturing(true);
    setStatus('Detecting face...');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please make sure your face is clearly visible and try again.');
        setCapturing(false);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);
      setStatus('Saving your face registration...');

      await api.post('/face/register', { descriptor: descriptorArray });

      setSuccess(true);
      setStatus('Face registered successfully!');
      setTimeout(() => navigate('/'), 1600);

    } catch (err) {
      const message = err.response?.data?.message || 'Face registration failed. Please try again.';
      setError(message);
      setCapturing(false);
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <div className="dash-wordmark">TeamZen</div>
        <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to Dashboard</Link>
      </div>

      <div className="dash-content" style={{ textAlign: 'center' }}>
        <div className="icon-circle amber" style={{ margin: '0 auto 14px' }}>
          <Fingerprint size={20} />
        </div>
        <h2 className="form-title">Face Registration</h2>
        <p className="form-subtitle">{status}</p>

        {error && (
          <div className="error-box" style={{ maxWidth: '400px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="result-box success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#2E7D32" />
            <span style={{ fontWeight: 600 }}>Registered! Redirecting to your dashboard…</span>
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
            style={{ maxWidth: '220px' }}
            onClick={handleCapture}
            disabled={!modelsLoaded || capturing || success}
          >
            <Fingerprint size={16} />
            {capturing ? 'Processing...' : 'Capture Face'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FaceRegister;