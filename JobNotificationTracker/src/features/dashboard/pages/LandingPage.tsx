import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="page-shell">
      <section className="page-content landing-content">
        <h1 className="landing-title">Stop Missing The Right Jobs.</h1>
        <p className="landing-subtext">Precision-matched job discovery delivered daily at 9AM.</p>
        <Link to="/settings" className="cta-button">
          Start Tracking
        </Link>
      </section>
    </main>
  );
}
