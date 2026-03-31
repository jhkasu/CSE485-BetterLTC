import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './MissionPage.css';

function MissionPage() {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetch('http://localhost:3001/mission')
      .then((res) => res.json())
      .then((data) => {
        setMission(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    setEditData({ ...mission });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:3001/mission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const updated = await res.json();
      setMission(updated);
      setEditMode(false);
      setEditData(null);
    } catch (e) {
      alert('Failed to save. Is the server running?');
    }
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div><Navbar /><div className="mission-page"><p>Loading...</p></div><Footer /></div>;
  if (!mission) return <div><Navbar /><div className="mission-page"><p>Failed to load content.</p></div><Footer /></div>;

  return (
    <div>
      <Navbar />

      <div className="mission-banner">
        <img src="/missionVision.png" alt="Mission & Vision" />
        <div className="mission-banner-overlay">
          <h1 className="mission-banner-title">Mission &amp; Vision</h1>
        </div>
      </div>

      <div className="mission-page">

        {isAdmin && !editMode && (
          <div className="mission-admin-bar">
            <button className="mission-edit-btn" onClick={handleEdit}>Edit Page</button>
          </div>
        )}

        {editMode && (
          <div className="mission-admin-bar">
            <button className="mission-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="mission-cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        )}

        <div style={{ width: '100%', marginBottom: '30px' }}>
          <img src="/care1.png" alt="Care" style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '500px' }} />
        </div>

        <section className="mission-section" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h2 className="mission-section-title">Our <span className="mission-script">Mission</span></h2>
          {editMode ? (
            <>
              <textarea
                className="mission-edit-textarea mission-edit-tagline"
                value={editData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}
              />
              <textarea
                className="mission-edit-textarea mission-edit-body"
                value={editData.body}
                onChange={(e) => handleChange('body', e.target.value)}
                style={{ textAlign: 'left', width: '100%', minHeight: '150px' }}
              />
            </>
          ) : (
            <>
              <p className="mission-tagline" style={{ marginBottom: '25px', fontWeight: 'bold' }}>{mission.headline}</p>
              {mission.body.split('\n\n').map((para, i) => (
                <p key={i} className="mission-body" style={{ marginBottom: '15px' }}>{para}</p>
              ))}
            </>
          )}
        </section>

        <div className="mission-color-rule">
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
        </div>

        <div style={{ width: '100%', marginTop: '50px', marginBottom: '30px' }}>
          <img src="/care2.png" alt="Community" style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '500px' }} />
        </div>

        <section className="mission-section" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h2 className="mission-section-title">Our <span className="mission-script">Vision</span></h2>
          {editMode ? (
            <>
              <textarea
                className="mission-edit-textarea mission-edit-tagline"
                value={editData.visionTagline || ''}
                onChange={(e) => handleChange('visionTagline', e.target.value)}
                style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}
              />
              <textarea
                className="mission-edit-textarea mission-edit-body"
                value={editData.visionBody}
                onChange={(e) => handleChange('visionBody', e.target.value)}
                style={{ textAlign: 'left', width: '100%', minHeight: '150px' }}
              />
            </>
          ) : (
            <>
              <p className="mission-tagline" style={{ marginBottom: '25px', fontWeight: 'bold' }}>{mission.visionTagline || ''}</p>
              {mission.visionBody.split('\n\n').map((para, i) => (
                <p key={i} className="mission-body" style={{ marginBottom: '15px' }}>{para}</p>
              ))}
            </>
          )}
        </section>

        <div className="mission-color-rule">
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default MissionPage;