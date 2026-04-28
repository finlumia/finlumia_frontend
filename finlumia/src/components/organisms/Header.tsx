import { useState } from 'react'
import { Button } from '../atoms/Button'
import { Logo } from '../atoms/Logo'
import { NavMenu } from '../molecules/NavMenu'
import type { NavigationItem } from '../../shared/types/navigation'
import './Header.css'

type HeaderProps = {
  menuItems: NavigationItem[]
}

/**
 * Cabecalho principal da aplicacao.
 * Controla o menu responsivo e expoe botoes de acesso rapido.
 */
export function Header({ menuItems }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__content">
        <Logo />

        <button
          aria-label="Abrir menu"
          className="header__menu-toggle"
          onClick={() => setIsMobileOpen((prevState) => !prevState)}
          type="button"
        >
          ☰
        </button>

        <NavMenu items={menuItems} />

        <div className="header__actions">
          <Button to="/login" variant="ghost">
            Entrar
          </Button>
          <Button to="/cadastro">Criar conta gratis</Button>
        </div>
      </div>
      <NavMenu items={menuItems} isOpen={isMobileOpen} onNavigate={() => setIsMobileOpen(false)} />
    </header>
  )
}
