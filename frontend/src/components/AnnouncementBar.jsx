export default function AnnouncementBar() {
  const messages = [
    "30-Day Easy Returns",
    "24/7 Customer Support",
    "Free Shipping on orders above ₹999",
    "100% Secure Payments",
    "Fast Delivery Across India",
    "Premium Quality Products",
  ];

  return (
    <div className="announcement-bar">
      <div className="announcement-track">

        {[...messages, ...messages].map((msg, index) => (
          <span className="announcement-item" key={index}>
            ★ {msg}
          </span>
        ))}

      </div>

      <style>{`
        .announcement-bar{
          width:100%;
          background:var(--color-accent);
          color:#fff;
          overflow:hidden;
          white-space:nowrap;
          padding:8px 0;
        }

        .announcement-track{
          display:inline-flex;
          align-items:center;
          animation:marquee 20s linear infinite;
        }

        .announcement-bar:hover .announcement-track{
          animation-play-state:paused;
        }

        .announcement-item{
          display:flex;
          align-items:center;
          gap:8px;
          padding:0 45px;
          font-size:13px;
          font-weight:600;
          white-space:nowrap;
          flex-shrink:0;
        }

        @keyframes marquee{
          0%{
            transform:translateX(0);
          }
          100%{
            transform:translateX(-50%);
          }
        }

        @media(max-width:768px){

          .announcement-item{
            padding:0 25px;
            font-size:12px;
          }

          .announcement-track{
            animation-duration:15s;
          }

        }
      `}</style>
    </div>
  );
}