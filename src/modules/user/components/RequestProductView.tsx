'use client'

import '@/styles/design.css'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { LISTED_CATEGORIES, CATEGORY_LABEL, type ListedProductCategory } from '@/modules/marketplace/types'
import Loader from '@/components/common/Loader/Loader'

const inp = { width: '100%', padding: '13px 16px', background: '#eff4ff', border: 'none', borderRadius: 12, fontSize: 14, color: '#0b1c30', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' as const }
const lbl = { fontSize: 13, fontWeight: 600, color: '#0b1c30', marginBottom: 6, display: 'block' }

export interface RequestProductViewProps {
  form: { name: string; category: ListedProductCategory; priceFrom: number; priceTo: number; isNegotiable: boolean; description: string; email: string; phoneNo: string }
  onFormChange: (k: string, v: unknown) => void
  images: { file: File; preview: string }[]
  onDrop: (files: File[]) => void
  onRemoveImage: (i: number) => void
  isPending: boolean
  onSubmit: () => void
}

export default function RequestProductView({
  form,
  onFormChange,
  images,
  onDrop,
  onRemoveImage,
  isPending,
  onSubmit,
}: RequestProductViewProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
    disabled: images.length >= 5,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '48px 32px', display: 'flex', gap: 48, alignItems: 'start' }}>

        {/* Left info panel */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <span style={{ display: 'inline-block', background: '#dcfce7', color: '#006a61', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 20, marginBottom: 20 }}>The Atelier Marketplace</span>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 34, fontWeight: 800, lineHeight: 1.05, color: '#0b1c30', marginBottom: 14 }}>Sourcing for<br /><em style={{ color: '#2a14b4' }}>Innovation.</em></h1>
          <p style={{ fontSize: 14, color: '#464554', lineHeight: 1.65, marginBottom: 24 }}>Can&apos;t find what you need? Post a request and let the right product find you.</p>
          {[
            { title: 'Network Reach', sub: 'Broadcasted to 5,000+ active campus members instantly.' },
            { title: 'Secure Trading', sub: 'All responders are verified for safe transactions.' },
          ].map((c) => (
            <div key={c.title} style={{ background: '#eff4ff', borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#464554', lineHeight: 1.5 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ flex: 1, background: 'white', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(11,28,48,0.07)' }}>
          <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit() }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div><label style={lbl}>Product name</label><input style={inp} type="text" placeholder="What are you looking for?" value={form.name} onChange={(e) => onFormChange('name', e.target.value)} required /></div>

            <div>
              <label style={lbl}>Category</label>
              <select style={{ ...inp, appearance: 'none' as const }} value={form.category} onChange={(e) => onFormChange('category', e.target.value as ListedProductCategory)} required>
                {LISTED_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Min Price ($)</label><input style={inp} type="number" placeholder="0" min={0} value={form.priceFrom || ''} onChange={(e) => onFormChange('priceFrom', Number(e.target.value))} /></div>
              <div><label style={lbl}>Max Price ($)</label><input style={inp} type="number" placeholder="1000" min={0} value={form.priceTo || ''} onChange={(e) => onFormChange('priceTo', Number(e.target.value))} /></div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isNegotiable} onChange={(e) => onFormChange('isNegotiable', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2a14b4' }} />
              Open to Negotiation
            </label>

            <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'none', height: 100 } as React.CSSProperties} placeholder="Specific requirements, condition preferences, urgency..." value={form.description} onChange={(e) => onFormChange('description', e.target.value)} required /></div>

            {/* Dropzone */}
            <div>
              <label style={lbl}>Images (min 1, max 5)</label>
              <div
                {...getRootProps()}
                style={{ background: isDragActive ? '#e0e7ff' : '#f0f4ff', borderRadius: 12, border: `2px dashed ${isDragActive ? '#2a14b4' : '#c7c4d7'}`, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: images.length >= 5 ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'all 0.15s', opacity: images.length >= 5 ? 0.5 : 1 }}
              >
                <input {...getInputProps()} />
                <UploadCloud size={28} color="#2a14b4" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0b1c30', marginBottom: 2 }}>{isDragActive ? 'Drop here' : 'Drag & drop or click to browse'}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{images.length}/5 uploaded</div>
              </div>
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <div key={img.preview} style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#e5e7eb' }}>
                      <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => onRemoveImage(i)} type="button" style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && <p style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600, marginTop: 6 }}>⚠ At least 1 image is required.</p>}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: '#2a14b4', marginBottom: 14 }}>Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={lbl}>Phone number</label><input style={inp} type="tel" placeholder="+1 (555) 000-0000" value={form.phoneNo} onChange={(e) => onFormChange('phoneNo', e.target.value)} required /></div>
                <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="name@campus.edu" value={form.email} onChange={(e) => onFormChange('email', e.target.value)} required /></div>
              </div>
            </div>

            <button type="submit" disabled={isPending || images.length === 0} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#2a14b4,#4338ca)', color: 'white', border: 'none', borderRadius: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: isPending || images.length === 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isPending ? <><Loader size={20} /> Posting…</> : 'Request Product'}
            </button>

          </form>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
