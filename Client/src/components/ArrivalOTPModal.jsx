import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ArrivalOTPModal = ({ bookingId, backendUrl, onClose, onSuccess, mode = 'arrival' }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remaining, setRemaining] = useState(120);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const closeDisabled = true; // cannot close until verified

  const requestOTP = async () => {
    try {
      const endpoint = mode === 'completion' ? 'generate-completion-otp' : 'generate-arrival-otp';
      const { data } = await axios.post(`${backendUrl}/api/bookings/${endpoint}`, { bookingId }, { withCredentials: true });
      if (data.success) {
        setExpiresAt(new Date(data.expiresAt));
        setRemaining(120);
        setResendEnabled(false);
        toast.info(mode === 'completion' ? 'Completion OTP resent to customer' : 'OTP resent to customer');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Don't auto-request on mount - OTP already generated when modal opens
  // useEffect(() => { requestOTP(); }, []);

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next === 0) setResendEnabled(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInput = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
  };

  const submitOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = mode === 'completion' ? 'verify-completion-otp' : 'verify-arrival-otp';
      const { data } = await axios.post(`${backendUrl}/api/bookings/${endpoint}`, { bookingId, otp: code }, { withCredentials: true });
      if (data.success) {
        toast.success(mode === 'completion' ? 'Service marked completed' : 'Arrival verified. Service started');
        onSuccess?.();
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{mode === 'completion' ? 'Completion Verification' : 'Arrival Verification'}</h3>
          <button className="text-gray-400" disabled={closeDisabled} onClick={() => !closeDisabled && onClose?.()}>✕</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">{mode === 'completion' ? 'Ask the customer for the completion OTP they received. Share only if service is finished.' : 'Ask the customer for the OTP they received via email. Do NOT proceed unless you have arrived at the location.'}</p>
          <div className="flex gap-2 justify-center">
            {otp.map((d, i) => (
              <input key={i} value={d} onChange={(e) => handleInput(i, e.target.value)} maxLength={1}
                className="w-10 h-12 text-center text-lg border rounded" />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={submitOTP} disabled={submitting} className={`px-4 py-2 rounded bg-blue-600 text-white ${submitting ? 'opacity-70' : 'hover:bg-blue-700'}`}>{submitting ? 'Verifying…' : 'Verify OTP'}</button>
            <button onClick={requestOTP} disabled={!resendEnabled} className={`px-4 py-2 rounded border ${resendEnabled ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'}`}>Resend OTP</button>
          </div>
          <p className="text-xs text-gray-500">Expires in: {remaining}s</p>
        </div>
      </div>
    </div>
  );
};

export default ArrivalOTPModal;
