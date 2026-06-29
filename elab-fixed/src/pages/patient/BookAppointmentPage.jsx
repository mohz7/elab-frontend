import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  branchesApi,
  testCatalogsApi,
  checkoutApi
} from '../../api/patient';

import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

export default function BookAppointmentPage({ onNavigate }) {

  const { data: branches } = useApi(branchesApi.getAll);
  const { data: tests } = useApi(testCatalogsApi.getAll);

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    branchId: '',
    bookingDate: '',
    bookingTime: '',
    notes: '',
    paymentMethod: '1',
  });

  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm(prev => ({
      ...prev,
      [k]: v,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {

      const payload = {
        paymentMethod: Number(form.paymentMethod),
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        notes: form.notes,
        branchId: Number(form.branchId),
      };

      console.log('PAYLOAD:', payload);

      // API CALL
      const res = await checkoutApi.payment(payload);

      console.log('API RESPONSE:', res.data);

      // Backend response
      const responseData = res.data?.data ?? res.data;

      /*
        Expected backend response:
        {
          success: true,
          message: "Payment session created successfully",
          url: "https://checkout.stripe.com/..."
        }
      */

      // VISA / STRIPE PAYMENT
      if (
        Number(form.paymentMethod) === 2 &&
        responseData?.url
      ) {

        toast.success('Redirecting to secure payment...');

        // Redirect to Stripe Checkout
        window.location.href = responseData.url;

        return;
      }

      // CASH PAYMENT
      toast.success('Booking confirmed! 🎉');

      onNavigate('bookings');

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        'Booking failed. Please try again.'
      );

    } finally {

      setSaving(false);

    }
  };

  // Minimum date = tomorrow
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>

      <PageHeader
        title="Book Appointment"
        subtitle="Schedule your laboratory test visit"
      />

      <div style={{ maxWidth: 640 }}>

        {/* STEPS */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 28,
          }}
        >
          {['Select Branch & Time', 'Payment Method'].map((label, i) => (

            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background:
                      step > i + 1
                        ? 'var(--teal-500)'
                        : step === i + 1
                        ? 'var(--navy-900)'
                        : 'var(--gray-200)',
                    color:
                      step >= i + 1
                        ? 'white'
                        : 'var(--gray-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>

                {i < 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        step > 1
                          ? 'var(--teal-500)'
                          : 'var(--gray-200)',
                      margin: '0 6px',
                    }}
                  />
                )}

              </div>

              <div
                style={{
                  fontSize: 12,
                  color:
                    step === i + 1
                      ? 'var(--gray-800)'
                      : 'var(--gray-400)',
                  fontWeight:
                    step === i + 1
                      ? 600
                      : 400,
                }}
              >
                {label}
              </div>

            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="card">

          <div className="card-body">

            <form
              onSubmit={
                step === 2
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      setStep(2);
                    }
              }
            >

              {/* STEP 1 */}
              {step === 1 && (
                <>

                  <div className="form-group">

                    <label className="form-label">
                      Select Branch *
                    </label>

                    <select
                      className="form-select"
                      value={form.branchId}
                      onChange={(e) =>
                        set('branchId', e.target.value)
                      }
                      required
                    >

                      <option value="">
                        Choose a branch…
                      </option>

                      {branches?.map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                        >
                          {b.name} — {b.city}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="form-grid">

                    <div className="form-group">

                      <label className="form-label">
                        Appointment Date *
                      </label>

                      <input
                        className="form-input"
                        type="date"
                        min={minDate}
                        value={form.bookingDate}
                        onChange={(e) =>
                          set('bookingDate', e.target.value)
                        }
                        required
                      />

                    </div>

                    <div className="form-group">

                      <label className="form-label">
                        Preferred Time *
                      </label>

                      <input
                        className="form-input"
                        type="time"
                        value={form.bookingTime}
                        onChange={(e) =>
                          set('bookingTime', e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="form-group">

                    <label className="form-label">
                      Notes (optional)
                    </label>

                    <textarea
                      className="form-textarea"
                      placeholder="Any special requirements or instructions…"
                      value={form.notes}
                      onChange={(e) =>
                        set('notes', e.target.value)
                      }
                    />

                  </div>

                  <div className="alert alert-info">
                    🛒 Your cart items will be included in this booking.
                    Make sure your cart is ready.
                  </div>

                  <button
                    className="btn btn-primary btn-full btn-lg"
                    type="submit"
                  >
                    Next: Payment →
                  </button>

                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>

                  <div className="section-title">
                    Choose Payment Method
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >

                    {[
                      {
                        value: '1',
                        icon: '💵',
                        label: 'Cash',
                        sub: 'Pay at the branch',
                      },
                      {
                        value: '2',
                        icon: '💳',
                        label: 'Visa / Credit Card',
                        sub: 'Secure online payment',
                      },
                    ].map((opt) => (

                      <div
                        key={opt.value}
                        style={{
                          padding: 20,
                          border: `2px solid ${
                            form.paymentMethod === opt.value
                              ? 'var(--teal-500)'
                              : 'var(--gray-200)'
                          }`,
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          background:
                            form.paymentMethod === opt.value
                              ? 'var(--teal-glow)'
                              : 'transparent',
                          transition: 'all 0.2s',
                        }}
                        onClick={() =>
                          set('paymentMethod', opt.value)
                        }
                      >

                        <div
                          style={{
                            fontSize: 28,
                            marginBottom: 8,
                          }}
                        >
                          {opt.icon}
                        </div>

                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: 'var(--gray-900)',
                          }}
                        >
                          {opt.label}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--gray-500)',
                          }}
                        >
                          {opt.sub}
                        </div>

                      </div>
                    ))}

                  </div>

                  {/* SUMMARY */}
                  <div
                    style={{
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >

                    <div className="section-title">
                      Booking Summary
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        color: 'var(--gray-600)',
                      }}
                    >

                      <div>
                        📍 {
                          branches?.find(
                            b => String(b.id) === form.branchId
                          )?.name || '—'
                        }
                      </div>

                      <div>
                        📅 {form.bookingDate} at {form.bookingTime}
                      </div>

                      {form.notes && (
                        <div>
                          📝 {form.notes}
                        </div>
                      )}

                    </div>

                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                    }}
                  >

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>

                    <button
                      className="btn btn-primary btn-full btn-lg"
                      type="submit"
                      disabled={saving}
                    >

                      {saving ? (
                        <>
                          <span className="spinner" />
                          {' '}Processing…
                        </>
                      ) : Number(form.paymentMethod) === 2 ? (
                        '💳 Pay Now'
                      ) : (
                        '✓ Confirm Booking'
                      )}

                    </button>

                  </div>

                </>
              )}

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}