import { Link } from 'react-router-dom'
import { Button } from '../atoms/Button'
import { AuthFormShell } from '../molecules/AuthFormShell'

/**
 * Tela de login.
 * Reaproveita o shell de autenticacao para manter consistencia visual.
 */
export function LoginPage() {
  return (
    <AuthFormShell
      description="Acesse sua inteligencia financeira operacional."
      title="Bem-vindo de volta"
    >
      <form>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" placeholder="nome@empresa.com" type="email" />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" placeholder="********" type="password" />

        <Button fullWidth type="submit">
          Entrar
        </Button>
      </form>
      <p>
        Nao tem conta? <Link to="/cadastro">Criar conta gratis</Link>
      </p>
    </AuthFormShell>
  )
}
