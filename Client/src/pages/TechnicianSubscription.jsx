import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

export default function TechnicianSubscription() {
  const { backendUrl, userData } = useContext(AppContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  // Pagination for history
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(7);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/subscription-packages`, {
          withCredentials: true,
        });
        const data = res.data;
        setPackages(data.data || []);
      } catch (err) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      await fetchPackages();
      await fetchHistory();
    };

    fetchAll();
  }, [backendUrl]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`${backendUrl}/api/subscription-packages/history`, {
        withCredentials: true,
      });
      const data = res.data;
      setHistory(data.data || []);
    } catch (err) {
      // ignore silently or set error if desired
      console.error('Fetch history error', err?.response?.data || err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Reset page when history length or per-page changes
  useEffect(() => {
    setHistoryPage(1);
  }, [historyPerPage]);

  const handleBuy = async (pkg) => {
    if (!userData) {
      alert("Please login as a technician to purchase.");
      return;
    }
    const ok = window.confirm(`Buy '${pkg.name}' for ${pkg.coins} coins (price: ${pkg.price})?`);
    if (!ok) return;

    try {
      setBuyingId(pkg._id);

      // 1) create razorpay order on server
      const createRes = await axios.post(`${backendUrl}/api/subscription-packages/${pkg._id}/create-order`, {}, { withCredentials: true });
      if (!createRes.data || !createRes.data.success) {
        // show server-provided message if available
        const serverMsg = createRes.data?.message || 'Failed to create payment order';
        const detail = createRes.data?.detail;
        alert(detail ? `${serverMsg}: ${detail}` : serverMsg);
        setBuyingId(null);
        return;
      }

      const { order, paymentId } = createRes.data.data || {};
      const key = createRes.data.key;

      if (!order || !key) {
        alert('Failed to create payment order (missing order or key)');
        setBuyingId(null);
        return;
      }

      // load razorpay script
      const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
        document.body.appendChild(script);
      });

      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Technosys',
        description: pkg.name,
        order_id: order.id,
        handler: async function (response) {
          try {
            // response contains razorpay_order_id, razorpay_payment_id, razorpay_signature
            const verifyRes = await axios.post(`${backendUrl}/api/subscription-packages/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId
            }, { withCredentials: true });

            if (verifyRes.data && verifyRes.data.success) {
              alert(verifyRes.data.message || 'Payment successful and subscription applied');
              await fetchHistory();
            } else {
              alert(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verify error', err?.response || err);
            alert(err?.response?.data?.message || 'Payment verification failed');
          } finally {
            setBuyingId(null);
          }
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || ''
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setBuyingId(null);
      const msg = err?.response?.data?.message || err.message || "Purchase error";
      alert(msg);
    }
  };

  if (loading) return <div className="p-6">Loading packages...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Subscription Packages</h2>

      {packages.length === 0 ? (
        <div>No subscription packages available.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {packages.map((pkg) => (
            <div key={pkg._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{pkg.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{pkg.description}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{pkg.coins} coins</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>₹{pkg.price}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={buyingId === pkg._id}
                  style={{
                    background: buyingId === pkg._id ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: buyingId === pkg._id ? "not-allowed" : "pointer",
                  }}
                >
                  {buyingId === pkg._id ? "Processing..." : "Buy"}
                </button>

                <div style={{ fontSize: 12, color: "#6b7280" }}>{pkg.isActive ? "Active" : "Inactive"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
        <div style={{ marginTop: 28 }}>
          <h3 className="text-xl font-semibold mb-3">Purchase History</h3>
          {loadingHistory ? (
            <div>Loading history...</div>
          ) : history.length === 0 ? (
            <div>No purchases yet.</div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/** compute paginated slice */}
                {(() => {
                  const total = history.length;
                  const totalPages = Math.max(1, Math.ceil(total / historyPerPage));
                  const startIndex = (historyPage - 1) * historyPerPage;
                  const paginated = history.slice(startIndex, startIndex + historyPerPage);

                  return (
                    <>
                      {paginated.map((h) => (
                        <div key={h._id} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, background: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 600 }}>{h.PackageID?.name || 'Package'}</div>
                            <div style={{ color: '#6b7280' }}>{new Date(h.PurchasedAt || h.createdAt).toLocaleString()}</div>
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 13 }}>{h.PackageID?.coins} coins • ₹{h.PackageID?.price}</div>
                        </div>
                      ))}

                      {/* Pagination footer like AdminCategories */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <div style={{ color: '#6b7280' }}>
                          {(() => {
                            const total = history.length;
                            const start = total === 0 ? 0 : startIndex + 1;
                            const end = Math.min(startIndex + paginated.length, total);
                            return `Showing ${start} to ${end} of ${total} purchases`;
                          })()}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                            disabled={historyPage === 1}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 9999,
                              border: '1px solid #e5e7eb',
                              background: historyPage === 1 ? '#f3f4f6' : '#fff',
                              color: historyPage === 1 ? '#9ca3af' : '#111827'
                            }}
                          >
                            Previous
                          </button>

                          <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {historyPage}
                          </div>

                          <button
                            onClick={() => setHistoryPage((p) => Math.min(Math.max(1, Math.ceil(history.length / historyPerPage)), p + 1))}
                            disabled={historyPage === Math.max(1, Math.ceil(history.length / historyPerPage))}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 9999,
                              border: '1px solid #e5e7eb',
                              background: historyPage === Math.max(1, Math.ceil(history.length / historyPerPage)) ? '#f3f4f6' : '#fff',
                              color: historyPage === Math.max(1, Math.ceil(history.length / historyPerPage)) ? '#9ca3af' : '#111827'
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

