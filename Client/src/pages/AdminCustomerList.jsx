import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

function AdminCustomerList() {
  const { backendUrl } = useContext(AppContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState("");

  const fetchCustomers = async (p = page, ps = pageSize, q = query) => {
    try {
      setLoading(true);
      const params = { page: p, pageSize: ps };
      if (q && q.trim()) params.q = q.trim();
      const res = await axios.get(`${backendUrl}/api/admin/customers`, { withCredentials: true, params });
      if (res.data?.success) {
        setCustomers(res.data.customers || []);
        setTotalCount(res.data.totalCount || 0);
        setPage(res.data.page || p);
        setPageSize(res.data.pageSize || ps);
      } else {
        setError(res.data?.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers(1, pageSize, query);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Customers</h1>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin mx-auto" />
            <div className="mt-3 text-gray-600">Loading customers...</div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded shadow overflow-auto">
            <div className="p-4 flex items-center gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email or mobile"
                className="px-3 py-2 border rounded w-full max-w-md"
              />
              <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
              <div className="ml-auto text-sm text-gray-500">Total: {totalCount}</div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{c.Name || '—'}</div>
                      <div className="text-xs text-gray-500">ID: {String(c._id).slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{c.Email || '—'}</div>
                      <div className="text-sm text-gray-500">{c.Mobile || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{c.Address || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.isProfileComplete ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Complete</span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">Incomplete</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(c.createdAt).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination controls */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                <button
                  onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(totalCount / pageSize)), p + 1))}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <label>Rows:</label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border px-2 py-1 rounded">
                  {[5,10,20,50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerList;
