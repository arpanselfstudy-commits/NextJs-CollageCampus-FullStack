import { GraduationCap } from 'lucide-react'

interface Props {
  white?: boolean
  size?: number
}

export default function AuthLogo({ white, size = 14 }: Props) {
  return (
    <div className={`cn-logo${white ? ' cn-logo--white' : ''}`} style={{ fontSize: size }}>
      <div className="cn-logo-icon" style={white ? { background: 'rgba(255,255,255,0.2)' } : undefined}>
        <GraduationCap size={18} />
      </div>
      Campus Next
    </div>
  )
}
