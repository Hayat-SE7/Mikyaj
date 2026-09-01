import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Check, AlertCircle } from 'lucide-react';
import { Booking } from '../types';

interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirmReschedule: (bookingId: string, newDate: string, newTime: string) => void;
}

export default function RescheduleModal({
  booking,
  onClose,
  onConfirmReschedule
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState<string>('2025-06-20');
  const [newTime, setNewTime] = useState<string>('11:00 AM');
  const [checkedAvailability, setCheckedAvailability] = useState<boolean>(false);

  const availableSlots = [
    '09:30 AM',
    '10:30 AM',
    '11:00 AM',
    '12:30 PM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM'
  ];

  const handleCheckOrConfirm = () => {
    if (!checkedAvailability) {
      setCheckedAvailability(true);
    } else {
      onConfirmReschedule(booking.id, newDate, newTime);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-100 p-6 space-y-5 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-serif font-bold text-lg text-slate-900">
            Reschedule Appointment
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current appointment info */}
        <div className="p-3 bg-[#FFF5F8] rounded-2xl border border-rose-100 text-xs space-y-1">
          <p className="font-bold text-slate-800">{booking.serviceTitle}</p>
          <p className="text-slate-600">
            Current: {booking.date} at {booking.time} • {booking.branchName}
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          
          {/* Select New Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select New Date
            </label>
            <div className="relative">
              <input
                id="reschedule-date-input"
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setCheckedAvailability(false);
                }}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#FF2B72] focus:ring-2 focus:ring-[#FF2B72]/20 cursor-pointer"
              />
              <CalendarIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Select New Time */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select New Time
            </label>
            <div className="relative">
              <select
                id="reschedule-time-select"
                value={newTime}
                onChange={(e) => {
                  setNewTime(e.target.value);
                  setCheckedAvailability(false);
                }}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#FF2B72] focus:ring-2 focus:ring-[#FF2B72]/20 cursor-pointer"
              >
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability notice if checked */}
          {checkedAvailability && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Slot is <strong>available</strong>! Click confirm to update your booking.</span>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            id="reschedule-confirm-btn"
            onClick={handleCheckOrConfirm}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 active:scale-95 transition-all"
          >
            {checkedAvailability ? 'Confirm Reschedule' : 'Check Availability'}
          </button>
        </div>

      </div>
    </div>
  );
}
