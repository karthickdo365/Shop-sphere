import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Auto-rotating banner carousel for the home page.
 * @param {Array<{ id, title, subtitle, imageUrl, linkUrl }>} banners
 */
export default function BannerCarousel({ banners = [] }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, total]);

  // Reset to slide 0 if banners change
  useEffect(() => {
    setCurrent(0);
  }, [banners.length]);

  if (total === 0) return null;

  const handleClick = (banner) => {
    if (!banner.linkUrl) return;
    if (banner.linkUrl.startsWith('http')) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(banner.linkUrl);
    }
  };

  return (
    <section className="banner-carousel">
      <div className="banner-slides">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`banner-slide ${idx === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${b.imageUrl})` }}
            onClick={() => handleClick(b)}
            role="button"
            tabIndex={0}
          >
            <div className="banner-overlay" />
            <div className="container banner-content">
              {b.subtitle && <p className="banner-subtitle">{b.subtitle}</p>}
              <h2 className="banner-title">{b.title}</h2>
              {b.linkUrl && <span className="banner-cta">Shop Now &rarr;</span>}
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            className="banner-nav banner-prev"
            onClick={goPrev}
            aria-label="Previous banner"
            type="button"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="banner-nav banner-next"
            onClick={goNext}
            aria-label="Next banner"
            type="button"
          >
            <ChevronRight size={24} />
          </button>
          <div className="banner-dots">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`banner-dot ${idx === current ? 'active' : ''}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to banner ${idx + 1}`}
                type="button"
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .banner-carousel {
          position: relative;
          width: 100%;
          height: 420px;
          overflow: hidden;
          background: var(--color-dark);
        }
        .banner-slides {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .banner-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 0.6s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #fff;
        }
        .banner-slide.active { opacity: 1; }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
        }
        .banner-content {
          position: relative;
          max-width: 600px;
          padding: 0 16px;
          z-index: 1;
        }
        .banner-subtitle {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 12px;
          opacity: 0.95;
        }
        .banner-title {
          font-size: 44px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }
        .banner-cta {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          padding: 12px 24px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .banner-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.4);
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: background 0.2s;
        }
        .banner-nav:hover { background: var(--color-accent); }
        .banner-prev { left: 16px; }
        .banner-next { right: 16px; }
        .banner-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
        }
        .banner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          transition: all 0.2s;
        }
        .banner-dot.active {
          background: var(--color-accent);
          width: 28px;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .banner-carousel { height: 280px; }
          .banner-title { font-size: 28px; }
          .banner-subtitle { font-size: 12px; }
          .banner-nav { width: 36px; height: 36px; }
        }
      `}</style>
    </section>
  );
}
