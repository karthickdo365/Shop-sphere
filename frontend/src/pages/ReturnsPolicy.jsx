import "../styles/Policy.css";

export default function ReturnsPolicy() {
  return (
    <main className="policy-page">
      <div className="card">
        <h1>Return & Exchange Policy</h1>

        <p>
          At ShopSphere, customer satisfaction is our priority. If you are not completely satisfied with your purchase, you may request a return or exchange under the following conditions.
        </p>

        <h2>Return Eligibility</h2>
        <ul>
          <li>Returns are accepted within <strong>7 days</strong> of delivery.</li>
          <li>Products must be unused, unwashed, and in their original condition.</li>
          <li>All tags, labels, and original packaging must be intact.</li>
          <li>Items damaged by misuse are not eligible for return.</li>
        </ul>

        <h2>Exchange Policy</h2>
        <p>
          Size or color exchanges are available based on stock availability. Exchange requests must be made within 7 days of delivery.
        </p>

        <h2>Refunds</h2>
        <p>
          Refunds are processed within 5-7 business days after the returned product passes quality inspection.
        </p>

        <h2>Non-Returnable Items</h2>
        <ul>
          <li>Innerwear</li>
          <li>Gift cards</li>
          <li>Final sale products</li>
        </ul>
      </div>
    </main>
  );
}