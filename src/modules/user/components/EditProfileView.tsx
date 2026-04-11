'use client'

import '@/styles/design.css'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, User, Loader2 } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import Input from '@/components/common/Input/Input'
import dynamic from 'next/dynamic'
const ImageUploader = dynamic(() => import('@/components/common/ImageUploader/ImageUploader'), { ssr: false, loading: () => null })
import type { AuthUser } from '@/modules/auth/types'

export interface EditProfileViewProps {
  user: AuthUser | null
  form: { name: string; email: string; phoneNumber: string }
  onFormChange: (k: string, v: string) => void
  photoPreview: string
  onDrop: (files: File[]) => void
  onRemovePhoto: () => void
  isPending: boolean
  onSubmit: () => void
}

export default function EditProfileView({
  user,
  form,
  onFormChange,
  photoPreview,
  onDrop,
  onRemovePhoto,
  isPending,
  onSubmit,
}: EditProfileViewProps) {
  const avatar = photoPreview || user?.photo || ''

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '40px 24px' }}>

        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Link href="/account/my-profile" style={{ width: 38, height: 38, borderRadius: '50%', background: '#eff4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a14b4', textDecoration: 'none' }}>
            <ArrowLeft size={17} />
          </Link>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>Account</div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, fontWeight: 800, color: '#0b1c30', margin: 0 }}>Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit() }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(11,28,48,0.07)', display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Photo */}
            <ImageUploader
              variant="avatar"
              previewUrl={avatar}
              onFileSelect={(file) => onDrop([file])}
              onRemove={onRemovePhoto}
              hint="PNG, JPG or GIF"
              maxSizeMb={2}
            />

            {/* Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              leftIcon={<User size={15} color="#9ca3af" />}
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="name@campus.edu"
              value={form.email}
              onChange={(e) => onFormChange('email', e.target.value)}
              leftIcon={<Mail size={15} color="#9ca3af" />}
              required
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phoneNumber}
              onChange={(e) => onFormChange('phoneNumber', e.target.value)}
              leftIcon={<Phone size={15} color="#9ca3af" />}
            />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #f0f2f8' }}>
              <Link href="/account/my-profile" style={{ padding: '12px 24px', background: 'none', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 600, color: '#6b7280', cursor: 'pointer', borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Cancel
              </Link>
              <button type="submit" disabled={isPending} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#2a14b4,#4338ca)', color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {isPending ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : 'Save Changes'}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </div>
        </form>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 16 }}>
          <div style={{ background: 'rgba(134,242,228,0.25)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14, color: '#006a61', marginBottom: 3 }}>Verification Badge</div>
              <div style={{ fontSize: 12, color: '#006a61', opacity: 0.8 }}>Your account is verified for the School of Design.</div>
            </div>
            <span style={{ fontSize: 28, color: '#006a61' }}>✓</span>
          </div>
          <div style={{ background: '#ffddb8', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>ℹ</div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 12, color: '#553300', lineHeight: 1.4, margin: 0 }}>Public profiles are visible to all students.</p>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
