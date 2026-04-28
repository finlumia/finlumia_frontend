import { Link } from 'react-router-dom'
import './Logo.css'

type LogoProps = {
  subtitle?: string
  to?: string
}

/**
 * Identidade visual da aplicacao.
 * Permite customizar subtitulo e destino do link.
 */
export function Logo({ subtitle = 'Luminous Precision', to = '/' }: LogoProps) {
  return (
    <Link className="logo" to={to}>
      <span className="logo__mark" aria-hidden>
        ◆
      </span>
      <span>
        <strong className="logo__title">FINLUMIA</strong>
        <small className="logo__subtitle">{subtitle}</small>
      </span>
    </Link>
  )
}
