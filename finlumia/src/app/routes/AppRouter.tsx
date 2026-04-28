import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../../components/templates/PublicLayout'
import { ConfiguratorPage } from '../../components/pages/ConfiguratorPage'
import { LandingPage } from '../../components/pages/LandingPage'
import { LoginPage } from '../../components/pages/LoginPage'
import { RecoveryPage } from '../../components/pages/RecoveryPage'
import { RegisterPage } from '../../components/pages/RegisterPage'

/**
 * Mapa central de rotas da aplicacao.
 * Concentra o roteamento para facilitar manutencao e expansao.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />} path="/">
        <Route index element={<LandingPage />} />
        <Route element={<LoginPage />} path="login" />
        <Route element={<RegisterPage />} path="cadastro" />
        <Route element={<RecoveryPage />} path="recuperar-senha" />
        <Route element={<ConfiguratorPage />} path="configurador" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
