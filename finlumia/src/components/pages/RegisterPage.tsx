import { Link } from 'react-router-dom'
import { Button } from '../atoms/Button'
import { AuthFormShell } from '../molecules/AuthFormShell'

/**
 * Tela de cadastro de usuario.
 * Centraliza campos basicos para criacao de conta.
 */
export function RegisterPage() {
  return (
    <AuthFormShell description="Crie sua conta gratuita para iniciar." title="Crie sua conta">
      <form>
        <label htmlFor="name">Nome completo</label>
        <input id="name" name="name" placeholder="Como deseja ser chamado?" type="text" />

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" placeholder="seu@email.com" type="email" />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" placeholder="********" type="password" />

        <label htmlFor="confirm-password">Confirmar senha</label>
        <input id="confirm-password" name="confirm-password" placeholder="********" type="password" />

        <Button fullWidth type="submit">
          Criar conta
        </Button>
      </form>
      <p>
        Ja possui conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthFormShell>
  )
}
