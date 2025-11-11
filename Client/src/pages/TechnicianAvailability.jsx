import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

// Simple availability UI: pick a date and select hourly slots (08:00-20:00)
export default function TechnicianAvailability() {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // Prevent selecting past dates in calendar
  const minDate = new Date().toISOString().slice(0, 10); // today

  const generateSlots = () => {
    const slots = [];
    for (let h = 8; h < 20; h++) {
      const start = String(h).padStart(2, "0") + ":00";
      const end = String(h + 1).padStart(2, "0") + ":00";
      slots.push(`${start}-${end}`);
    }
    return slots;
  };

  const allSlots = generateSlots();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]); // from server
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    // fetch existing availability for the date when date changes
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/technician-availability`, {
          params: { date },
          withCredentials: true,
        });

        if (data && data.data && Array.isArray(data.data.timeSlots)) {
          setExistingSlots(data.data.timeSlots.map((t) => t.slot));
          setSelectedSlots(
            data.data.timeSlots.map((t) => (t.status === "available" ? t.slot : null)).filter(Boolean)
          );
        } else {
          setExistingSlots([]);
          setSelectedSlots([]);
        }
      } catch (err) {
        // If unauthenticated or any error, clear slots
        console.error("Failed to fetch availability:", err.response?.data || err.message);
        setExistingSlots([]);
        setSelectedSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [date, backendUrl]);

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSubmit = async () => {
    // client-side validation: prevent submitting past dates
    if (date < minDate) {
      toast.error("Please select today or a future date");
      return;
    }
    try {
      setLoading(true);
      const payload = { date, timeSlots: selectedSlots };
      const { data } = await axios.post(`${backendUrl}/api/technician-availability`, payload, { withCredentials: true });
      if (data && data.success) {
        toast.success("Availability saved");
        setExistingSlots(selectedSlots);
      } else {
        toast.error(data.message || "Failed to save availability");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving availability: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Technician Availability</h2>
          <div className="text-sm text-gray-600">Set availability for a specific date</div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-700">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 bg-yellow-300 rounded-full" />
              <span className="text-sm text-gray-700">Existing</span>
            </div>
            <div className="ml-auto text-sm text-gray-600">Selected slots: {selectedSlots.length}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allSlots.map((slot) => {
              const isSelected = selectedSlots.includes(slot);
              const isExisting = existingSlots.includes(slot);
              const baseClass =
                "text-sm rounded-md px-3 py-2 border flex items-center justify-center select-none";
              const className = `${baseClass} ${
                isSelected ? "bg-green-600 text-white border-green-600" : isExisting ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-white text-gray-800 border-gray-200"
              }`;
              return (
                <button key={slot} type="button" onClick={() => toggleSlot(slot)} className={className}>
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              setSelectedSlots([]);
            }}
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save availability"}
          </button>
        </div>
      </div>
    </div>
  );
}
