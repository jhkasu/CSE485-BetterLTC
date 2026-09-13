import React, { useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurHistoryPage.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const historyData = [
  {
    id: 1,
    years: '1990 – 2000',
    title: 'The Beginning',
    description: 'Placeholder description for this era.',
    photos: ['/history1.png', '/history2.png', '/history3.png'],
  },
  {
    id: 2,
    years: '2000 – 2010',
    title: 'Growth & Expansion',
    description: 'Placeholder description for this era.',
    photos: ['/history1.png', '/history2.png'],
  },
];

function HistorySection({ years, title, description, photos }) {
  const swiperRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (!swiperRef.current) return;
    if (playing) {
      swiperRef.current.autoplay.stop();
    } else {
      swiperRef.current.autoplay.start();
    }
    setPlaying(!playing);
  };

  return (
    <div className="history-section split">
      <div>
        <span className="eyebrow">{years}</span>
        <h2>{title}</h2>
        <p className="history-description">{description}</p>
      </div>
      <div className="history-gallery">
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        slidesPerView={2.5}
        spaceBetween={20}
        autoplay={false}
        className="history-swiper"
      >
        {photos.map((photo, i) => (
          <SwiperSlide key={i}>
            <img src={photo} alt={`${title} ${i + 1}`} className="history-swiper-img" />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="gallery-controls">
        <div className="swiper-button-prev spotlight-btn-prev" tabIndex="0" role="button" aria-label="Previous slide" onClick={() => swiperRef.current?.slidePrev()} />
        <div className={`swiper-button-play${playing ? ' playing' : ''}`} role="button" aria-label="Play slideshow" onClick={handlePlay} />
        <div className="swiper-button-next spotlight-btn-next" tabIndex="0" role="button" aria-label="Next slide" onClick={() => swiperRef.current?.slideNext()} />
      </div>
      </div>
    </div>
  );
}

function OurHistoryPage() {
  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">About us</span>
          <h1>Our history</h1>
        </div>
        <div className="page-header-media">
          <img src="/saskatchewan.jpg" alt="Saskatchewan prairie" />
        </div>
      </header>

      <section className="section ourhistory-content">
        <div className="container">
          {historyData.map(entry => (
            <HistorySection key={entry.id} {...entry} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default OurHistoryPage;
