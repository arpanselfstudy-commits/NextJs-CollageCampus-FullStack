import { AlertCircle } from 'lucide-react'

interface Props {
  message?: string
}

export default function FormError({ message }: Props) {
  if (!message) return null
  return (
    <p className="form-error">
      <AlertCircle size={12} /> {message}
    </p>
  )
}
