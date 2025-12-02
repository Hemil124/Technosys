import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const TechnicianBookings = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/bookings/technician/accepted`, { withCredentials: true });
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
          <ul className='space-y-4'>
            {bookings.map((b) => (
              <li key={b._id} className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex gap-4 mb-3'>
                  {b.SubCategoryID?.image && (
                    <img src={`${backendUrl}${b.SubCategoryID.image}`} alt={b.SubCategoryID.name} className='w-20 h-20 rounded-lg object-cover' />
                  )}
                  <div className='flex-1'>
                    <p className='font-semibold text-lg'>{b.SubCategoryID?.name || 'Service'}</p>
                    <p className='text-sm text-gray-600'>Booking #{String(b._id).slice(-6)}</p>
                    <p className='text-sm text-gray-600'>Date: {new Date(b.Date).toLocaleDateString()} | Time: {b.TimeSlot}</p>
                    <p className='text-sm text-green-700 font-medium'>Status: {b.Status}</p>
                    {b.SubCategoryID?.coinsRequired !== undefined && (
                      <div className='flex items-center gap-2 mt-1'>
                        <div className='flex items-center justify-center w-5 h-5 bg-yellow-300 rounded-full'>
                          <span className='text-xs font-bold text-yellow-900'>C</span>
                        </div>
                        <span className='text-sm font-semibold text-gray-700'>Coins Used: {b.SubCategoryID.coinsRequired}</span>
                      </div>
                    )}
                  </div>
                </div>
                {b.CustomerID && (
                  <div className='bg-gray-50 rounded-lg p-3'>
                    <p className='text-sm font-medium text-gray-700'>Customer: {b.CustomerID.FirstName} {b.CustomerID.LastName}</p>
                    {b.CustomerID.Address && (
                      <p className='text-sm text-gray-600'>
                        Address: {b.CustomerID.Address.houseNumber || b.CustomerID.Address.house_no}, {b.CustomerID.Address.street || b.CustomerID.Address.road}, {b.CustomerID.Address.city || b.CustomerID.Address.town}, {b.CustomerID.Address.pincode || b.CustomerID.Address.postcode}
                      </p>
                    )}
                    {b.CustomerID.Phone && (
                      <p className='text-sm text-gray-600'>Phone: {b.CustomerID.Phone}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TechnicianBookings;
