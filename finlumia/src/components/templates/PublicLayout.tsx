import { Outlet } from 'react-router-dom'
import { Header } from '../organisms/Header'
import { Footer } from '../organisms/Footer'
import { HEADER_NAV_ITEMS } from '../../shared/constants/navigation'
import './PublicLayout.css'

/**
 * Template base para paginas publicas.
 * Encapsula header, area de conteudo via Outlet e footer.
 */
export function PublicLayout() {
  return (
    <div className="public-layout">
      <Header menuItems={HEADER_NAV_ITEMS} />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
