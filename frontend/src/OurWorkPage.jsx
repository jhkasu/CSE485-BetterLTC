import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurWorkPage.css';
import API_BASE from './config';

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
        <header className="page-header page-header--plain">
          <div className="page-header-text">
            <button className="arrow-link ourwork-back" onClick={() => setSelected(null)}>← Back to our work</button>
            <span className="eyebrow">
              {selected.category}{selected.category && selected.date ? ' · ' : ''}{selected.date}
            </span>
            <h1>{selected.title}</h1>
          </div>
        </header>
        <div className="overlap-card ourwork-detail">
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

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">Our work</span>
          <h1>Stories from the community</h1>
        </div>
        <div className="page-header-media">
          <img src="/ourWork.png" alt="Our work" />
        </div>
      </header>

      <div className="ourwork-page">
        {posts.length === 0 ? (
          <p className="ourwork-empty">No posts yet.</p>
        ) : (
          posts.map(post => {
            const { thumb } = extractMedia(post.content);
            const preview = stripHtml(post.content);
            return (
              <div key={post.id} className="list-row">
                <div className="list-row-text">
                  {(post.category || post.date) && (
                    <span className="eyebrow">
                      {post.category}{post.category && post.date ? ' · ' : ''}{post.date}
                    </span>
                  )}
                  <h3>{post.title}</h3>
                  <p className="ourwork-preview">{preview}</p>
                  <button className="btn btn-outline" onClick={() => setSelected(post)}>Read more</button>
                </div>
                <div className="list-row-media">
                  {thumb
                    ? <img src={thumb} alt={post.title} loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
                    : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OurWorkPage;
