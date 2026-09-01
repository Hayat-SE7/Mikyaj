import { useState, FormEvent } from 'react';
import { Sparkles, Calendar, Clock, User, Phone, CheckCircle, X } from 'lucide-react';
import { ServiceItem, Stylist, Branch, Booking } from '../../types';

interface WalkInBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  stylists: Stylist[];
  currentBranch: Branch;
  onConfirmWalkIn: (bookingData: {
    serviceId: string;
    stylistId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    time: string;
    specialRequests?: string;
  }) => void;
}

export default function WalkInBookingModal({
  isOpen,
  onClose,
  services,
  stylists,
  currentBranch,
  onConfirmWalkIn
}: WalkInBookingModalProps) {
  if (!isOpen) return null;

  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedStylistId, setSelectedStylistId] = useState('any');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [date, setDate] = useState('2025-06-12');
  const [time, setTime] = useState('02:00 PM');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Customer name and phone number are required.');
      return;
    }

    onConfirmWalkIn({
      serviceId: selectedServiceId,
      stylistId: selectedStylistId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || `${customerPhone.replace(/[^0-9]/g, '')}@walkin.mikyaj.pk`,
      date,
      time,
      specialRequests: notes ? `Walk-in client: ${notes}` : 'Walk-in client at front desk'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF2B72]" />
              <span>Direct Walk-in Booking (BR-C-019)</span>
            </h3>
            <p className="text-xs text-slate-500">Fast-track booking dispatch from Front Desk</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="E.g., Ayesha Khan"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setError('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#FF2B72] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+92 300 1234567"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setError('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#FF2B72] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              placeholder="ayesha@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#FF2B72] focus:outline-none"
            />
          </div>

          {/* Service selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service / Treatment</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            >
              {services.filter(s => s.active !== false).map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.duration}m) — Rs. {s.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Stylist & Date/Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stylist</label>
              <select
                value={selectedStylistId}
                onChange={(e) => setSelectedStylistId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="any">Auto-Assign (DEC-005)</option>
                {stylists.filter(s => s.id !== 'any' && s.bookable).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              >
                {['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-3 bg-pink-50/70 rounded-xl border border-pink-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">Total Due (incl. GST):</span>
              <span className="text-[10px] text-slate-400">Branch: {currentBranch.name}</span>
            </div>
            <span className="font-bold text-sm text-[#FF2B72]">
              Rs. {(selectedService ? selectedService.price + Math.round(selectedService.price * 0.05) : 0).toLocaleString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
            >
              Dispatch Booking
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
