import { Link } from 'react-router-dom'
import './Button.css'

type ButtonVariant = 'primary' | 'ghost' | 'danger'

type CommonProps = {
  children: string
  variant?: ButtonVariant
  fullWidth?: boolean
}

type ActionButtonProps = CommonProps & {
  to?: never
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

type LinkButtonProps = CommonProps & {
  to: string
  onClick?: never
  type?: never
}

type ButtonProps = ActionButtonProps | LinkButtonProps

/**
 * Botao base reutilizavel.
 * Renderiza <button> para acao local ou <Link> para navegacao SPA.
 */
export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const className = `btn btn--${variant}${fullWidth ? ' btn--full' : ''}`

  if ('to' in props && props.to) {
    return (
      <Link className={className} to={props.to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={className} onClick={props.onClick} type={props.type ?? 'button'}>
      {children}
    </button>
  )
}
