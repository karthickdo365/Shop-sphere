import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/orders");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        <CheckCircle className="success-icon" size={90} />

        <h2>Order Placed Successfully</h2>

        <p>Your order has been confirmed.</p>
      </div>

      <style>{`
        .success-page{
          position:fixed;
          inset:0;
          background:#fff;
          display:flex;
          justify-content:center;
          align-items:center;
          z-index:9999;
        }

        .success-card{
          text-align:center;
          animation:popup .4s ease;
        }

        .success-icon{
          color:#16a34a;
          margin-bottom:20px;
        }

        .success-card h2{
          font-size:32px;
          margin-bottom:10px;
        }

        .success-card p{
          color:#666;
          font-size:16px;
        }

        @keyframes popup{
          from{
            opacity:0;
            transform:scale(.8);
          }

          to{
            opacity:1;
            transform:scale(1);
          }
        }
      `}</style>
    </div>
  );
}