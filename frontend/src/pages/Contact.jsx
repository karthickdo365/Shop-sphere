import React, { useState } from 'react';
import '../styles/contact.css';
import "../styles/AboutUs.css";

const CONTACT_IMAGE = 'https://images.unsplash.com/photo-1558522195-e1201b090344?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export default function Contact({ brandName = 'Our Store' }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setStatus("sending");

  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("sent");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } else {
      alert(data.message);
      setStatus("idle");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to send message");
    setStatus("idle");
  }
};

  return (
    <main className="contact">
      <section className="contact-hero">
        <p className="eyebrow">Get in touch</p>
        <h1>Questions about an order?<br />We're on it.</h1>
        <p className="lede">
          Whether it's a shipping question, a return, or you just want to say
          hi — the {brandName} team usually replies within a few hours.
        </p>
      </section>

      <section className="contact-body">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required
                value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required
                value={form.email} onChange={handleChange} placeholder="you@email.com" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text" required
              value={form.subject} onChange={handleChange} placeholder="Order #, return, general question…" />
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" required
              value={form.message} onChange={handleChange} placeholder="Tell us what's going on" />
          </div>

          <button type="submit" className="btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message sent ✓' : 'Send message'}
          </button>
          {status === 'sent' && <p className="confirm">Thanks — we'll get back to you soon.</p>}
        </form>

        <div className="contact-side">
          <div className="contact-image clipped">
            <img src={CONTACT_IMAGE} alt="Our support team" />
          </div>
          <div className="contact-card">
            <div className="contact-row">
              <span className="contact-label">Email</span>
              <a href="mailto:support@yourstore.com">karthic.cct@gmail.com</a>
            </div>
            <div className="contact-row">
              <span className="contact-label">Phone</span>
              <a href="tel:+911234567890">+91 9025781659 </a>
            </div>
            <div className="contact-row">
              <span className="contact-label">Hours</span>
              <span>Mon–Sat, 9am–7pm IST</span>
            </div>
            <div className="contact-row">
              <span className="contact-label">Address</span>
              <span>Coimbatore, Tamil Nadu, India</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}