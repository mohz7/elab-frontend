import React, { useState, useEffect, useRef } from 'react';
import { offersApi, testCatalogsApi, branchesApi } from '../api/patient';

/* ─── tiny hook: fetch once, expose data/loading ─── */
function useFetch(fn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fn().then(r => {
      if (active) setData(r.data?.data ?? r.data ?? []);
    }).catch(err => {
      if (active) {
        console.warn('Public fetch failed (likely 401/403 - that is okay on home page):', err.message);
        setData([]);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  return { data, loading };
}

/* ─── Animated number counter ─── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const duration = 1400;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Nav link inside homepage ─── */
function NavLink({ href, children }) {
  return (
    <a href={href}
      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 150ms' }}
      onMouseEnter={e => e.target.style.color = 'var(--teal-500)'}
      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
      {children}
    </a>
  );
}

export default function HomePage({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const { data: offers, loading: offersLoading } = useFetch(offersApi.getAll);
  const { data: tests, loading: testsLoading } = useFetch(testCatalogsApi.getAll);
  const { data: branches } = useFetch(branchesApi.getAll);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const activeOffers = Array.isArray(offers)
    ? offers.filter(o => new Date(o.endDate) >= new Date()).slice(0, 6)
    : [];
  const featuredTests = Array.isArray(tests) ? tests.slice(0, 6) : [];
  const branchCount = Array.isArray(branches) ? branches.length : 0;

  const features = [
    { icon: '🔬', title: 'Advanced Testing', desc: 'State-of-the-art equipment and certified technicians ensure the highest accuracy for all 500+ tests.' },
    { icon: '⚡', title: 'Fast Results', desc: 'Most results delivered within 6–24 hours, with instant online access once approved by our specialists.' },
    { icon: '🤖', title: 'AI Analysis', desc: 'Our built-in Gemini AI interprets your results in plain language so you actually understand your health.' },
    { icon: '🔒', title: 'Private & Secure', desc: 'Your medical data is encrypted end-to-end. Only you and your care team can access your records.' },
    { icon: '💬', title: 'Direct Chat', desc: 'Message our lab staff directly with any question — no phone queues, no waiting rooms.' },
    { icon: '📍', title: 'Multiple Branches', desc: `${branchCount || '20+'} conveniently located branches across the region, all using the same unified platform.` },
  ];

  const team = [
    { name: 'Dr. Sarah Al-Amin', role: 'Chief Medical Officer', avatar: 'S', color: 'var(--teal-500)' },
    { name: 'Dr. Omar Khalil', role: 'Head of Hematology', avatar: 'O', color: '#3b82f6' },
    { name: 'Dr. Lina Nasser', role: 'Biochemistry Lead', avatar: 'L', color: '#8b5cf6' },
    { name: 'Dr. Ahmad Saleh', role: 'Microbiology Expert', avatar: 'A', color: '#f59e0b' },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--gray-50)', minHeight: '100vh' }}>

      {/* Responsive styles for HomePage */}
      <style>{`
        .hp-nav-links { display: flex; align-items: center; gap: 32px; }
        .hp-section-pad { padding: 96px 40px; }
        .hp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 768px) {
          .hp-nav-links { display: none; }
          .hp-section-pad { padding: 60px 20px; }
          .hp-about-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 480px) {
          .hp-section-pad { padding: 48px 16px; }
        }
      `}</style>

      {/* ═══ STICKY NAV ════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: scrolled ? 'rgba(10,22,40,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 300ms ease',
        padding: '0 20px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧬</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
            e<span style={{ color: 'var(--teal-500)' }}>Lab</span>
          </span>
        </div>
        {/* Links */}
        <div className="hp-nav-links">
          <NavLink href="#about">About</NavLink>
          <NavLink href="#features">Services</NavLink>
          <NavLink href="#offers">Offers</NavLink>
          <NavLink href="#tests">Tests</NavLink>
          <NavLink href="#team">Team</NavLink>
        </div>
        {/* CTA */}
        <button onClick={onLogin} className="btn btn-primary" style={{ fontSize: 13.5, padding: '8px 20px' }}>
          Sign In
        </button>
      </nav>

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--navy-950) 0%, var(--navy-800) 50%, #0a2a1e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '100px 20px 60px',
      }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,201,167,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,201,167,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,167,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820 }}>
          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, background: 'var(--teal-500)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12.5, color: 'var(--teal-500)', fontWeight: 600, letterSpacing: 0.5 }}>Now live — AI-powered results analysis</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px,7vw,80px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 24, letterSpacing: -1.5 }}>
            Your Health.<br />
            <span style={{ background: 'linear-gradient(90deg, var(--teal-500), #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Crystal Clear.
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 40px' }}>
            eLab is a modern medical laboratory platform — book tests, get fast results, chat with specialists, and let our AI explain everything in plain language.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onLogin} className="btn btn-primary btn-lg" style={{ padding: '14px 36px', fontSize: 15.5, fontWeight: 600, boxShadow: 'var(--shadow-teal)' }}>
              Get Started Free →
            </button>
            <a href="#about" className="btn btn-outline btn-lg" style={{ padding: '14px 36px', fontSize: 15.5, color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)' }}>
              Learn More
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 72, flexWrap: 'wrap' }}>
            {[
              { value: 500, suffix: '+', label: 'Tests Available' },
              { value: branchCount || 20, suffix: '+', label: 'Lab Branches' },
              { value: 24, suffix: 'h', label: 'Max Turnaround' },
              { value: 99, suffix: '%', label: 'Accuracy Rate' },
            ].map((s, i, arr) => (
              <div key={i} style={{ flex: '1 1 140px', textAlign: 'center', padding: '24px 32px', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontWeight: 500, letterSpacing: 0.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
          <span style={{ fontSize: 11, color: 'white', letterSpacing: 1.5, textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(white, transparent)' }} />
        </div>
      </section>

      {/* ═══ ABOUT ══════════════════════════════════════════════ */}
      <section id="about" style={{ background: 'white' }} className="hp-section-pad">
        <div className="hp-about-grid">
          {/* Left: visual */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 100%)', borderRadius: 24, padding: 40, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(var(--teal-glow-lg), transparent 70%)' }} />
              {/* Mock UI card */}
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--teal-500)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Latest Result</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>Complete Blood Count</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Reviewed by Dr. Sarah · 2 hours ago</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {['Hemoglobin ✓', 'WBC ✓', 'Platelets ⚠️'].map(p => (
                    <span key={p} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: p.includes('⚠️') ? 'rgba(245,158,11,0.15)' : 'rgba(0,201,167,0.12)', color: p.includes('⚠️') ? 'var(--amber-500)' : 'var(--teal-500)', fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-glow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    "Your platelet count is slightly low. This is common and often temporary — I recommend discussing with your doctor."
                  </div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>eLab AI Assistant</div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -20, left: -20, background: 'white', borderRadius: 16, padding: '12px 18px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 22 }}>🏆</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)' }}>ISO Certified</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>ISO 15189 Accredited</div>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <div style={{ display: 'inline-block', background: 'var(--teal-glow)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: 0.5, marginBottom: 20 }}>
              About eLab
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,42px)', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.2, marginBottom: 20 }}>
              Precision medicine,<br />digitally delivered.
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: 16 }}>
              Founded to close the gap between patients and their lab data, eLab combines ISO-certified laboratory science with a modern digital platform that makes your health information truly accessible.
            </p>
            <p style={{ fontSize: 15.5, color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: 32 }}>
              From booking a blood test to getting an AI-powered breakdown of your results, every step is designed to be transparent, fast, and human.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Certified pathologists review every result before release',
                'Real-time updates and notifications on your test progress',
                'Secure patient portal accessible from any device',
                'AI assistant trained on clinical reference ranges',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal-glow-lg)', border: '1.5px solid var(--teal-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ color: 'var(--teal-500)', fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14.5, color: 'var(--gray-600)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES / SERVICES ════════════════════════════════ */}
      <section id="features" style={{ background: 'var(--gray-50)' }} className="hp-section-pad">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'var(--teal-glow)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: 0.5, marginBottom: 16 }}>
              Our Services
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>
              Everything you need, nothing you don't
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--gray-400)', maxWidth: 520, margin: '0 auto' }}>
              A complete digital laboratory experience, built around your needs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: 28, transition: 'all 250ms ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--gray-500)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OFFERS ══════════════════════════════════════════════ */}
      <section id="offers" style={{ background: 'var(--navy-900)', position: 'relative', overflow: 'hidden' }} className="hp-section-pad">
        <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(var(--teal-glow-lg), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(rgba(59,130,246,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--teal-500)', letterSpacing: 0.5, marginBottom: 16 }}>
              🎁 Active Promotions
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
              Special Offers
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto' }}>
              Take advantage of our current promotions and save on your next lab tests.
            </p>
          </div>

          {offersLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span className="spinner spinner-lg" style={{ borderTopColor: 'var(--teal-500)' }} />
            </div>
          ) : activeOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
              No active offers at the moment. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {activeOffers.map((offer, i) => {
                const daysLeft = Math.ceil((new Date(offer.endDate) - new Date()) / 86400000);
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden', transition: 'all 250ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,201,167,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}>
                    {/* Discount badge */}
                    <div style={{ position: 'absolute', top: 20, right: 20, background: 'var(--teal-500)', color: 'white', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 800 }}>
                      -{offer.discountPercent}%
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>🎫</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, fontWeight: 700, color: 'white', marginBottom: 8, paddingRight: 60 }}>
                      {offer.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        <span>📅</span>
                        <span>Valid until {new Date(offer.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 999, background: daysLeft <= 3 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)', color: daysLeft <= 3 ? 'var(--red-500)' : 'var(--green-500)', fontWeight: 600 }}>
                        {daysLeft <= 0 ? 'Expires today' : `${daysLeft}d left`}
                      </span>
                      <button onClick={onLogin} className="btn btn-primary btn-sm">
                        Claim Offer →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={onLogin} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
              Sign in to see all offers →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TEST CATALOG PREVIEW ══════════════════════════════ */}
      <section id="tests" style={{ background: 'white' }} className="hp-section-pad">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'var(--teal-glow)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: 0.5, marginBottom: 16 }}>
              Test Catalog
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>
              500+ tests available
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--gray-400)', maxWidth: 480, margin: '0 auto' }}>
              From routine bloodwork to specialized panels — browse a sample of our catalog.
            </p>
          </div>

          {testsLoading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner spinner-lg" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {featuredTests.map((t, i) => (
                <div key={i} className="card" style={{ padding: 22, display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'all 250ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔬</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>{t.name}</div>
                    {t.category && (
                      <span className="badge badge-teal" style={{ fontSize: 10.5, marginBottom: 6, display: 'inline-flex' }}>{t.category}</span>
                    )}
                    {t.description && (
                      <p style={{ fontSize: 12.5, color: 'var(--gray-400)', lineHeight: 1.5, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {t.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      {t.sampleType && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>🩸 {t.sampleType}</span>}
                      {t.turnaroundHours && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>⏱ {t.turnaroundHours}h</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={onLogin} className="btn btn-primary" style={{ padding: '12px 32px' }}>
              View Full Catalog →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TEAM ════════════════════════════════════════════════ */}
      <section id="team" style={{ background: 'var(--gray-50)' }} className="hp-section-pad">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'var(--teal-glow)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: 0.5, marginBottom: 16 }}>
              Our Team
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>
              Experts behind every result
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--gray-400)', maxWidth: 480, margin: '0 auto' }}>
              Our certified pathologists and specialists review every test with precision.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 20 }}>
            {team.map((m, i) => (
              <div key={i} className="card" style={{ padding: 28, textAlign: 'center', transition: 'all 250ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 auto 16px' }}>
                  {m.avatar}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy-900) 0%, #0a2a1e 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="hp-section-pad">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(var(--teal-glow), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Ready to take control of your health?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Join thousands of patients who trust eLab for accurate, fast, and transparent laboratory results.
          </p>
          <button onClick={onLogin} className="btn btn-primary btn-lg" style={{ padding: '15px 44px', fontSize: 16, fontWeight: 700, boxShadow: 'var(--shadow-teal)' }}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--navy-950)', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧬</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            e<span style={{ color: 'var(--teal-500)' }}>Lab</span>
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          © {new Date().getFullYear()} eLab. All rights reserved. ISO 15189 Accredited Medical Laboratory.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <span key={link} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 150ms' }}
              onMouseEnter={e => e.target.style.color = 'var(--teal-500)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
              {link}
            </span>
          ))}
        </div>
      </footer>

      {/* pulse animation for hero dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
