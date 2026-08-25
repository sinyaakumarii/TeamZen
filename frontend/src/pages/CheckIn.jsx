// pages/CheckIn.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';

function CheckIn() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

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
        setStatus('Position your face in the frame and click "Check In".');
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
      // Step 1: Get face descriptor
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

      // Step 2: Get GPS location
      setStatus('Getting your location...');
      const { latitude, longitude } = await getLocation();

      // Step 3: Send to backend
      setStatus('Verifying and checking in...');
      const response = await api.post('/attendance/check-in', {
        latitude,
        longitude,
        faceDescriptor
      });

      setResult(response.data.data);
      setStatus('✅ Checked in successfully!');

    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Check-in failed. Please try again.';
      setError(message);
      setStatus('Position your face in the frame and click "Check In".');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <div className="dash-wordmark">TeamZen</div>
      </div>

      <div className="dash-content" style={{ textAlign: 'center' }}>
        <h2 className="form-title">Mark Attendance</h2>
        <p className="form-subtitle">{status}</p>

        {error && <div className="error-box" style={{ maxWidth: '420px', margin: '0 auto 20px' }}>{error}</div>}

        {result && (
          <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '16px', borderRadius: '10px', maxWidth: '420px', margin: '0 auto 20px', textAlign: 'left' }}>
            <strong>Check-in confirmed!</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
              Status: {result.lateStatus} ({result.lateMinutes} min)<br />
              Distance from office: {result.distanceMeters}m<br />
              Face match confidence: {(1 - result.faceMatchDistance).toFixed(2)}
            </p>
          </div>
        )}

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
          onClick={handleCheckIn}
          disabled={!modelsLoaded || processing}
        >
          {processing ? 'Processing...' : 'Check In'}
        </button>
      </div>
    </div>
  );
}

export default CheckIn;