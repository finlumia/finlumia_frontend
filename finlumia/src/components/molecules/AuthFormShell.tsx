import type { ReactNode } from 'react'
import { Logo } from '../atoms/Logo'
import './AuthFormShell.css'

type AuthFormShellProps = {
  title: string
  description: string
  children: ReactNode
}

/**
 * Casca visual padrao para telas de autenticacao.
 * Recebe conteudo dinamico para login, cadastro e recuperacao.
 */
export function AuthFormShell({ title, description, children }: AuthFormShellProps) {
  return (
    <section className="auth-shell">
      <div className="auth-shell__card">
        <Logo />
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  )
}
