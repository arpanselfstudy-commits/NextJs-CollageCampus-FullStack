import AuthLogo from './AuthLogo'

interface Props {
  transparent?: boolean
}

export default function AuthFooter({ transparent }: Props) {
  return (
    <footer
      className="auth-footer"
      style={transparent ? { background: 'transparent', border: 'none' } : undefined}
    >
      <AuthLogo size={14} />
      <div className="auth-footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
      <span>© 2024 Campus Next. The Academic Atelier.</span>
    </footer>
  )
}
