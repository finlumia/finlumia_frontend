import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../../shared/types/navigation'
import './NavMenu.css'

type NavMenuProps = {
  items: NavigationItem[]
  isOpen?: boolean
  onNavigate?: () => void
}

/**
 * Menu de navegacao reutilizavel para desktop/mobile.
 * Dispara onNavigate para fechar drawer mobile apos clique.
 */
export function NavMenu({ items, isOpen = true, onNavigate }: NavMenuProps) {
  return (
    <nav className={`nav-menu${isOpen ? ' nav-menu--open' : ''}`}>
      {items.map((item) => (
        <NavLink
          key={item.label}
          className={({ isActive }) => `nav-menu__item${isActive ? ' nav-menu__item--active' : ''}`}
          onClick={onNavigate}
          to={item.path}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
