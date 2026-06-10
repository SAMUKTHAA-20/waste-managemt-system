import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const DashboardAdmin = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [sweepers, setSweepers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    
    // Fetch analytics
    const { data: statsData } = await axios.get('http://localhost:5000/api/complaints/analytics', config);
    setStats(statsData);

    // Fetch sweepers
    const { data: sweepersData } = await axios.get('http://localhost:5000/api/complaints/sweepers', config);
    setSweepers(sweepersData);

    // Fetch complaints
    const { data: complaintsData } = await axios.get('http://localhost:5000/api/complaints', config);
    setComplaints(complaintsData);
  };

  const assignSweeper = async (complaintId, sweeperId) => {
    if (!sweeperId) return alert('Please select a sweeper from the dropdown first.');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}/assign`, { sweeperId }, config);
      alert('Sweeper assigned successfully');
      fetchData();
    } catch (err) {
      alert('Error assigning sweeper');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Admin Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '1rem' }}>{k.replace(/([A-Z])/g, ' $1')}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>All Complaints Map</h3>
          <div className="map-container" style={{ height: '500px' }}>
            <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {complaints.map(c => (
                <Marker key={c._id} position={[c.location.lat, c.location.lng]}>
                  <Popup>
                    <strong>Status:</strong> {c.status}<br/>
                    <strong>Desc:</strong> {c.description.substring(0, 30)}...
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Recent Reports</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {complaints.map(c => (
              <div key={c._id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <img src={`http://localhost:5000${c.image}`} alt="Waste" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{c.description}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status: <span style={{ color: c.status === 'Completed' ? 'var(--accent-color)' : 'var(--warning-color)', fontWeight: 600 }}>{c.status}</span></p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${c.location.lat},${c.location.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', display: 'block', margin: '0.5rem 0' }}>📍 View Exact Location on Google Maps</a>

                    {c.status === 'Completed' && c.afterImage && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong style={{ fontSize: '0.875rem' }}>Sweeper Proof:</strong>
                        <img src={`http://localhost:5000${c.afterImage}`} alt="Proof" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginTop: '0.25rem' }} />
                      </div>
                    )}
                    
                    {c.status === 'Pending' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <select className="form-input" style={{ padding: '0.25rem', fontSize: '0.875rem' }} id={`sweeper_${c._id}`}>
                          <option value="">Select Sweeper...</option>
                          {sweepers.length === 0 && <option disabled>No sweeper accounts exist!</option>}
                          {sweepers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => assignSweeper(c._id, document.getElementById(`sweeper_${c._id}`).value)}>
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
