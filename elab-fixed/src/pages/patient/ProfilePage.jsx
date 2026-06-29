import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
} from 'lucide-react';

import { useApi } from '../../hooks/useApi';
import {
  patientProfileApi,
  branchesApi,
} from '../../api/patient';

import PageHeader from '../../components/PageHeader';

import {
  formatDate,
  genderLabel,
  getInitials,
} from '../../utils/helpers';

import toast from 'react-hot-toast';

export default function ProfilePage() {
  // =========================
  // API
  // =========================
  const {
    data: profile,
    loading,
  } = useApi(
    patientProfileApi.getMyProfile
  );

  const { data: branches } = useApi(
    branchesApi.getAll
  );

  // =========================
  // STATES
  // =========================
  const [tab, setTab] = useState('info');

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingPw, setSavingPw] =
    useState(false);

  // SHOW / HIDE PASSWORDS
  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // =========================
  // BRANCH NAME
  // =========================
  const branchName = React.useMemo(() => {
    if (!profile?.branchId)
      return 'Not Assigned';

    const list = Array.isArray(branches)
      ? branches
      : [];

    if (list.length === 0)
      return `Branch #${profile.branchId}`;

    const found = list.find(
      b =>
        Number(b.id ?? b.branchId) ===
        Number(profile.branchId)
    );

    return (
      found?.name ??
      found?.branchName ??
      `Branch #${profile.branchId}`
    );
  }, [profile, branches]);

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePw = async e => {
    e.preventDefault();

    if (
      pwForm.newPassword !==
      pwForm.confirmPassword
    ) {
      toast.error(
        'Passwords do not match.'
      );

      return;
    }

    setSavingPw(true);

    try {
      await patientProfileApi.changePassword(
        {
          OldPassword:
            pwForm.currentPassword,

          NewPassword:
            pwForm.newPassword,
        }
      );

      toast.success(
        'Password changed!'
      );

      setPwForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to change password.'
      );
    } finally {
      setSavingPw(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading)
    return (
      <div className="page-loader">
        <span className="spinner-lg spinner" />
      </div>
    );

  if (!profile) return null;

  return (
    <div style={{ maxWidth: 800 }}>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal and medical information"
      />

      {/* ================= HEADER ================= */}
      <div
        className="card"
        style={{
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background:
                'var(--teal-glow)',
              border:
                '2.5px solid var(--teal-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--teal-600)',
            }}
          >
            {getInitials(profile.fullName)}
          </div>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {profile.fullName}
            </div>

            <div
              style={{
                fontSize: 14,
                color:
                  'var(--gray-400)',
              }}
            >
              {profile.email}
            </div>

            <div
              style={{
                fontSize: 13,
                color:
                  'var(--teal-600)',
                marginTop: 5,
              }}
            >
              🏥 {branchName}
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="tabs">
        <button
          className={`tab ${
            tab === 'info'
              ? 'active'
              : ''
          }`}
          onClick={() => setTab('info')}
        >
          👤 Personal Info
        </button>

        <button
          className={`tab ${
            tab === 'medical'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setTab('medical')
          }
        >
          🏥 Medical Info
        </button>

        <button
          className={`tab ${
            tab === 'security'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setTab('security')
          }
        >
          🔐 Security
        </button>
      </div>

      {/* ================= PERSONAL ================= */}
      {tab === 'info' && (
        <div className="card">
          <div className="card-body">
            <div className="section-title">
              Personal Information
            </div>

            {[
              [
                'Full Name',
                profile.fullName,
              ],
              ['Email', profile.email],
              [
                'Phone',
                profile.phoneNumber,
              ],
              [
                'ID Number',
                profile.identityNumber,
              ],
              [
                'Gender',
                genderLabel(
                  profile.gender
                ),
              ],
              [
                'Date of Birth',
                formatDate(
                  profile.dateOfBirth
                ),
              ],
              ['Branch', branchName],
            ].map(([k, v]) => (
              <div
                key={k}
                className="info-row"
              >
                <div className="info-row-key">
                  {k}
                </div>

                <div className="info-row-val">
                  {v || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MEDICAL ================= */}
      {tab === 'medical' && (
        <div className="card">
          <div className="card-body">
            <div className="section-title">
              Medical Information
            </div>

            {[
              [
                'Blood Type',
                profile.bloodType,
              ],
              [
                'Allergies',
                profile.allergies,
              ],
              [
                'Chronic Diseases',
                profile.chronicDiseases,
              ],
              ['Notes', profile.notes],
            ].map(([k, v]) => (
              <div
                key={k}
                className="info-row"
              >
                <div className="info-row-key">
                  {k}
                </div>

                <div className="info-row-val">
                  {v || 'None'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECURITY ================= */}
      {tab === 'security' && (
        <div className="card">
          <div className="card-body">
            <div className="section-title">
              Change Password
            </div>

            <form
              onSubmit={handleChangePw}
              style={{
                maxWidth: 380,
              }}
            >
              {/* CURRENT PASSWORD */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 14,
                }}
              >
                <input
                  className="form-input"
                  type={
                    showCurrentPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Current Password"
                  value={
                    pwForm.currentPassword
                  }
                  onChange={e =>
                    setPwForm(p => ({
                      ...p,
                      currentPassword:
                        e.target.value,
                    }))
                  }
                  style={{
                    paddingRight: 45,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
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
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* NEW PASSWORD */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 14,
                }}
              >
                <input
                  className="form-input"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="New Password"
                  value={pwForm.newPassword}
                  onChange={e =>
                    setPwForm(p => ({
                      ...p,
                      newPassword:
                        e.target.value,
                    }))
                  }
                  style={{
                    paddingRight: 45,
                  }}
                />

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
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 16,
                }}
              >
                <input
                  className="form-input"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm Password"
                  value={
                    pwForm.confirmPassword
                  }
                  onChange={e =>
                    setPwForm(p => ({
                      ...p,
                      confirmPassword:
                        e.target.value,
                    }))
                  }
                  style={{
                    paddingRight: 45,
                  }}
                />

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
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* SUBMIT */}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={savingPw}
              >
                {savingPw ? (
                  <span className="spinner" />
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}