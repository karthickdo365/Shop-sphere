import "../styles/Policy.css";

export default function ShippingPolicy() {
  return (
    <main className="policy-page">
      <div className="card">
        <h1>Shipping Policy</h1>

        <p>
          ShopSphere delivers products across India through trusted courier
          partners. We aim to ensure your order reaches you safely and on time.
        </p>

        <h2>Order Processing</h2>
        <p>
          Orders are processed within 24 hours after payment confirmation.
          Orders placed on weekends or public holidays will be processed on the
          next business day.
        </p>

        <h2>Delivery Time</h2>
        <ul>
          <li>Metro Cities: 2–4 Business Days</li>
          <li>Other Cities: 3–6 Business Days</li>
          <li>Remote Areas: 5–8 Business Days</li>
        </ul>

        <h2>Shipping Charges</h2>
        <ul>
          <li>Free shipping on orders above ₹999.</li>
          <li>₹49 shipping charge for orders below ₹999.</li>
        </ul>

        <h2>Order Tracking</h2>
        <p>
          Once your order is shipped, you will receive a tracking link via email
          and SMS. You can also track your order from your account dashboard.
        </p>
      </div>
    </main>
  );
}