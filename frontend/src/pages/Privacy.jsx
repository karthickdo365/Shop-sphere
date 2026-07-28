import "../styles/Policy.css";

export default function PrivacyPolicy() {
  return (
    <main className="policy-page">
      <div className="card">
        <h1>Privacy Policy</h1>

        <p>
          ShopSphere respects your privacy and is committed to protecting your
          personal information.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Name</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Shipping Address</li>
          <li>Payment Information (processed securely)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process your orders.</li>
          <li>Provide customer support.</li>
          <li>Send order and shipping updates.</li>
          <li>Improve our website and services.</li>
          <li>Send promotional offers with your consent.</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We use industry-standard security measures to protect your personal
          information. Payment information is handled securely through trusted
          payment gateways.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request to update, download, or delete your personal
          information by contacting our support team.
        </p>
      </div>
    </main>
  );
}