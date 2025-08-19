import React from "react";
import "./App.css";
import heroImage from "./assets/hero.jpg";
import leftImage from "./assets/left.jpg";
import image1 from "./assets/1.jpg";
import image2 from "./assets/2.jpg";
import image3 from "./assets/3.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function InfiniteMouseSlider({ images = [], height = 260, captions = [] }) {
  const containerRef = React.useRef(null);
  const stripRef = React.useRef(null);
  const firstStripRef = React.useRef(null);

  // Add hover state tracking
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const repeated = React.useMemo(() => {
    const reps = 4; 
    const arr = [];
    for (let i = 0; i < reps; i++) arr.push(...images);
    return arr;
  }, [images]);

  const [stripWidth, setStripWidth] = React.useState(0);  
  React.useLayoutEffect(() => {
    if (!firstStripRef.current) return;
    const el = firstStripRef.current;
    const measure = () => setStripWidth(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
  }, [repeated]);

  // animation state (refs so the RAF loop reads/writes without re-renders)
  const posRef = React.useRef(0);          // px current translateX
  const velRef = React.useRef(0);          // px/sec current velocity
  const targetVelRef = React.useRef(0);    // px/sec target (from hover)
  const draggingRef = React.useRef(false);
  const lastPointerX = React.useRef(0);
  const lastTime = React.useRef(0);

  // helper: smooth lerp
  const lerp = (a, b, t) => a + (b - a) * t;

  // Touch handling for mobile devices
  const handleTouchStart = (index) => {
    setHoveredIndex(index);
    // Auto-clear after 2 seconds
    setTimeout(() => setHoveredIndex(null), 2000);
  };

  // pointer handlers (drag)
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e) => {
      draggingRef.current = true;
      lastPointerX.current = e.clientX;
      lastTime.current = e.timeStamp || performance.now();
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      const now = e.timeStamp || performance.now();
      const dx = e.clientX - lastPointerX.current;
      const dt = Math.max(1, now - lastTime.current);
      // apply direct translation from drag (makes dragging snappy)
      posRef.current += dx;
      // estimate velocity from drag (px/sec)
      velRef.current = (dx / dt) * 1000;
      lastPointerX.current = e.clientX;
      lastTime.current = now;
    };

    const onPointerUp = (e) => {
      draggingRef.current = false;
      // leave velRef as-is so inertia continues
      try { container.releasePointerCapture?.(e.pointerId); } catch (err) {}
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  // hover control (desktop): map pointer X -> target velocity
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxSpeed = 420; // px/sec at extreme edge
    const onMouseMove = (e) => {
      if (draggingRef.current) return;
      const rect = container.getBoundingClientRect();
      const rel = (e.clientX - rect.left) / rect.width; // 0..1
      const center = rel - 0.5; // -0.5 .. 0.5
      targetVelRef.current = -center * 2 * maxSpeed; // invert so right side moves left
    };
    const onMouseLeave = () => {
      targetVelRef.current = 0;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("touchmove", onMouseMove, { passive: true });

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchmove", onMouseMove);
    };
  }, []);

  // wheel impulse
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const wheelGain = 18;
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      velRef.current -= delta * wheelGain; // reverse to match natural direction
    };
    container.addEventListener("wheel", onWheel, { passive: true });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  // the RAF loop — integrate velocity, smooth toward targetVel, wrap position, render
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // cap dt for stability
      last = now;

      // smooth velocity towards targetVel when not dragging
      const smoothing = draggingRef.current ? 0.08 : 0.12; // faster when dragging is false
      velRef.current = lerp(velRef.current, targetVelRef.current, 1 - Math.pow(1 - smoothing, dt * 60));

      // slight friction when idle (very small)
      if (!draggingRef.current && Math.abs(targetVelRef.current) < 0.5) {
        velRef.current *= Math.pow(0.94, dt * 60);
      }

      // integrate
      posRef.current += velRef.current * dt;

      // wrap using measured single-strip width
      const W = stripWidth || (firstStripRef.current ? firstStripRef.current.getBoundingClientRect().width : 1);
      if (W > 0) {
        if (posRef.current <= -W) posRef.current += W;
        else if (posRef.current > 0) posRef.current -= W;
      }

      // write to DOM
      if (stripRef.current) {
        // use translate3d for GPU accel
        stripRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stripWidth]);

  // styles (inline to avoid collisions with your CSS)
  const containerStyle = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    padding: "18px 12px",
    // try to avoid being hidden by other layout: give it a positive stacking context
    zIndex: 100,
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  const stripStyle = {
    display: "flex",
    alignItems: "stretch",
    gap: 16,
    willChange: "transform",
    transform: "translate3d(0,0,0)",
  };

  // Enhanced card style with hover effect
  const getCardStyle = (index) => ({
    minWidth: 200,
    maxWidth: 320,
    flex: "0 0 auto",
    borderRadius: 12,
    overflow: "hidden",
    background: "rgba(255,255,255,0.95)",
    boxShadow: hoveredIndex === index 
      ? "0 12px 36px rgba(0,0,0,0.15)" 
      : "0 6px 18px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    position: "relative",
  });

  const imgStyle = {
    width: "100%",
    height: height,
    objectFit: "cover",
    display: "block",
  };

  const captionStyle = (index) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
    padding: "20px 16px 16px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    opacity: hoveredIndex === index ? 1 : 0.8,
    transition: "opacity 0.3s ease",
  });

  return (
    <div ref={containerRef} style={containerStyle} className="rizzex-slider">
      <div
        ref={stripRef}
        style={stripStyle}
        // note: we put the first copy in firstStripRef for measuring
      >
        <div 
  ref={stripRef} 
  style={{ display: "flex", gap: 16, alignItems: "stretch", willChange: "transform" }}
>
  {[...repeated, ...repeated].map((src, i) => (
    <div
      key={i}
      style={getCardStyle(i)}
      onMouseEnter={() => setHoveredIndex(i)}
      onMouseLeave={() => setHoveredIndex(null)}
      onTouchStart={() => handleTouchStart(i)}
    >
      <img src={src} alt={`slide-${i}`} style={imgStyle} loading="lazy" />
      <div style={captionStyle(i)}>
        {captions[i % captions.length] || `Feature ${(i % images.length) + 1}`}
      </div>
    </div>
  ))}
</div>

        {/* duplicate */}
        <div aria-hidden style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          {repeated.map((src, i) => (
            <div 
              key={"b-" + i} 
              style={getCardStyle(i + repeated.length)}
              onMouseEnter={() => setHoveredIndex(i + repeated.length)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => handleTouchStart(i + repeated.length)}
            >
              <img src={src} alt={`slide-dup-${i}`} style={imgStyle} loading="lazy" />
              <div style={captionStyle(i + repeated.length)}>
                {captions[i % captions.length] || `Feature ${(i % images.length) + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  // images for the slider — use your actual imports
  const sliderImages = [image1, image2, image3];
  
  // Add captions for each image
  const sliderCaptions = [
    "Smart AI Matching",
    "Real Connections",
    "Lasting Relationships"
  ];

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
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-tagline">Because Every Heart Deserves a Match.</h1>
        </div>
      </section>

      {/* Features Section with Slider */}
      <section className="slider-section" style={{ 
        background: "#f8f9fa",
        paddingTop: "80px",  // Padding after hero section
        paddingBottom: "60px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}>
          {/* Section Title */}
          <h2 style={{
            fontSize: "36px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "48px",
            color: "#1a1a1a",
          }}>
            Features
          </h2>
          
          {/* Slider */}
          <InfiniteMouseSlider 
            images={sliderImages} 
            height={340}
            captions={sliderCaptions}
          />
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
              RizzexAI is built on the belief that anyone looking for love
              should be able to find it. It's also built on cutting-edge AI
              technology, so we can succeed in getting you out on promising
              dates, not keeping you on the app.
            </p>
            <button className="content-button">How we do it</button>
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
              Built by researchers, designed for lovers. Rizzex AI takes the
              guesswork out of dating with a science-backed matching system that
              prioritizes compatibility over chance. This is dating smarter,
              simpler, real.
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
              We're looking for people who want to make dating effective, not
              addictive.
            </p>
            <button className="work-button">Join us</button>
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
                <li>
                  <a href="#mission">Mission</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#labs">Labs</a>
                </li>
                <li>
                  <a href="#newsroom">Newsroom</a>
                </li>
                <li>
                  <a href="#success">Success Stories</a>
                </li>
                <li>
                  <a href="#history">History</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-links">
                <li>
                  <a href="#safety">Safe Dating Tips</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a href="#trust">Trust & Safety</a>
                </li>
                <li>
                  <a href="#press">Press Resources</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="#security">Security</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#cookies">Cookie Policy</a>
                </li>
                <li>
                  <a href="#health">Consumer Health Data Privacy Policy</a>
                </li>
                <li>
                  <a href="#choices">Your Privacy Choices</a>
                </li>
                <li>
                  <a href="#colorado">Colorado Safety Policy Information</a>
                </li>
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
  );
}

export default App;
