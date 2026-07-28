import React from "react";
import "../styles/AboutUs.css";

 //Replace these with your own product photography or Unsplash picks any time — just swap the URLs. Format: https://images.unsplash.com/photo-ID?w=1200&q=80
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  story: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80',
  values: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1000&q=80',
};

export default function AboutUs({ brandName = 'Our Store' }) {
  return (
    <main className="about">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-text">
          <p className="eyebrow">About {brandName}</p>
          <h1>
            We build the space<br />between <em>ordering</em><br />and <em>opening</em>.
          </h1>
          <p className="lede">
            Every box that leaves our warehouse carries more than a product —
            it carries the moment someone decided to trust us with what they wanted.
            We take that seriously.
          </p>
        </div>
        <div className="about-hero-image clipped">
          <img src={IMAGES.hero} alt="Package ready for shipping" />
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="about-story-image clipped">
          <img src={IMAGES.story} alt="Our team at work" />
        </div>
        <div className="about-story-text">
          <p className="eyebrow">How we started</p>
          <blockquote>
            "We were tired of buying things online and feeling nothing
            when they arrived. So we started building the opposite of that."
          </blockquote>
          <p>
            {brandName} began as a small team frustrated by slow shipping, vague
            product pages, and support that never really helped. We set out to
            fix all three — sourcing carefully, packing thoughtfully, and
            staying reachable when something goes wrong.
          </p>
          <p>
            Today we ship to customers across the country, but the standard
            hasn't changed: every order should feel like it was picked, packed,
            and sent by someone who cared it was going to you.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-values-image clipped">
          <img src={IMAGES.values} alt="Quality control at our facility" />
        </div>
        <div className="about-values-grid">
          <div className="value">
            <span className="value-mark">Quality</span>
            <p>Every item is checked before it ships — not sampled, checked.</p>
          </div>
          <div className="value">
            <span className="value-mark">Speed</span>
            <p>Orders placed before 3pm leave our warehouse the same day.</p>
          </div>
          <div className="value">
            <span className="value-mark">Trust</span>
            <p>Real people answer support requests, usually within a few hours.</p>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="about-stats">
        <div className="stat">
          <span className="stat-num">50k+</span>
          <span className="stat-label">Orders shipped</span>
        </div>
        <div className="stat">
          <span className="stat-num">4.8/5</span>
          <span className="stat-label">Average rating</span>
        </div>
        <div className="stat">
          <span className="stat-num">24hr</span>
          <span className="stat-label">Support response</span>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>See what we've been packing.</h2>
        <a href="/shop" className="btn">Browse the shop</a>
      </section>
    </main>
  );
}