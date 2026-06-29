import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage({
  onSwitch,
}) {
  const [step, setStep] = useState('request');

  // request | reset
  const [email, setEmail] = useState('');

  const [form, setForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState('');

  // SHOW / HIDE PASSWORDS
  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // =========================
  // REQUEST RESET CODE
  // =========================
  const handleRequest = async e => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({
        email,
      });

      toast.success(
        'Reset code sent to your email.'
      );

      setForm(p => ({
        ...p,
        email,
      }));

      setStep('reset');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Email not found.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleReset = async e => {
    e.preventDefault();

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError('Passwords do not match.');

      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
      });

      toast.success(
        'Password reset successfully!'
      );

      onSwitch('login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Reset failed. Check your code.'
      );
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

        <h1>Account Recovery</h1>

        <p>
          We'll send a reset code to your
          registered email address so you can
          regain access to your account.
        </p>
      </div>

      {/* ================= FORM SIDE ================= */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          {/* TITLE */}
          <div className="auth-form-title">
            {step === 'request'
              ? 'Forgot Password?'
              : 'Reset Password'}
          </div>

          {/* SUBTITLE */}
          <div className="auth-form-sub">
            {step === 'request'
              ? 'Enter your email to receive a reset code.'
              : 'Enter the code from your email and your new password.'}
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* ================= REQUEST STEP ================= */}
          {step === 'request' ? (
            <form onSubmit={handleRequest}>
              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  className="form-input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />{' '}
                    Sending…
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          ) : (
            /* ================= RESET STEP ================= */
            <form onSubmit={handleReset}>
              {/* RESET CODE */}
              <div className="form-group">
                <label className="form-label">
                  Reset Code
                </label>

                <input
                  className="form-input"
                  placeholder="4-digit code"
                  value={form.code}
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      code: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* NEW PASSWORD */}
              <div className="form-group">
                <label className="form-label">
                  New Password
                </label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <input
                    className="form-input"
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Min 8 characters"
                    value={form.newPassword}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        newPassword:
                          e.target.value,
                      }))
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
                      setShowNewPassword(
                        !showNewPassword
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
                    {showNewPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <input
                    className="form-input"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        confirmPassword:
                          e.target.value,
                      }))
                    }
                    required
                    style={{
                      paddingRight: 45,
                    }}
                  />

                  {/* EYE ICON */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
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
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                className="btn btn-primary btn-full btn-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />{' '}
                    Resetting…
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* BACK */}
          <div className="auth-switch">
            <a
              onClick={() =>
                onSwitch('login')
              }
            >
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}