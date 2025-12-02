// import React, { useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import { AppContext } from '../context/AppContext';

// const TechnicianBookings = () => {
//   const { backendUrl, userData } = useContext(AppContext);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAccepted = async () => {
//       try {
//         const { data } = await axios.get(`${backendUrl}/api/bookings/technician/accepted`, { withCredentials: true });
//         if (data.success && Array.isArray(data.bookings)) {
//           setBookings(data.bookings);
//         }
//       } catch (e) {
//         // silent
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (userData?.role === 'technician') fetchAccepted();
//   }, [backendUrl, userData?.role]);

//   if (userData?.role !== 'technician') {
//     return <div className='p-6 text-center text-red-600'>Technician access required.</div>;
//   }

//   return (
//     <div className='max-w-4xl mx-auto p-6 space-y-6'>
//       <div className='flex justify-between items-center'>
//         <h1 className='text-2xl font-bold'>My Accepted Bookings</h1>
//       </div>

//       <div className='bg-white shadow rounded p-4'>
//         {loading ? (
//           <p className='text-gray-600'>Loading bookings...</p>
//         ) : bookings.length === 0 ? (
//           <p className='text-gray-600'>No accepted bookings yet.</p>
//         ) : (
//           <ul className='space-y-4'>
//             {bookings.map((b) => (
//               <li key={b._id} className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
//                 <div className='flex gap-4 mb-3'>
//                   {b.SubCategoryID?.image && (
//                     <img src={`${backendUrl}${b.SubCategoryID.image}`} alt={b.SubCategoryID.name} className='w-20 h-20 rounded-lg object-cover' />
//                   )}
//                   <div className='flex-1'>
//                     <p className='font-semibold text-lg'>{b.SubCategoryID?.name || 'Service'}</p>
//                     <p className='text-sm text-gray-600'>Booking #{String(b._id).slice(-6)}</p>
//                     <p className='text-sm text-gray-600'>Date: {new Date(b.Date).toLocaleDateString()} | Time: {b.TimeSlot}</p>
//                     <p className='text-sm text-green-700 font-medium'>Status: {b.Status}</p>
//                     {b.SubCategoryID?.coinsRequired !== undefined && (
//                       <div className='flex items-center gap-2 mt-1'>
//                         <div className='flex items-center justify-center w-5 h-5 bg-yellow-300 rounded-full'>
//                           <span className='text-xs font-bold text-yellow-900'>C</span>
//                         </div>
//                         <span className='text-sm font-semibold text-gray-700'>Coins Used: {b.SubCategoryID.coinsRequired}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {b.CustomerID && (
//                   <div className='bg-gray-50 rounded-lg p-3'>
//                     <p className='text-sm font-medium text-gray-700'>Customer: {b.CustomerID.FirstName} {b.CustomerID.LastName}</p>
//                     {b.CustomerID.Address && (
//                       <p className='text-sm text-gray-600'>
//                         Address: {b.CustomerID.Address.houseNumber || b.CustomerID.Address.house_no}, {b.CustomerID.Address.street || b.CustomerID.Address.road}, {b.CustomerID.Address.city || b.CustomerID.Address.town}, {b.CustomerID.Address.pincode || b.CustomerID.Address.postcode}
//                       </p>
//                     )}
//                     {b.CustomerID.Phone && (
//                       <p className='text-sm text-gray-600'>Phone: {b.CustomerID.Phone}</p>
//                     )}
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TechnicianBookings;
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const TechnicianBookings = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(bookings.length / pageSize) || 1;
  const paginated = bookings.slice((page - 1) * pageSize, page * pageSize);

  // ⭐ SAME Pagination Component as Admin & Customer Pages
  const Pagination = ({ page, totalPages, onChange }) => {
    const getPages = () => {
      let arr = [];
      arr.push(1);

      if (page > 3) arr.push("...");

      for (let p = page - 1; p <= page + 1; p++) {
        if (p > 1 && p < totalPages) arr.push(p);
      }

      if (page < totalPages - 2) arr.push("...");

      if (totalPages > 1) arr.push(totalPages);

      return arr;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-6 select-none">

        {/* Prev Button */}
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
            page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 shadow-sm"
          }`}
        >
          Previous
        </button>

        {/* Dynamic Page Buttons */}
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-3 py-2 text-gray-500">…</span>
          ) : (
            <button
              key={i}
              onClick={() => onChange(p)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm border transition-all ${
                p === page
                  ? "bg-gray-900 text-white shadow-md scale-110 border-gray-900"
                  : "hover:bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
            page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 shadow-sm"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Fetch Technician Accepted Bookings
  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/technician/accepted`,
          { withCredentials: true }
        );
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };

    if (userData?.role === 'technician') fetchAccepted();
  }, [backendUrl, userData?.role]);

  if (userData?.role !== 'technician') {
    return <div className='p-6 text-center text-red-600'>Technician access required.</div>;
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>My Accepted Bookings</h1>
      </div>

      <div className='bg-white shadow rounded p-4'>
        {loading ? (
          <p className='text-gray-600'>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className='text-gray-600'>No accepted bookings yet.</p>
        ) : (
          <>
            <ul className='space-y-4'>
              {paginated.map((b) => (
                <li
                  key={b._id}
                  className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'
                >
                  <div className='flex gap-4 mb-3'>
                    {b.SubCategoryID?.image && (
                      <img
                        src={`${backendUrl}${b.SubCategoryID.image}`}
                        alt={b.SubCategoryID.name}
                        className='w-20 h-20 rounded-lg object-cover'
                      />
                    )}

                    <div className='flex-1'>
                      <p className='font-semibold text-lg'>
                        {b.SubCategoryID?.name || 'Service'}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Booking #{String(b._id).slice(-6)}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Date: {new Date(b.Date).toLocaleDateString()} | Time: {b.TimeSlot}
                      </p>
                      <p className='text-sm text-green-700 font-medium'>
                        Status: {b.Status}
                      </p>

                      {b.SubCategoryID?.coinsRequired !== undefined && (
                        <div className='flex items-center gap-2 mt-1'>
                          <div className='flex items-center justify-center w-5 h-5 bg-yellow-300 rounded-full'>
                            <span className='text-xs font-bold text-yellow-900'>C</span>
                          </div>
                          <span className='text-sm font-semibold text-gray-700'>
                            Coins Used: {b.SubCategoryID.coinsRequired}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {b.CustomerID && (
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <p className='text-sm font-medium text-gray-700'>
                        Customer: {b.CustomerID.FirstName} {b.CustomerID.LastName}
                      </p>

                      {b.CustomerID.Address && (
                        <p className='text-sm text-gray-600'>
                          Address:{' '}
                          {b.CustomerID.Address.houseNumber || b.CustomerID.Address.house_no},{' '}
                          {b.CustomerID.Address.street || b.CustomerID.Address.road},{' '}
                          {b.CustomerID.Address.city || b.CustomerID.Address.town},{' '}
                          {b.CustomerID.Address.pincode || b.CustomerID.Address.postcode}
                        </p>
                      )}

                      {b.CustomerID.Phone && (
                        <p className='text-sm text-gray-600'>
                          Phone: {b.CustomerID.Phone}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* ⭐ Pagination Section */}
            {bookings.length > pageSize && (
              <div className="px-6 py-4 border-t bg-gray-50 border-gray-200/50 mt-4 shadow-sm">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicianBookings;
