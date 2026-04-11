'use client'

import '@/styles/design.css'
import { Lightbulb, ShieldCheck } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import Loader from '@/components/common/Loader/Loader'
import Input from '@/components/common/Input/Input'
import dynamic from 'next/dynamic'
const ImageUploader = dynamic(() => import('@/components/common/ImageUploader/ImageUploader'), { ssr: false, loading: () => null })
import {
  LISTED_CATEGORIES, LISTED_CONDITIONS,
  CATEGORY_LABEL,
  type ListedProductCategory,
  type ListedProductCondition,
} from '@/modules/marketplace/types'

const lbl = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6b7280', marginBottom: 6, display: 'block' }

export interface ListProductViewProps {
  form: { productName: string; category: ListedProductCategory; price: string; description: string; condition: ListedProductCondition; yearUsed: number; isNegotiable: boolean; email: string; phoneNo: string }
  onFormChange: (k: string, v: unknown) => void
  images: { file: File; preview: string }[]
  onDrop: (files: File[]) => void
  onRemoveImage: (i: number) => void
  isPending: boolean
  onSubmit: () => void
}

export default function ListProductView({
  form,
  onFormChange,
  images,
  onDrop,
  onRemoveImage,
  isPending,
  onSubmit,
}: ListProductViewProps) {

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '40px 32px' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 36, fontWeight: 800, color: '#0b1c30', marginBottom: 6 }}>Market Your Craft</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Turn your essentials into value. List your product in the Campus Next marketplace.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(11,28,48,0.07)' }}>
            <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit() }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <Input label="Product Name" type="text" placeholder="e.g. Advanced Calculus Textbook" value={form.productName} onChange={(e) => onFormChange('productName', e.target.value)} required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select style={{ width: '100%', padding: '13px 16px', background: '#f3f5fb', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#0b1c30', fontFamily: "'Inter',sans-serif", outline: 'none', appearance: 'none' as const }} value={form.category} onChange={(e) => onFormChange('category', e.target.value as ListedProductCategory)} required>
                    {LISTED_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                  </select>
                </div>
                <Input label="Price ($)" type="number" min={0} step="0.01" placeholder="0.00" value={form.price} onChange={(e) => onFormChange('price', e.target.value)} required />
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea style={{ width: '100%', padding: '13px 16px', background: '#f3f5fb', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#0b1c30', fontFamily: "'Inter',sans-serif", outline: 'none', resize: 'none', height: 90, boxSizing: 'border-box' as const }} placeholder="Condition, features, why it's a great find..." value={form.description} onChange={(e) => onFormChange('description', e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Condition</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {LISTED_CONDITIONS.map((c) => (
                      <button key={c} type="button" onClick={() => onFormChange('condition', c)} style={{ flex: 1, padding: '10px 4px', background: form.condition === c ? '#2a14b4' : '#e5eeff', color: form.condition === c ? 'white' : '#0b1c30', border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {c === 'NEW' ? 'New' : c === 'USED' ? 'Used' : 'Refurb'}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Years Used" type="number" min={0} value={form.yearUsed} onChange={(e) => onFormChange('yearUsed', Number(e.target.value))} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isNegotiable} onChange={(e) => onFormChange('isNegotiable', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2a14b4' }} />
                Open to Negotiation
              </label>

              <div style={{ background: '#f8f9ff', borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Contact Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={form.phoneNo} onChange={(e) => onFormChange('phoneNo', e.target.value)} required />
                  <Input label="Email Address" type="email" placeholder="student@university.edu" value={form.email} onChange={(e) => onFormChange('email', e.target.value)} required />
                </div>
              </div>

              {images.length === 0 && (
                <p style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>⚠ At least 1 image is required.</p>
              )}

              <button type="submit" disabled={isPending || images.length === 0} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#2a14b4,#4338ca)', color: 'white', border: 'none', borderRadius: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: isPending || images.length === 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isPending ? <><Loader size={20} /> Listing…</> : 'Add Product to Market'}
              </button>

            </form>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

            <ImageUploader
              label="Product Images (min 1, max 5)"
              hint="PNG, JPG, WEBP"
              maxSizeMb={10}
              onFileSelect={(file) => onDrop([file])}
              onRemove={() => onRemoveImage(0)}
              previewUrl={images[0]?.preview}
            />

            {images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {images.slice(1).map((img, i) => (
                  <div key={img.preview} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: '#e5e7eb' }}>
                    <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => onRemoveImage(i + 1)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#ffddb8', borderRadius: 14, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Lightbulb size={18} color="#553300" style={{ flexShrink: 0, marginTop: 2 }} />
              <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13, color: '#553300', marginBottom: 3 }}>Quality matters</div><div style={{ fontSize: 12, color: '#653e00', lineHeight: 1.5 }}>Listings with clear photos sell 3× faster.</div></div>
            </div>

            <div style={{ background: 'rgba(134,242,228,0.35)', borderRadius: 14, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="#006a61" style={{ flexShrink: 0, marginTop: 2 }} />
              <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13, color: '#006a61', marginBottom: 3 }}>Stay Safe</div><div style={{ fontSize: 12, color: '#005049', lineHeight: 1.5 }}>Always meet in public campus zones during daylight.</div></div>
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
