import { Link } from 'react-router-dom'
import { Button } from '../atoms/Button'
import { AuthFormShell } from '../molecules/AuthFormShell'

/**
 * Tela inicial do fluxo de recuperacao de senha.
 * Coleta e-mail e direciona para o envio de codigo.
 */
export function RecoveryPage() {
  return (
    <AuthFormShell
      description="Informe seu e-mail para receber o codigo de verificacao."
      title="Recuperar senha"
    >
      <form>
        <label htmlFor="email-recovery">Endereco de e-mail</label>
        <input id="email-recovery" name="email-recovery" placeholder="exemplo@finlumia.com" type="email" />

        <Button fullWidth type="submit">
          Enviar codigo
        </Button>
      </form>
      <p>
        <Link to="/login">Voltar para login</Link>
      </p>
    </AuthFormShell>
  )
}
