import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurWorkPage.css';

const API_BASE = 'http://localhost:5184';

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function extractMedia(html) {
  if (!html) return { thumb: null, isYoutube: false };

  // 1. <img> tag
  const imgMatch = html.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return { thumb: imgMatch[1], isYoutube: false };

  // 2. YouTube iframe embed
  const iframeMatch = html.match(/<iframe[^>]+src="([^"]*youtube[^"]+)"/);
  if (iframeMatch) {
    const id = extractYoutubeId(iframeMatch[1]);
    if (id) return { thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, isYoutube: true };
  }

  // 3. YouTube link <a href>
  const linkMatch = html.match(/href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]+)"/);
  if (linkMatch) {
    const id = extractYoutubeId(linkMatch[1]);
    if (id) return { thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, isYoutube: true };
  }

  return { thumb: null, isYoutube: false };
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function OurWorkPage() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/our-work`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  if (selected) {
    return (
      <div>
        <Navbar />
        <div className="ourwork-detail">
          <button className="ourwork-back" onClick={() => setSelected(null)}>← Back</button>
          <div className="ourwork-detail-meta">
            {selected.category && <span className="ourwork-tag">{selected.category}</span>}
            {selected.date && <span className="ourwork-date">{selected.date}</span>}
          </div>
          <h1 className="ourwork-detail-title">{selected.title}</h1>
          <div
            className="ourwork-detail-content"
            dangerouslySetInnerHTML={{ __html: selected.content }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="ourwork-banner">
        <img src="/ourWork.png" alt="Our Work" />
        <div className="ourwork-banner-overlay">
          <h1 className="ourwork-banner-title">Our Work</h1>
        </div>
      </div>

      <div className="ourwork-page">
        <h1 className="ourwork-heading">Our Work</h1>
        {posts.length === 0 ? (
          <p className="ourwork-empty">No posts yet.</p>
        ) : (
          <div className="ourwork-grid">
            {posts.map(post => {
              const { thumb, isYoutube } = extractMedia(post.content);
              const preview = stripHtml(post.content);
              return (
                <div key={post.id} className="ourwork-card" onClick={() => setSelected(post)}>
                  <div className={`ourwork-card-img${isYoutube && !thumb ? ' ourwork-card-img-youtube' : ''}`}>
                    {thumb
                      ? <img
                          src={thumb}
                          alt={post.title}
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('ourwork-card-img-youtube');
                          }}
                        />
                      : isYoutube
                        ? <div className="ourwork-card-img-youtube" />
                        : <div className="ourwork-card-img-empty" />}
                  </div>
                  <div className="ourwork-card-body">
                    <h2 className="ourwork-card-title">{post.title}</h2>
                    <p className="ourwork-card-preview">{preview}</p>
                    <span className="ourwork-read-more">Read More →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OurWorkPage;
