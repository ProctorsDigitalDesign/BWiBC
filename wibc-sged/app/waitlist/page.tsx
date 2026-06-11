'use client'

import { useState } from 'react'
import { submitInterest } from './actions'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setErrorMsg(null)

    const result = await submitInterest(formData)

    if (result.error) {
      setErrorMsg(result.error)
      setIsSubmitting(false)
    } else {
      setIsSuccess(true)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {isSuccess ? (
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <div className="intake-icon" style={{ margin: '0 auto 1.5rem', display: 'flex' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2>Thank you!</h2>
            <p className="text-muted" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
              Your interest has been registered. We will notify you when you can enter.
            </p>
          </div>
        ) : (
          <>
            <div className="intake-header">
              <h2>Register Your Interest</h2>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                Please provide your details below to join the waitlist.
              </p>
            </div>

            {errorMsg && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form action={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="surname" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    className="form-input"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="company" className="form-label">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-input"
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="position" className="form-label">Position / Job Title</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="form-input"
                  placeholder="Enter your job title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your work email"
                  required
                />
              </div>

              <div className="form-nav" style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register Interest'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
