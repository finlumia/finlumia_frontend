import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../../components/pages/LandingPage'
import { ThemeProvider } from '../../shared/styles/theme.context'
import '../../shared/styles/theme.css'
import '../../shared/styles/responsive.css'

/**
 * Mapa central de rotas da aplicacao.
 * Concentra o roteamento para facilitar manutencao e expansao.
 */
export function AppRouter() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<LandingPage />} path="/">
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </ThemeProvider>
  )
}
