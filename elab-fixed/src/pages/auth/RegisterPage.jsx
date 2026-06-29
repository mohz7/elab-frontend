import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

export default function RegisterPage({
  onSwitch,
}) {
  const [form, setForm] = useState({
    userName: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    identityNumber: '',
    gender: 1,
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceCompany: '',
    insuranceNumber: '',
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [step, setStep] = useState(1);

  // SHOW / HIDE PASSWORD
  const [showPassword, setShowPassword] =
    useState(false);

  const set = (field, val) =>
    setForm(p => ({
      ...p,
      [field]: val,
    }));

  // =========================
  // REGISTER
  // =========================
  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        ...form,
        gender: Number(form.gender),
      });

      toast.success(
        'Account created! Please check your email to confirm.'
      );

      onSwitch('login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );

      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ================= BRAND SIDE ================= */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="icon">🧬</div>

          <div className="text">
            e<span>Lab</span>
          </div>
        </div>

        <h1>Join eLab Today</h1>

        <p>
          Create your patient account and get
          access to all lab services online.
          Book tests, track results, and consult
          with our medical AI.
        </p>

        <div className="auth-features">
          {[
            'Secure patient portal',
            'Complete medical history',
            'Emergency contact management',
            'Insurance information storage',
            'Privacy first — HIPAA compliant',
          ].map(f => (
            <div
              className="auth-feature"
              key={f}
            >
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ================= FORM SIDE ================= */}
      <div
        className="auth-form-side"
        style={{
          overflowY: 'auto',
          alignItems: 'flex-start',
        }}
      >
        <div
          className="auth-form-wrap"
          style={{
            paddingTop: 20,
          }}
        >
          <div className="auth-form-title">
            Create Account
          </div>

          <div className="auth-form-sub">
            Step {step} of 2 —{' '}
            {step === 1
              ? 'Basic Information'
              : 'Medical Information'}
          </div>

          {/* STEP INDICATOR */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginBottom: 24,
            }}
          >
            {[1, 2].map(s => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background:
                    s <= step
                      ? 'var(--teal-500)'
                      : 'var(--gray-200)',
                  transition:
                    'background 0.3s',
                }}
              />
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={
              step === 2
                ? handleSubmit
                : e => {
                    e.preventDefault();
                    setStep(2);
                  }
            }
          >
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <>
                <div className="form-grid">
                  {/* USERNAME */}
                  <div className="form-group">
                    <label className="form-label">
                      Username *
                    </label>

                    <input
                      className="form-input"
                      placeholder="john_doe"
                      value={form.userName}
                      onChange={e =>
                        set(
                          'userName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* FULL NAME */}
                  <div className="form-group">
                    <label className="form-label">
                      Full Name *
                    </label>

                    <input
                      className="form-input"
                      placeholder="John Doe"
                      value={form.fullName}
                      onChange={e =>
                        set(
                          'fullName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="form-group form-full">
                    <label className="form-label">
                      Email *
                    </label>

                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={e =>
                        set(
                          'email',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-group form-full">
                    <label className="form-label">
                      Password *
                    </label>

                    <div
                      style={{
                        position: 'relative',
                      }}
                    >
                      <input
                        className="form-input"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={e =>
                          set(
                            'password',
                            e.target.value
                          )
                        }
                        required
                        minLength={8}
                        style={{
                          paddingRight: 45,
                        }}
                      />

                      {/* EYE ICON */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform:
                            'translateY(-50%)',
                          border: 'none',
                          background:
                            'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'center',
                          color: '#666',
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="form-group">
                    <label className="form-label">
                      Phone Number *
                    </label>

                    <input
                      className="form-input"
                      placeholder="+1234567890"
                      value={form.phoneNumber}
                      onChange={e =>
                        set(
                          'phoneNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* ID NUMBER */}
                  <div className="form-group">
                    <label className="form-label">
                      ID Number *
                    </label>

                    <input
                      className="form-input"
                      placeholder="National ID"
                      value={form.identityNumber}
                      onChange={e =>
                        set(
                          'identityNumber',
                          e.target.value
                        )
                      }
                      required
                      maxLength={9}
                    />
                  </div>

                  {/* GENDER */}
                  <div className="form-group">
                    <label className="form-label">
                      Gender *
                    </label>

                    <select
                      className="form-select"
                      value={form.gender}
                      onChange={e =>
                        set(
                          'gender',
                          Number(
                            e.target.value
                          )
                        )
                      }
                      required
                    >
                      <option value={1}>
                        Male
                      </option>

                      <option value={2}>
                        Female
                      </option>
                    </select>
                  </div>

                  {/* DATE OF BIRTH */}
                  <div className="form-group">
                    <label className="form-label">
                      Date of Birth *
                    </label>

                    <input
                      className="form-input"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e =>
                        set(
                          'dateOfBirth',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                {/* NEXT BUTTON */}
                <button
                  className="btn btn-primary btn-full btn-lg"
                  type="submit"
                  style={{
                    marginTop: 8,
                  }}
                >
                  Next: Medical Info →
                </button>
              </>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <>
                <div className="form-grid">
                  {/* BLOOD TYPE */}
                  <div className="form-group">
                    <label className="form-label">
                      Blood Type
                    </label>

                    <select
                      className="form-select"
                      value={form.bloodType}
                      onChange={e =>
                        set(
                          'bloodType',
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Unknown
                      </option>

                      {[
                        'A+',
                        'A-',
                        'B+',
                        'B-',
                        'AB+',
                        'AB-',
                        'O+',
                        'O-',
                      ].map(b => (
                        <option
                          key={b}
                          value={b}
                        >
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ALLERGIES */}
                  <div className="form-group">
                    <label className="form-label">
                      Allergies
                    </label>

                    <input
                      className="form-input"
                      placeholder="Penicillin, Pollen..."
                      value={form.allergies}
                      onChange={e =>
                        set(
                          'allergies',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* CHRONIC DISEASES */}
                  <div className="form-group form-full">
                    <label className="form-label">
                      Chronic Diseases
                    </label>

                    <input
                      className="form-input"
                      placeholder="Diabetes, Hypertension..."
                      value={
                        form.chronicDiseases
                      }
                      onChange={e =>
                        set(
                          'chronicDiseases',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* EMERGENCY CONTACT NAME */}
                  <div className="form-group">
                    <label className="form-label">
                      Emergency Contact Name
                    </label>

                    <input
                      className="form-input"
                      placeholder="Jane Doe"
                      value={
                        form.emergencyContactName
                      }
                      onChange={e =>
                        set(
                          'emergencyContactName',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* EMERGENCY CONTACT PHONE */}
                  <div className="form-group">
                    <label className="form-label">
                      Emergency Contact Phone
                    </label>

                    <input
                      className="form-input"
                      placeholder="+1234567890"
                      value={
                        form.emergencyContactPhone
                      }
                      onChange={e =>
                        set(
                          'emergencyContactPhone',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* INSURANCE COMPANY */}
                  <div className="form-group">
                    <label className="form-label">
                      Insurance Company
                    </label>

                    <input
                      className="form-input"
                      placeholder="Company name"
                      value={
                        form.insuranceCompany
                      }
                      onChange={e =>
                        set(
                          'insuranceCompany',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* INSURANCE NUMBER */}
                  <div className="form-group">
                    <label className="form-label">
                      Insurance Number
                    </label>

                    <input
                      className="form-input"
                      placeholder="Policy number"
                      value={
                        form.insuranceNumber
                      }
                      onChange={e =>
                        set(
                          'insuranceNumber',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* BUTTONS */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    ← Back
                  </button>

                  <button
                    className="btn btn-primary btn-full btn-lg"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />{' '}
                        Creating…
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* LOGIN */}
          <div className="auth-switch">
            Already have an account?{' '}
            <a
              onClick={() =>
                onSwitch('login')
              }
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}