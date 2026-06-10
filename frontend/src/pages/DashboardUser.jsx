import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Webcam from 'react-webcam';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet marker icon issue locally
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

const LocationMarker = ({ setPos }) => {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setPos(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const DashboardUser = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [desc, setDesc] = useState('');
  const [pos, setPos] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [imageMode, setImageMode] = useState('gallery');
  const [imagePreview, setImagePreview] = useState(null);
  const webcamRef = React.useRef(null);
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.get('http://localhost:5000/api/complaints', config);
    setComplaints(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pos) return alert('Select location on map');
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', desc);
    formData.append('lat', pos.lat);
    formData.append('lng', pos.lng);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/complaints', formData, config);
      alert('Report submitted successfully!');
      fetchComplaints();
      setDesc(''); setImage(null); setPos(null); setImagePreview(null);
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPos({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        alert('Unable to retrieve your location. Please check browser permissions.');
        setIsLocating(false);
      }
    );
  };

  const capture = React.useCallback((e) => {
    e.preventDefault();
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
        setImage(file);
      });
  }, [webcamRef]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Report an Issue</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Upload or Take Photo of Waste</label>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
              <label><input type="radio" checked={imageMode === 'gallery'} onChange={() => setImageMode('gallery')} /> Gallery Upload</label>
              <label><input type="radio" checked={imageMode === 'camera'} onChange={() => setImageMode('camera')} /> Laptop/Phone Camera</label>
            </div>
            
            {imageMode === 'camera' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!imagePreview ? (
                  <>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', borderRadius: '8px' }} />
                    <button type="button" onClick={capture} className="btn" style={{ backgroundColor: '#e2e8f0' }}>📸 Capture Photo</button>
                  </>
                ) : (
                  <>
                    <img src={imagePreview} alt="Captured" style={{ width: '100%', borderRadius: '8px' }} />
                    <button type="button" onClick={() => {setImagePreview(null); setImage(null)}} className="btn" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>Retake Photo</button>
                  </>
                )}
              </div>
            ) : (
              <input type="file" className="form-input" onChange={e => setImage(e.target.files[0])} required={imageMode === 'gallery'} accept="image/*" />
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={desc} onChange={e => setDesc(e.target.value)} rows="3" required placeholder="Describe the type of waste, severity, etc."></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Select Location on Map</label>
            <div className="map-container">
              <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker setPos={setPos} />
              </MapContainer>
            </div>
            <button type="button" onClick={handleGetLocation} className="btn" style={{ marginTop: '0.5rem', backgroundColor: '#e2e8f0', width: '100%' }}>
              {isLocating ? 'Locating...' : '📍 Use My Current Location'}
            </button>
            {pos && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--accent-color)', fontWeight: 600 }}>Location locked: {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</p>}
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>Submit Report</button>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>My Reports</h2>
        {complaints.length === 0 ? <p>No reports submitted yet.</p> : complaints.map(c => (
          <div key={c._id} className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Status: <span style={{ color: c.status === 'Completed' ? 'var(--accent-color)' : 'var(--warning-color)' }}>{c.status}</span></span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ marginTop: '0.5rem' }}>{c.description}</p>
            {c.status === 'Completed' && c.afterImage && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Cleaning Proof:</strong>
                <img src={`http://localhost:5000${c.afterImage}`} alt="Proof" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardUser;
