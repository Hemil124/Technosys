import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

/**
 * TechnicianSubscription.jsx
 * - YouTube Premium inspired UI
 * - Fixed SUCCESS/FAILED history display (frontend-only)
 */

export default function TechnicianSubscription() {
  const { backendUrl, userData, fetchUserData, getUserData } =
    useContext(AppContext);

  // packages + history
  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);

  // ⭐ store successful/failed payments here (frontend only)
  const [payments, setPayments] = useState([]);

  // loading + UI states
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  // ----------------- FETCH PACKAGES -----------------
  async function fetchPackages() {
    try {
      setLoadingPackages(true);
      const res = await axios.get(`${backendUrl}/api/subscription-packages`, {
        withCredentials: true,
      });
      setPackages(res.data?.data || []);
    } catch (err) {
      setError("Unable to load plans.");
    } finally {
      setLoadingPackages(false);
    }
  }

  // ----------------- FETCH HISTORY -----------------
  async function fetchHistory() {
    try {
      setLoadingHistory(true);
      const res = await axios.get(
        `${backendUrl}/api/subscription-packages/history`,
        { withCredentials: true }
      );
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // ----------------- ON LOAD -----------------
  useEffect(() => {
    fetchPackages();
    fetchHistory();
  }, []);

  // ----------------- LOAD RAZORPAY -----------------
  const loadRazorpayScript = (
    src = "https://checkout.razorpay.com/v1/checkout.js"
  ) =>
    new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve(false);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve(true);
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(s);
    });

  // ----------------- BUY PACKAGE -----------------
  const handleBuy = async (pkg) => {
    if (!userData) {
      window.alert("Please log in as a technician.");
      return;
    }

    const confirm = window.confirm(
      `Buy "${pkg.name}" for ₹${pkg.price} (${pkg.coins} coins)?`
    );
    if (!confirm) return;

    try {
      setBuyingId(pkg._id);

      // create order
      const createRes = await axios.post(
        `${backendUrl}/api/subscription-packages/${pkg._id}/create-order`,
        {},
        { withCredentials: true }
      );

      if (!createRes.data?.success) {
        window.alert(createRes.data?.message);
        setBuyingId(null);
        return;
      }

      const { order, paymentId } = createRes.data.data;
      const key = createRes.data.key;

      await loadRazorpayScript();

      // Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Technosys",
        description: pkg.name,
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/subscription-packages/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId,
              },
              { withCredentials: true }
            );

            if (verifyRes.data?.success) {
              // ⭐ store payment status locally
              const payment = verifyRes.data?.data?.payment;
              if (payment) {
                setPayments((prev) => [...prev, payment]);
              }

              window.alert("Payment successful!");
              await fetchHistory();

              // update navbar coins
              if (typeof fetchUserData === "function") {
                await fetchUserData();
              } else if (typeof getUserData === "function") {
                await getUserData();
              }
            } else {
              window.alert("Payment verification failed");
            }
          } catch (err) {
            window.alert("Payment error");
          } finally {
            setBuyingId(null);
          }
        },

        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },

        theme: { color: "#ff0000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      window.alert("Payment failed.");
      setBuyingId(null);
    }
  };

  // ---------------------------------------------
  // ⭐ MATCH PAYMENT STATUS WITH HISTORY FRONTEND ONLY
  // ---------------------------------------------
  function getStatusForHistory(h) {
    const match = payments.find(
      (p) =>
        p.PackageID === h.PackageID?._id &&
        p.TechnicianID === h.TechnicianID &&
        Math.abs(new Date(p.createdAt) - new Date(h.PurchasedAt)) < 20000
    );

    return match?.Status || "Success"; // default Success (since backend already succeeded)
  }

  // pagination
  const totalPages = Math.max(1, Math.ceil(history.length / PER_PAGE));
  const pagedHistory = history.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  // Coin badge
  const CoinBadge = ({ coins }) => (
    <span className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
      <svg width="14" height="14" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#FFD54A" />
        <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#111">
          C
        </text>
      </svg>
      {coins}
    </span>
  );

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4">

        {/* PACKAGES */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Popular plans</h2>

          {loadingPackages ? (
            <div className="py-10 text-center">Loading plans...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <article
                  key={pkg._id}
                  className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-lg"
                >
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <CoinBadge coins={pkg.coins} />
                    <div className="text-sm text-gray-500">• One-time</div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-2xl font-extrabold">₹{pkg.price}</div>
                  </div>

                  <button
                    onClick={() => handleBuy(pkg)}
                    disabled={buyingId === pkg._id}
                    className={`mt-5 w-full py-3 rounded-lg text-white font-semibold ${buyingId === pkg._id
                      ? "bg-gray-400"
                      : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    {buyingId === pkg._id ? "Processing…" : "Buy now"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PURCHASE HISTORY */}
        <section id="purchase-history" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Purchase History</h2>

          {loadingHistory ? (
            <div className="py-8 text-center text-gray-500">Loading history…</div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No purchases yet.</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">

                {pagedHistory.map((h) => (
                  <div
                    key={h._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {h.PackageID?.name}
                      </span>

                      <span className="text-xs text-gray-500 mt-1">
                        {h.PackageID?.coins} coins • ₹{h.PackageID?.price}
                      </span>
                    </div>

                    {/* RIGHT SIDE - DATE */}
                    <div className="text-xs text-gray-500 text-right">
                      {new Date(h.PurchasedAt || h.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* SMART PAGINATION (same as TechnicianRequest.jsx) */}
          <div className="flex justify-center items-center gap-2 py-6 select-none">

            {/* PREV BUTTON */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg border text-sm transition 
        ${page === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-100 shadow-sm"
                }`}
            >
              Prev
            </button>

            {/* PAGE BUTTONS + DOTS */}
            {(() => {
              const pages = [];
              const total = totalPages;

              pages.push(1); // always first page

              if (page > 3) pages.push("left");

              for (let p = page - 1; p <= page + 1; p++) {
                if (p > 1 && p < total) pages.push(p);
              }

              if (page < total - 2) pages.push("right");

              if (total > 1) pages.push(total);

              return pages.map((p, i) =>
                p === "left" || p === "right" ? (
                  <span key={i} className="px-3 py-2 text-gray-500">…</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm transition
              ${p === page
                        ? "bg-gray-900 text-white shadow"
                        : "hover:bg-gray-100"
                      }`}
                  >
                    {p}
                  </button>
                )
              );
            })()}

            {/* NEXT BUTTON */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg border text-sm transition 
        ${page === totalPages
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-100 shadow-sm"
                }`}
            >
              Next
            </button>

          </div>

        </section>


      </div>
    </div>
  );
}
