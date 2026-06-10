import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Webcam from 'react-webcam';

const DashboardSweeper = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [proofs, setProofs] = useState({});
  const [cameraOpenFor, setCameraOpenFor] = useState(null);
  const [previews, setPreviews] = useState({});
  const webcamRef = React.useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.get('http://localhost:5000/api/complaints', config);
    setTasks(data);
  };

  const handleComplete = async (taskId) => {
    const proofFile = proofs[taskId];
    if (!proofFile) return alert('Please provide a proof image first (Upload or Capture)');

    const formData = new FormData();
    formData.append('afterImage', proofFile);
    formData.append('status', 'Completed');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/complaints/${taskId}/status`, formData, config);
      alert('Task marked as completed!');
      setProofs(prev => ({ ...prev, [taskId]: null }));
      setPreviews(prev => ({ ...prev, [taskId]: null }));
      setCameraOpenFor(null);
      fetchTasks();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const capture = (taskId) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreviews(prev => ({ ...prev, [taskId]: imageSrc }));
    
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `proof-${taskId}.jpg`, { type: "image/jpeg" });
        setProofs(prev => ({ ...prev, [taskId]: file }));
      });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>My Assignments</h2>
      
      {tasks.length === 0 ? <p>No tasks assigned yet.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {tasks.map(t => (
            <div key={t._id} className="card">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                 <img src={`http://localhost:5000${t.image}`} alt="Task" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                 <div>
                   <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>{t.priority} Priority</h4>
                   <p style={{ fontSize: '0.875rem' }}>{t.description}</p>
                 </div>
              </div>

              <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: '8px', marginBottom: '1rem' }}>
                 <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Location:</p>
                 <a href={`https://www.google.com/maps/search/?api=1&query=${t.location.lat},${t.location.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem' }}>
                    View on Map (Lat: {t.location.lat.toFixed(3)}, Lng: {t.location.lng.toFixed(3)})
                 </a>
              </div>

              {t.status !== 'Completed' ? (
                <div>
                  <label className="form-label">Proof of Cleanup</label>
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <label><input type="radio" checked={cameraOpenFor !== t._id} onChange={() => setCameraOpenFor(null)} /> Gallery</label>
                    <label><input type="radio" checked={cameraOpenFor === t._id} onChange={() => setCameraOpenFor(t._id)} /> Camera</label>
                  </div>
                  
                  {cameraOpenFor === t._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {!previews[t._id] ? (
                        <>
                          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', borderRadius: '8px' }} />
                          <button className="btn" style={{ backgroundColor: '#e2e8f0' }} onClick={() => capture(t._id)}>📸 Capture Proof</button>
                        </>
                      ) : (
                        <>
                          <img src={previews[t._id]} alt="Captured" style={{ width: '100%', borderRadius: '8px' }} />
                          <button className="btn" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }} onClick={() => {
                            setPreviews(prev => ({...prev, [t._id]: null}));
                            setProofs(prev => ({...prev, [t._id]: null}));
                          }}>Retake</button>
                        </>
                      )}
                    </div>
                  ) : (
                    <input type="file" className="form-input" style={{ marginBottom: '1rem' }} onChange={e => setProofs(prev => ({ ...prev, [t._id]: e.target.files[0] }))} accept="image/*" />
                  )}
                  
                  <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => handleComplete(t._id)}>
                    Mark as Completed
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', backgroundColor: '#d1fae5', padding: '0.5rem', borderRadius: '8px', color: '#065f46', fontWeight: 600 }}>
                  Task Completed ✅
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSweeper;
