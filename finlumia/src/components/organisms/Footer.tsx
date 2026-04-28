import { Link } from 'react-router-dom'
import './Footer.css'

/**
 * Rodape padrao compartilhado entre paginas publicas.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <small>© 2026 FINLUMIA</small>
        <nav className="footer__links">
          <Link to="/#planos">Planos</Link>
          <Link to="/#recursos">Recursos</Link>
          <Link to="/recuperar-senha">Suporte</Link>
        </nav>
      </div>
    </footer>
  )
}
