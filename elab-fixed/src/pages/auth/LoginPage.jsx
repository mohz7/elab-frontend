import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    identifier: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SHOW / HIDE PASSWORD
  const [showPassword, setShowPassword] =
    useState(false);

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // Detect email or identity number
      const isEmail = form.identifier.includes('@');

      const payload = {
        password: form.password,
        [isEmail ? 'email' : 'identityNumber']:
          form.identifier,
      };

      const res = await authApi.login(payload);

      // =========================
      // GET TOKEN
      // =========================
      const responseData = res.data;

      const token =
        responseData?.data?.token ||
        responseData?.token;

      if (!token) {
        throw new Error(
          responseData?.message ||
            'Token not found in response'
        );
      }

      // =========================
      // DECODE JWT
      // =========================
      const base64Url = token.split('.')[1];

      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return (
              '%' +
              ('00' + c.charCodeAt(0).toString(16)).slice(
                -2
              )
            );
          })
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);

      // =========================
      // USER OBJECT
      // =========================
      const user = {
        id: decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ],

        fullName:
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
          ],

        email:
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
          ],

        roles: Array.isArray(
          decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ]
        )
          ? decoded[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ]
          : [
              decoded[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ],
            ],
      };

      // =========================
      // LOGIN SUCCESS
      // =========================
      login(user, token);

      toast.success(
        `Welcome back, ${
          user.fullName || user.email
        }!`
      );
    } catch (err) {
      console.log('LOGIN ERROR:', err);

      // =========================
      // BACKEND RESPONSE
      // =========================
      const response = err.response?.data;

      let errorMessage =
        'Invalid credentials. Please try again.';

      // =========================
      // CUSTOM ERRORS
      // =========================
      if (
        response?.errorCode ===
        'Invalid email or IdentityNumber'
      ) {
        errorMessage =
          'Email or Identity Number is incorrect.';
      } else if (
        response?.errorCode === 'Invalid password'
      ) {
        errorMessage = 'Password is incorrect.';
      } else if (response?.message) {
        errorMessage = response.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      toast.error(errorMessage);
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

        <h1>
          Advanced Medical Laboratory Platform
        </h1>

        <p>
          A complete digital solution for lab
          management — from test booking to
          AI-powered result analysis.
        </p>

        <div className="auth-features">
          {[
            'Book lab tests from anywhere',
            'Receive results instantly online',
            'AI-powered result interpretation',
            'Real-time staff communication',
            'Multi-branch management',
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
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-form-title">
            Sign in
          </div>

          <div className="auth-form-sub">
            Enter your credentials to access your
            account.
          </div>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit}>
            {/* IDENTIFIER */}
            <div className="form-group">
              <label className="form-label">
                Email or Identity Number
              </label>

              <input
                className="form-input"
                placeholder="Email or Identity Number"
                value={form.identifier}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    identifier: e.target.value,
                  }))
                }
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label className="form-label">
                Password
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      password: e.target.value,
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
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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

            {/* FORGOT PASSWORD */}
            <div
              style={{
                textAlign: 'right',
                marginBottom: 20,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{
                  color: 'var(--teal-600)',
                  padding: '4px 0',
                }}
                onClick={() => onSwitch('forgot')}
              >
                Forgot password?
              </button>
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* REGISTER */}
          <div className="auth-switch">
            Don't have an account?{' '}
            <a
              onClick={() =>
                onSwitch('register')
              }
            >
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}