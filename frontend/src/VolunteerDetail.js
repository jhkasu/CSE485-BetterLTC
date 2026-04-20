import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdLocationOn, MdCalendarToday, MdSchedule, MdCategory } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import './VolunteerDetail.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE = 'http://localhost:5184';

const CITY_COORDS = {
  'Saskatoon':       [52.1332, -106.6700],
  'Regina':          [50.4452, -104.6189],
  'Prince Albert':   [53.2033, -105.7531],
  'Moose Jaw':       [50.3934, -105.5519],
  'Swift Current':   [50.2859, -107.7967],
  'Yorkton':         [51.2132, -102.4631],
  'North Battleford':[52.7790, -108.2960],
  'Estevan':         [49.1392, -102.9819],
  'Weyburn':         [49.6617, -103.8521],
  'Lloydminster':    [53.2819, -110.0011],
  'Humboldt':        [52.2006, -105.1234],
  'Melfort':         [52.8571, -104.6083],
  'Melville':        [50.9262, -102.8086],
  'Kindersley':      [51.4672, -109.1588],
  'Tisdale':         [52.8494, -104.0524],
};

function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/listings/${id}`)
      .then(res => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setListing(data); })
      .catch(() => setNotFound(true));
  }, [id]);

  const handleRegister = async () => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { navigate('/signin'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'volunteer') return;
    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: user.id,
          volunteerName: `${user.firstName} ${user.lastName}`,
          volunteerEmail: user.email,
          listingId: listing.id,
          listingTitle: listing.listingTitle,
          orgName: listing.orgName,
        }),
      });
      if (res.ok || res.status === 409) setRegistered(true);
    } catch {}
    setRegLoading(false);
  };

  const renderRegisterArea = () => {
    const stored = localStorage.getItem('currentUser');
    const user = stored ? JSON.parse(stored) : null;
    if (!user) {
      return <button className="vdetail-register" onClick={handleRegister}>Register Now</button>;
    }
    if (user.role !== 'volunteer') return null;
    if (!user.backgroundCheckApproved) {
      return <p className="vdetail-bgcheck-notice">A background check approval is required before applying. Please wait for admin review.</p>;
    }
    if (registered) return <p className="vdetail-registered">You have applied for this opportunity.</p>;
    return (
      <button className="vdetail-register" onClick={handleRegister} disabled={regLoading}>
        {regLoading ? 'Submitting...' : 'Register Now'}
      </button>
    );
  };

  if (notFound) {
    return (
      <div>
        <Navbar />
        <div className="vdetail-not-found">
          <p>Opportunity not found.</p>
          <Link to="/volunteer">← Back to Opportunities</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="vdetail-page"><p>Loading...</p></div>
        <Footer />
      </div>
    );
  }

  const coords = CITY_COORDS[listing.location] || CITY_COORDS['Saskatoon'];

  return (
    <div>
      <Navbar />
      <div className="vdetail-page">
        <Link to="/volunteer" className="vdetail-back">← Back to Opportunities</Link>

        <div className="vdetail-layout">
          <div className="vdetail-main">
            <div className="vdetail-header">
              <span className="vdetail-status">{listing.status}</span>
              {listing.category && <span className="vdetail-category">{listing.category}</span>}
            </div>
            <h1>{listing.listingTitle}</h1>
            <p className="vdetail-org">{listing.orgName}</p>

            <div className="vdetail-meta">
              <div className="vdetail-meta-item">
                <MdLocationOn className="vdetail-meta-icon" />
                <div>
                  <span className="vdetail-meta-label">Location</span>
                  <span className="vdetail-meta-value">{listing.location}</span>
                </div>
              </div>
              {listing.days && (
                <div className="vdetail-meta-item">
                  <MdSchedule className="vdetail-meta-icon" />
                  <div>
                    <span className="vdetail-meta-label">Schedule</span>
                    <span className="vdetail-meta-value">{listing.days}</span>
                  </div>
                </div>
              )}
              {(listing.startDate || listing.endDate) && (
                <div className="vdetail-meta-item">
                  <MdCalendarToday className="vdetail-meta-icon" />
                  <div>
                    <span className="vdetail-meta-label">Duration</span>
                    <span className="vdetail-meta-value">
                      {listing.startDate}{listing.startDate && listing.endDate ? ' — ' : ''}{listing.endDate}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {listing.description && (
              <div className="vdetail-description-section">
                <h2>About This Opportunity</h2>
                <p className="vdetail-description">{listing.description}</p>
              </div>
            )}

            <div className="vdetail-register-wrap">
              {renderRegisterArea()}
            </div>
          </div>

          <div className="vdetail-sidebar">
            <div className="vdetail-map-card">
              <div className="vdetail-map-label">
                <MdLocationOn /> {listing.location}, Saskatchewan
              </div>
              <MapContainer
                key={listing.location}
                center={coords}
                zoom={12}
                className="vdetail-map"
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                <Marker position={coords}>
                  <Popup>{listing.listingTitle}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VolunteerDetail;
