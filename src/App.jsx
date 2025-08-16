import './App.css'
import heroImage from './assets/hero.jpg'
import leftImage from './assets/left.jpg'
import image1 from './assets/1.jpg'
import image2 from './assets/2.jpg'
import image3 from './assets/3.jpg'

function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-links-left">
            <a href="#mission">Mission</a>
            <a href="#impact">Impact</a>
            <a href="#labs">Labs</a>
          </div>
          <div className="nav-logo">
            <h2>RizzexAI</h2>
          </div>
          <div className="nav-links-right">
            <a href="#newsroom">Newsroom</a>
            <a href="#careers">Careers</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-tagline">
            Because Every Heart Deserves a Match.
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="content-left">
            <h2 className="content-headline">
              Go on your <span className="highlight">last</span> first date.
            </h2>
            <div className="content-arrow"></div>
          </div>
          <div className="content-right">
            <p className="content-description">
              RizzexAI is built on the belief that anyone looking for love should be able to find it. 
              It's also built on cutting-edge AI technology, so we can succeed in getting you out on 
              promising dates, not keeping you on the app.
            </p>
            <button className="content-button">
              How we do it
            </button>
          </div>
        </div>
      </section>

      {/* Labs Section */}
      <section className="labs-section">
        <div className="labs-container">
          <div className="labs-image">
            <img src={leftImage} alt="Labs" className="labs-img" />
          </div>
          <div className="labs-content">
            <h3 className="labs-subtitle">RizzexAI Labs</h3>
            <h2 className="labs-headline">Where Science Meets Chemistry.</h2>
            <p className="labs-description">
            Built by researchers, designed for lovers. Rizzex AI takes the guesswork out of dating with a science-backed matching system that prioritizes compatibility over chance. This is dating smarter, simpler, real.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h3 className="testimonials-title">What Our Users Say</h3>
          <div className="testimonials-slider">
            <div className="testimonials-track">
              <div className="testimonial-slide">
                <div className="quote-mark">"</div>
                <blockquote className="testimonial-quote">
                  Thank you RizzexAI! We're getting married in a few months!
                </blockquote>
                <div className="testimonial-names">Sarah M. and Alex K.</div>
              </div>
              <div className="testimonial-slide">
                <div className="quote-mark">"</div>
                <blockquote className="testimonial-quote">
                  Found my soulmate through RizzexAI's amazing AI matching!
                </blockquote>
                <div className="testimonial-names">Emma L. and David R.</div>
              </div>
              <div className="testimonial-slide">
                <div className="quote-mark">"</div>
                <blockquote className="testimonial-quote">
                  RizzexAI made dating feel magical and effortless!
                </blockquote>
                <div className="testimonial-names">Jessica T. and Michael P.</div>
              </div>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section className="work-section">
        <div className="work-container">
          <div className="work-content">
            <h3 className="work-subtitle">Work at RizzexAI</h3>
            <h2 className="work-headline">Let's work together.</h2>
            <p className="work-description">
              We're looking for people who want to make dating effective, not addictive.
            </p>
            <button className="work-button">
              Join us
            </button>
          </div>
          <div className="work-images">
            <div className="work-image">
              <img src={image1} alt="Office Team" className="work-img" />
            </div>
            <div className="work-image">
              <img src={image2} alt="Team Outdoors" className="work-img" />
            </div>
            <div className="work-image">
              <img src={image3} alt="Relaxed Office" className="work-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4 className="footer-title">Index</h4>
              <ul className="footer-links">
                <li><a href="#mission">Mission</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#labs">Labs</a></li>
                <li><a href="#newsroom">Newsroom</a></li>
                <li><a href="#success">Success Stories</a></li>
                <li><a href="#history">History</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-links">
                <li><a href="#safety">Safe Dating Tips</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#trust">Trust & Safety</a></li>
                <li><a href="#press">Press Resources</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="#security">Security</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
                <li><a href="#health">Consumer Health Data Privacy Policy</a></li>
                <li><a href="#choices">Your Privacy Choices</a></li>
                <li><a href="#colorado">Colorado Safety Policy Information</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-left">
              <p className="footer-copyright">© 2025 RizzexAI Inc.</p>
              <div className="footer-language">
                <span className="language-text">English (India)</span>
                <span className="globe-icon">🌐</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
