import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Loader2 } from "lucide-react";

function AdminCustomerList() {
  const { backendUrl } = useContext(AppContext);

  const [allCustomers, setAllCustomers] = useState([]); // all data loaded once
  const [customers, setCustomers] = useState([]);       // filtered + paginated

  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // search
  const [query, setQuery] = useState("");

  // Load once
  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/customers/all`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setAllCustomers(res.data.customers);
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter instantly on client
  useEffect(() => {
    const q = query.toLowerCase();
    let filtered = allCustomers;

    if (q.trim().length > 0) {
      filtered = allCustomers.filter(
        (c) =>
          c.Name?.toLowerCase().includes(q) ||
          c.Email?.toLowerCase().includes(q) ||
          c.Mobile?.toLowerCase().includes(q)
      );
    }

    setCustomers(filtered);
    setPage(1);
  }, [query, allCustomers]);

  const totalCount = customers.length;

  // pagination slice
  const paginated = customers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const Avatar = ({ name }) => (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 text-white rounded-full flex items-center justify-center font-bold shadow">
      {name?.[0]?.toUpperCase()}
    </div>
  );

  const Pagination = ({ page, totalPages, onChange }) => (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border rounded disabled:opacity-40"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`px-4 py-2 border rounded ${
            page === i + 1 ? "bg-black text-white" : "hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 border rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">Customers</h1>

        <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instantly..."
            className="px-3 py-2 border rounded w-full max-w-sm"
          />
          <div className="ml-auto text-sm text-gray-500">
            Total: {totalCount}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin h-7 w-7 text-gray-700" />
          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="grid grid-cols-6 px-6 py-4 bg-gray-50 border-b font-semibold text-gray-600 text-sm">
                <div>Customer</div>
                <div>Contact</div>
                <div>Address</div>
                <div>Status</div>
                <div>Registered</div>
                <div className="text-right">Actions</div>
              </div>

              {paginated.map((c) => (
                <div
                  key={c._id}
                  className="grid grid-cols-6 px-6 py-5 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {c.Photo ? (
                      <img
                        src={backendUrl + c.Photo}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <Avatar name={c.Name} />
                    )}

                    <div>
                      <div className="font-medium">{c.Name || "—"}</div>
                      <div className="text-xs text-gray-500">
                        ID: {String(c._id).slice(-6)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div>{c.Email || "—"}</div>
                    <div className="text-gray-500">{c.Mobile || "—"}</div>
                  </div>

                  <div>{c.Address || "—"}</div>

                  <div>
                    {c.isProfileComplete ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                        Complete
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Incomplete
                      </span>
                    )}
                  </div>

                  <div>{new Date(c.createdAt).toLocaleString()}</div>

                  <div className="text-right">
                    <button className="px-4 py-2 bg-black text-white rounded">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />

            {/* rows */}
            <div className="flex justify-end mt-3 text-sm">
              <label className="mr-2">Rows:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border px-2 py-1 rounded"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerList;
