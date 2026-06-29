import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { cartApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage({ onNavigate }) {
  const { data: cart, loading } =
    useApi(cartApi.getCart);

  const [processing, setProcessing] =
    useState(false);

  const items = cart?.items || [];

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.cartTotal ?? item.price ?? 0),
    0
  );

  // remove item
  const handleRemoveItem = async (item) => {
    try {
      setProcessing(true);

      const itemId =
        item.cartItemId ||
        item.itemId ||
        item.id;

      await cartApi.removeItem(itemId);

      toast.success('Item removed');

      window.location.href =
        window.location.pathname;

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to remove item'
      );
    } finally {
      setProcessing(false);
    }
  };

  // clear cart
  const handleClearCart = async () => {
    try {
      setProcessing(true);

      await cartApi.clearCart();

      toast.success('Cart cleared');

      window.location.href =
        window.location.pathname;

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to clear cart'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Cart"
        subtitle="Review your selected tests before checkout"
      />

      {loading ? (
        <div className="page-loader">
          <span className="spinner-lg spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>
            Browse tests and add them to your cart to continue.
          </p>

          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => onNavigate('tests')}
          >
            Browse Tests
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

          {/* CART ITEMS */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                Cart Items ({items.length})
              </span>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleClearCart}
                disabled={processing}
              >
                Clear Cart
              </button>
            </div>

            <div>
              {items.map((item, i) => (
                <div
                  key={item.cartItemId || item.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 22px',
                    borderBottom: '1px solid var(--gray-100)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {item.testCatalogName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--teal-600)' }}>
                      {formatCurrency(
                        Number(item.cartTotal ?? item.price ?? 0)
                      )}
                    </div>

                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'red' }}
                      onClick={() => handleRemoveItem(item)}
                      disabled={processing}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY */}
          <div>
            <div className="card">
              <div className="card-body">
                <div className="section-title">Order Summary</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--gray-500)' }}>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 20 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--teal-600)' }}>
                    {formatCurrency(total)}
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => onNavigate('book')}
                >
                  Proceed to Booking →
                </button>

                <button
                  className="btn btn-ghost btn-full"
                  style={{ marginTop: 8 }}
                  onClick={() => onNavigate('tests')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}