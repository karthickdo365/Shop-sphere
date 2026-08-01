import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

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
        <CheckCircle2 className="success-icon" size={90} />

        <h1>Order Placed Successfully</h1>

        <p>
          Thank you for shopping with ShopSphere.
        </p>

        <span>Redirecting to your orders...</span>
      </div>

      <style>{`
        .success-page{
          height:100vh;
          display:flex;
          justify-content:center;
          align-items:center;
          background:#f8f9fa;
        }

        .success-card{
          background:white;
          padding:50px;
          border-radius:20px;
          text-align:center;
          box-shadow:0 10px 35px rgba(0,0,0,.08);
          animation:fade .35s ease;
        }

        .success-icon{
          color:#16a34a;
          animation:pop .45s ease;
        }

        .success-card h1{
          margin-top:20px;
          font-size:32px;
        }

        .success-card p{
          color:#666;
          margin-top:12px;
          font-size:16px;
        }

        .success-card span{
          display:block;
          margin-top:25px;
          color:#999;
        }

        @keyframes pop{
          from{
            transform:scale(.2);
            opacity:0;
          }
          to{
            transform:scale(1);
            opacity:1;
          }
        }

        @keyframes fade{
          from{
            opacity:0;
            transform:translateY(20px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }
      `}</style>
    </div>
  );
}