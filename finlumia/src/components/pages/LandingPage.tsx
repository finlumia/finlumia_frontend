import { Button } from '../atoms/Button'
import './LandingPage.css'

/**
 * Landing page institucional com CTAs para fluxo de autenticacao.
 */
export function LandingPage() {
  return (
    <section className="landing-page">
      <header className="landing-page__hero">
        <span className="landing-page__tag">Plataforma financeira para empresas</span>
        <h1>Clareza financeira para decisoes mais inteligentes</h1>
        <p>
          Centralize seus indicadores, identifique riscos e tome decisoes com seguranca em um
          painel moderno e responsivo.
        </p>

        <div className="landing-page__actions">
          <Button to="/cadastro">Comecar gratuitamente</Button>
          <Button to="/login" variant="ghost">
            Entrar na plataforma
          </Button>
          <Button to="/recuperar-senha" variant="ghost">
            Recuperar senha
          </Button>
        </div>
      </header>

      <section className="landing-page__grid" id="recursos">
        <article>
          <h2>Importacao de dados</h2>
          <p>Conecte SQL, API e planilhas sem duplicar processamento.</p>
        </article>
        <article>
          <h2>Analise inteligente</h2>
          <p>Monitoramento por categoria e alertas de variacao.</p>
        </article>
        <article>
          <h2>Dashboards em tempo real</h2>
          <p>Visualize os principais indicadores do negocio em uma unica tela.</p>
        </article>
      </section>
    </section>
  )
}
