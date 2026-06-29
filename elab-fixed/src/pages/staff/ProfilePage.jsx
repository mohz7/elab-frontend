import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { staffProfileApi } from '../../api/staff';
import PageHeader from '../../components/PageHeader';
import {
  formatDate,
  genderLabel,
  getInitials,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

import { Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { role } = useAuth();

  const {
    data: profile,
    loading,
    refetch,
  } = useApi(staffProfileApi.getMyProfile);

  const [editMode, setEditMode] =
    useState(false);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState('info');

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingPw, setSavingPw] =
    useState(false);

  // ================= PASSWORD VISIBILITY =================
  const [showCurrent, setShowCurrent] =
    useState(false);
  const [showNew, setShowNew] =
    useState(false);
  const [showConfirm, setShowConfirm] =
    useState(false);

  // ================= EDIT PROFILE =================
  const startEdit = () => {
    setForm({
      fullName: profile.fullName || '',
      phoneNumber:
        profile.phoneNumber || '',
      email: profile.email || '',
    });
    setEditMode(true);
  };

  const set = (k, v) =>
    setForm(p => ({
      ...p,
      [k]: v,
    }));

  const handleSave = async e => {
    e.preventDefault();

    setSaving(true);

    try {
      await staffProfileApi.updateMyProfile(
        form
      );

      toast.success('Profile updated!');

      setEditMode(false);
      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'Failed to update.'
      );
    } finally {
      setSaving(false);
    }
  };

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
      await staffProfileApi.changePassword({
        oldPassword:
          pwForm.currentPassword,
        newPassword:
          pwForm.newPassword,
      });

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
        err?.response?.data?.message ||
          'Failed.'
      );
    } finally {
      setSavingPw(false);
    }
  };

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
        subtitle="Manage your staff account"
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
            {getInitials(
              profile.fullName
            )}
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
          onClick={() =>
            setTab('info')
          }
        >
          👤 Personal Info
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

      {/* ================= PERSONAL INFO ================= */}
      {tab === 'info' && !editMode && (
        <div className="card">
          <div className="card-body">
            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                marginBottom: 16,
              }}
            >
              <div className="section-title">
                Staff Information
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={startEdit}
              >
                ✏️ Edit
              </button>
            </div>

            <div className="info-grid">
              {[
                [
                  'Full Name',
                  profile.fullName,
                ],
                [
                  'Email',
                  profile.email,
                ],
                [
                  'Phone',
                  profile.phoneNumber,
                ],
                [
                  'Branch',
                  profile.branchName ||
                    'Not Assigned',
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
              onSubmit={
                handleChangePw
              }
              style={{
                maxWidth: 380,
              }}
            >
              {/* CURRENT */}
              <div className="form-group">
                <label>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={
                      showCurrent
                        ? 'text'
                        : 'password'
                    }
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
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrent(
                        !showCurrent
                      )
                    }
                    style={iconBtn}
                  >
                    {showCurrent ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* NEW */}
              <div className="form-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={
                      showNew
                        ? 'text'
                        : 'password'
                    }
                    value={
                      pwForm.newPassword
                    }
                    onChange={e =>
                      setPwForm(p => ({
                        ...p,
                        newPassword:
                          e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowNew(
                        !showNew
                      )
                    }
                    style={iconBtn}
                  >
                    {showNew ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM */}
              <div className="form-group">
                <label>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={
                      showConfirm
                        ? 'text'
                        : 'password'
                    }
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
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    style={iconBtn}
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

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

// ICON STYLE
const iconBtn = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#666',
};