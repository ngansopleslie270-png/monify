import { Link } from 'react-router-dom';

/**
 * HomePage – Phase 0
 * Page d'accueil Monify avec branding complet.
 * Affiche le logo, les fonctionnalités clés et les liens vers
 * Connexion / Inscription (actifs en Phase 1).
 */
export default function HomePage() {
  const features = [
    { icon: '📊', title: 'Suivi en temps réel', desc: 'Ventes & dépenses instantanées' },
    { icon: '🏪', title: 'Gestion de caisse', desc: 'Encaissements simplifiés' },
    { icon: '📈', title: 'Statistiques', desc: 'Rapports financiers clairs' },
    { icon: '🔒', title: 'Hors-ligne', desc: 'Toujours disponible' },
  ];

  const categories = [
    { icon: '🍎', label: 'Alimentation', color: '#E8F5E9' },
    { icon: '🥤', label: 'Boissons',     color: '#E3F2FD' },
    { icon: '👗', label: 'Vêtements',    color: '#F3E5F5' },
    { icon: '📱', label: 'Électronique', color: '#FFF3E0' },
    { icon: '💄', label: 'Cosmétiques',  color: '#FCE4EC' },
    { icon: '👜', label: 'Accessoires',  color: '#EFEBE9' },
  ];

  return (
    <div className="page-content animate-fade-in">

      {/* ── Header ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem 0.75rem',
        background: 'var(--monify-surface)',
        borderBottom: '1px solid var(--monify-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--monify-primary) 0%, var(--monify-primary-dark) 100%)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>🏪</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--monify-primary)' }}>MONIFY</span>
            <span className="badge badge-pro" style={{ marginLeft: 6 }}>PRO</span>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
          Connexion
        </button>
      </header>

      {/* ── Hero Banner ── */}
      <section style={{ padding: '1.25rem 1.25rem 0' }}>
        <div className="card-hero animate-slide-up" style={{
          backgroundImage: 'linear-gradient(135deg, rgba(196,98,45,0.92) 0%, rgba(100,40,10,0.95) 100%)',
          minHeight: 160,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          {/* Éléments décoratifs */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80") center/cover',
            opacity: 0.15, borderRadius: 'inherit',
          }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>
              🏪 Espace Commerçant & Ventes
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
              L'allié financier<br />de votre commerce 👋
            </h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              Gérez vos encaissements et dettes clients en FCFA.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats résumé ── */}
      <section style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted text-xs" style={{ marginBottom: 4 }}>💰 VENTES</p>
            <p style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--monify-success)' }}>
              1 285 000
            </p>
            <p className="text-xs text-muted">FCFA ce mois</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted text-xs" style={{ marginBottom: 4 }}>💸 DÉPENSES</p>
            <p style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--monify-danger)' }}>
              485 000
            </p>
            <p className="text-xs text-muted">FCFA ce mois</p>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section style={{ padding: '0 1.25rem 1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem',
          color: 'var(--monify-text-secondary)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontSize: '0.7rem' }}>
          Ce que vous gérez avec Monify
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem',
              animationDelay: `${i * 0.08}s`,
            }}>
              <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{f.title}</p>
                <p className="text-muted" style={{ fontSize: '0.7rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catégories disponibles ── */}
      <section style={{ padding: '0 1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Catégories prêtes</h2>
          <span className="badge badge-vente">8 ventes · 8 charges</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((c, i) => (
            <div key={i} style={{
              background: c.color,
              borderRadius: 8, padding: '0.4rem 0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--monify-text-primary)',
            }}>
              <span>{c.icon}</span> {c.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 1.25rem 1.5rem' }}>
        <div className="card" style={{
          background: 'var(--monify-surface-alt)',
          border: '1px dashed var(--monify-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
            Prêt à gérer votre commerce ?
          </p>
          <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
            Créez votre compte gratuitement en 2 minutes.
          </p>
          {/* Bouton actif en Phase 1 */}
          <button className="btn btn-primary" style={{ marginBottom: '0.75rem' }}>
            🏪 Créer mon compte →
          </button>
          <p className="text-sm">
            Déjà commerçant ?{' '}
            <span style={{ color: 'var(--monify-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Se connecter à ma caisse
            </span>
          </p>
        </div>
      </section>

      {/* ── Garanties ── */}
      <section style={{
        background: 'var(--monify-surface-alt)',
        borderTop: '1px solid var(--monify-border-light)',
        padding: '1.25rem',
        marginBottom: '0.5rem',
      }}>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--monify-text-muted)', marginBottom: '0.75rem' }}>
          Garanties Monify Commerce
        </p>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-item__icon">⬆️</span>
            <span className="feature-item__title">100% Hors-ligne</span>
            <span className="feature-item__desc">Toujours dispo</span>
          </div>
          <div className="feature-item">
            <span className="feature-item__icon">🔒</span>
            <span className="feature-item__title">Données Protégées</span>
            <span className="feature-item__desc">Chiffrement total</span>
          </div>
          <div className="feature-item">
            <span className="feature-item__icon">☁️</span>
            <span className="feature-item__title">Sauvegarde cloud</span>
            <span className="feature-item__desc">Active en continu</span>
          </div>
          <div className="feature-item">
            <span className="feature-item__icon">📱</span>
            <span className="feature-item__title">Multi-appareils</span>
            <span className="feature-item__desc">Sync automatique</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: '1rem 1.25rem calc(var(--bottom-nav-height) + 1rem)',
        borderTop: '1px solid var(--monify-border-light)',
        background: 'var(--monify-surface)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem',
          fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--monify-primary)', cursor: 'pointer' }}>
            📞 Support (+237)
          </span>
          <span style={{ color: '#25D366', cursor: 'pointer' }}>
            💬 Aide WhatsApp
          </span>
          <span className="text-muted" style={{ cursor: 'pointer' }}>Confidentialité</span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.65rem' }}>
          © 2025 Monify Technologies Inc. • Caisse & Gestion de proximité
        </p>
        <p style={{ fontSize: '0.6rem', marginTop: 4, color: 'var(--monify-success)', fontWeight: 600 }}>
          ☁️ Sauvegarde cloud active • Mode hors-ligne prêt
        </p>
      </footer>

      {/* ── Bottom Navigation (placeholder Phase 0) ── */}
      <nav className="bottom-nav">
        {[
          { icon: '🏠', label: 'Accueil', active: true },
          { icon: '💳', label: 'Encaisser' },
          { icon: '+', label: '', fab: true },
          { icon: '🛍️', label: 'Ventes' },
          { icon: '☰', label: 'Comptes' },
        ].map((item, i) =>
          item.fab ? (
            <button key={i} className="fab">＋</button>
          ) : (
            <button key={i} className={`bottom-nav__item ${item.active ? 'active' : ''}`}>
              <span className="bottom-nav__icon">{item.icon}</span>
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          )
        )}
      </nav>
    </div>
  );
}
