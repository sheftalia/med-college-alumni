import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="title-font">Mediterranean College Alumni Portal</h1>
        <p>Connecting graduates from Greece's premier higher education institution since 1977</p>
        <div className="hero-buttons">
          <Link to="/register" className="cta-button primary-button">Join the Network</Link>
          <Link to="/login" className="cta-button secondary-button">Alumni Login</Link>
        </div>
      </section>

      <section className="about-section">
        <h2 className="title-font section-title">About Mediterranean College</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              <strong>Mediterranean College</strong> was founded in 1977 and has established itself as a leading higher education institution in Greece. With our motto "Excellence in Education," we are committed to providing high-quality education and promoting academic excellence.
            </p>
            <p>
              Our alumni network connects graduates from all of our campuses in Athens, Thessaloniki, and Glyfada, creating opportunities for professional networking, continued learning, and community engagement.
            </p>
          </div>
          <div className="campus-info">
            <h3 className="title-font">Our Campuses</h3>
            <div className="campuses">
              <div className="campus">
                <h4>Athens</h4>
                <p>13 Kodrigktonos & 94 Patission Ave, 104 34</p>
                <p>Patission Ave & 8 Pellinis, 11251</p>
                <p>Tel: +30 210 8899600</p>
              </div>
              <div className="campus">
                <h4>Glyfada</h4>
                <p>33 Achilleos Street & 65 Vouliagmenis Avenue, 16675</p>
                <p>Tel: +30 210 8899600</p>
              </div>
              <div className="campus">
                <h4>Thessaloniki</h4>
                <p>21 Ionos Dragoumi, 54625</p>
                <p>Tel: +30 2310 287779 – +30 2314 440300</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="schools-section">
        <h2 className="title-font section-title">Our Schools and Programmes</h2>
        <div className="schools-list">
          <div className="school">
            <h3>School of Education</h3>
            <p>Undergraduate and postgraduate programmes in Education, TESOL, and Special Educational Needs</p>
          </div>
          <div className="school">
            <h3>School of Psychology</h3>
            <p>Comprehensive psychology and counselling programmes at both undergraduate and postgraduate levels</p>
          </div>
          <div className="school">
            <h3>Business School</h3>
            <p>A wide range of business-related degrees including Business Management, Marketing, and Finance</p>
          </div>
          <div className="school">
            <h3>And Many More</h3>
            <p>Including Computing, Engineering, Tourism & Hospitality, Health & Sport Sciences, Arts & Design, and Shipping</p>
          </div>
        </div>
      </section>

      <section className="alumni-benefits">
        <h2 className="title-font section-title">Benefits of Joining Our Alumni Network</h2>
        <ul>
          <li>Connect with fellow graduates and build your professional network</li>
          <li>Access career opportunities and job listings</li>
          <li>Participate in exclusive events and continuing education</li>
          <li>Mentor current students or find mentors in your field</li>
          <li>Stay updated with college news and achievements</li>
        </ul>
        <Link to="/register" className="cta-button primary-button">Join Today</Link>
      </section>
    </div>
  );
};

export default Home;