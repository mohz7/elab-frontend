import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/helpers';

import {
  patientProfilesStaffApi,
  cartStaffApi,
  testCatalogsStaffApi
} from '../../api/staff';

export default function CartForPatient() {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);

  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [selectedTest, setSelectedTest] = useState('');

  const [cart, setCart] = useState({ items: [] });

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ================= LOAD PATIENTS =================
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await patientProfilesStaffApi.getAll();

        const data = res?.data?.data || res?.data || [];
        setPatients(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load patients');
      }
    };

    loadPatients();
  }, []);

  // ================= LOAD TESTS =================
  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await testCatalogsStaffApi.getAll();

        const data = res?.data?.data || res?.data || [];
        setTests(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load tests');
      }
    };

    loadTests();
  }, []);

  // ================= LOAD CART =================
  useEffect(() => {
    if (!selectedIdentity) return;
    fetchCart();
  }, [selectedIdentity]);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await cartStaffApi.getCart(selectedIdentity);

      const data =
        res?.data?.items ??
        res?.data?.data?.items ??
        res?.data ??
        [];

      setCart({
        items: Array.isArray(data) ? data : []
      });

    } catch (err) {
      // ================= IMPORTANT FIX =================
      // treat "empty cart / not found" as empty, NOT error
      const status = err?.response?.status;

      if (status === 404 || status === 204) {
        setCart({ items: [] });
        return;
      }

      console.log(err);
      toast.error('Failed to load cart');
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD ITEM =================
  const handleAdd = async () => {
    if (!selectedIdentity || !selectedTest) return;

    try {
      setProcessing(true);

      await cartStaffApi.addToCart(selectedIdentity, {
        testCatalogId: selectedTest
      });

      toast.success('Added to cart');
      setSelectedTest('');
      fetchCart();

    } catch {
      toast.error('Failed to add item');
    } finally {
      setProcessing(false);
    }
  };

  // ================= REMOVE ITEM =================
  const handleRemove = async (itemId) => {
    try {
      setProcessing(true);

      await cartStaffApi.removeItem(selectedIdentity, itemId);

      toast.success('Removed');
      fetchCart();

    } catch {
      toast.error('Failed to remove item');
    } finally {
      setProcessing(false);
    }
  };

  // ================= CLEAR CART =================
  const handleClear = async () => {
    try {
      setProcessing(true);

      await cartStaffApi.clearCart(selectedIdentity);

      toast.success('Cart cleared');
      setCart({ items: [] });

    } catch {
      toast.error('Failed to clear cart');
    } finally {
      setProcessing(false);
    }
  };

  const items = cart?.items || [];

  const total = items.reduce(
    (sum, i) => sum + Number(i.price || 0),
    0
  );

  return (
    <div>
      <PageHeader
        title="Patient Cart (Staff)"
        subtitle="Manage patient cart using Identity Number"
      />

      {/* ================= PATIENT SELECT ================= */}
      <div className="card" style={{ marginBottom: 40 }}>
        <div className="card-body">
          <label>Select Patient</label>

          <select
            className="form-control"
            value={selectedIdentity}
            onChange={(e) => setSelectedIdentity(e.target.value)}
          >
            <option value="">Choose Patient</option>

            {patients.map((p) => (
              <option key={p.id} value={p.identityNumber}>
                {p.fullName || p.name} ({p.identityNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TEST SELECT ================= */}
      {selectedIdentity && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ display: 'flex', gap: 10 }}>
            <select
              className="form-control"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
            >
              <option value="">-- Select Test --</option>

              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={processing}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ================= CART ================= */}
      {!selectedIdentity ? (
        <div className="empty-state">Select a patient</div>
      ) : loading ? (
        <div className="page-loader">
          <span className="spinner" />
        </div>
      ) : (
        <div className="card">
          <div
            className="card-header"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span>Patient Cart</span>

            <button
              className="btn btn-danger btn-sm"
              onClick={handleClear}
              disabled={processing || items.length === 0}
            >
              Clear
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              No items in cart
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id || i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 14,
                  borderBottom: '1px solid #eee'
                }}
              >
                <div>{item.testCatalogName}</div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <b>{formatCurrency(item.price || 0)}</b>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="card-body">
            <h4>Total: {formatCurrency(total)}</h4>
          </div>
        </div>
      )}
    </div>
  );
}