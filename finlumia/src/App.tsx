import { AppRouter } from './app/routes/AppRouter'

/**
 * Componente raiz da UI.
 * Delega toda navegacao para o roteador da camada app.
 */
function App() {
  return <AppRouter />
}

export default App
