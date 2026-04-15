import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsSection.css';

const API_BASE = 'http://localhost:5184';

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function extractMedia(html) {
  if (!html) return { thumb: null };
  const imgMatch = html.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return { thumb: imgMatch[1] };
  const iframeMatch = html.match(/<iframe[^>]+src="([^"]*youtube[^"]+)"/);
  if (iframeMatch) {
    const id = extractYoutubeId(iframeMatch[1]);
    if (id) return { thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  }
  const linkMatch = html.match(/href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]+)"/);
  if (linkMatch) {
    const id = extractYoutubeId(linkMatch[1]);
    if (id) return { thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  }
  return { thumb: null };
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function NewsCard({ post, size }) {
  const { thumb } = extractMedia(post.content);
  const preview = stripHtml(post.content);
  return (
    <div className={`news-card news-card-${size}`}>
      <div className="news-card-img">
        {thumb
          ? <img src={thumb} alt={post.title} />
          : <div className="news-card-img-placeholder" />}
      </div>
      <div className="news-card-body">
        {post.category && <span className="news-tag">{post.category}</span>}
        <h3>{post.title}</h3>
        <p>{preview}</p>
        <Link to="/our-work" className="news-read-more">Read More →</Link>
      </div>
    </div>
  );
}

function NewsSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/our-work`)
      .then(res => res.json())
      .then(data => setPosts(data.slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  const isEditorial = posts.length === 3;
  const [featured, ...rest] = posts;

  return (
    <section className="news-section">
      <div className="news-header">
        <h2>News</h2>
        <Link to="/our-work" className="news-viewall">View All →</Link>
      </div>
      {isEditorial ? (
        <div className="news-grid-editorial">
          <div className="news-card news-card-featured">
            <div className="news-card-img">
              {extractMedia(featured.content).thumb
                ? <img src={extractMedia(featured.content).thumb} alt={featured.title} />
                : <div className="news-card-img-placeholder" />}
            </div>
            <div className="news-card-body">
              {featured.category && <span className="news-tag">{featured.category}</span>}
              <h3>{featured.title}</h3>
              <p>{stripHtml(featured.content)}</p>
              <Link to="/our-work" className="news-read-more">Read More →</Link>
            </div>
          </div>
          <div className="news-right-col">
            {rest.map(post => <NewsCard key={post.id} post={post} size="small" />)}
          </div>
        </div>
      ) : (
        <div className="news-grid-equal">
          {posts.map(post => <NewsCard key={post.id} post={post} size="equal" />)}
        </div>
      )}
    </section>
  );
}

export default NewsSection;
