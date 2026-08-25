// pages/FaceRegister.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function FaceRegister() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Loading face detection models...');
  const [error, setError] = useState('');
  const [capturing, setCapturing] = useState(false);
  const navigate = useNavigate();

  // Load AI models and start the camera when the page opens
  useEffect(() => {
    const loadModelsAndCamera = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setModelsLoaded(true);
        setStatus('Models loaded. Starting camera...');

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('Position your face in the frame and click "Capture Face".');
      } catch (err) {
        setError('Could not access camera or load models. Please allow camera permission and refresh.');
        console.error(err);
      }
    };

    loadModelsAndCamera();

    // Cleanup: stop the camera when leaving the page
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

      // descriptor is a Float32Array of 128 numbers — convert to a plain array for JSON
      const descriptorArray = Array.from(detection.descriptor);

      setStatus('Saving your face registration...');

      await api.post('/face/register', { descriptor: descriptorArray });

      setStatus('✅ Face registered successfully!');
      setTimeout(() => navigate('/'), 1500);

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
      </div>

      <div className="dash-content" style={{ textAlign: 'center' }}>
        <h2 className="form-title">Face Registration</h2>
        <p className="form-subtitle">{status}</p>

        {error && <div className="error-box" style={{ maxWidth: '400px', margin: '0 auto 20px' }}>{error}</div>}

        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          style={{ borderRadius: '12px', border: '2px solid var(--teal-500)', background: '#000' }}
        />

        <br />

        <button
          className="btn-primary"
          style={{ maxWidth: '250px', marginTop: '20px' }}
          onClick={handleCapture}
          disabled={!modelsLoaded || capturing}
        >
          {capturing ? 'Processing...' : 'Capture Face'}
        </button>
      </div>
    </div>
  );
}

export default FaceRegister;