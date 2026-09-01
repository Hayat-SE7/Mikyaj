import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  Info, 
  ShieldCheck,
  Check,
  MapPin,
  Trash2
} from 'lucide-react';
import { ServiceItem, Stylist, Branch, TimeSlot } from '../types';

interface BookingSidebarProps {
  selectedService: ServiceItem | null;
  stylists: Stylist[];
  selectedStylist: Stylist;
  onSelectStylist: (stylist: Stylist) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  timeSlots: TimeSlot[];
  selectedBranch: Branch;
  onProceedToConfirm: () => void;
  onClearService: () => void;
}

export default function BookingSidebar({
  selectedService,
  stylists,
  selectedStylist,
  onSelectStylist,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  timeSlots,
  selectedBranch,
  onProceedToConfirm,
  onClearService
}: BookingSidebarProps) {
  const [activeTimePeriod, setActiveTimePeriod] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening'>('Morning');

  // Quick 7-day strip generator
  const getNextDays = () => {
    const days = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push({
        iso: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return days;
  };

  const nextDays = getNextDays();

  const filteredSlots = activeTimePeriod === 'All'
    ? timeSlots
    : timeSlots.filter(s => s.period === activeTimePeriod);

  // Price calculations
  const servicePrice = selectedService ? selectedService.price : 0;
  const tax = Math.round(servicePrice * 0.05);
  const totalAmount = servicePrice + tax;

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFF5F8] text-[#FF2B72] flex items-center justify-center border border-[#FF2B72]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Booking Summary</h3>
            <p className="text-[10px] text-slate-400 font-medium">Step 1 of 4 • Instant Reservation</p>
          </div>
        </div>
        
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Available Now
        </span>
      </div>

      {/* Selected Treatment Card */}
      {selectedService ? (
        <div className="bg-[#FFF5F8] rounded-xl p-3 border border-[#FF2B72]/20 relative space-y-2">
          <div className="flex items-start gap-3">
            <img
              referrerPolicy="no-referrer"
              src={selectedService.imageUrl}
              alt={selectedService.title}
              className="w-12 h-12 rounded-lg object-cover ring-1 ring-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[#FF2B72] uppercase tracking-wider">
                  {selectedService.category}
                </span>
                <button
                  onClick={onClearService}
                  title="Remove"
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {selectedService.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF2B72] mt-0.5">
                <span>{selectedService.duration} Mins</span>
                <span>•</span>
                <span>Rs. {selectedService.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white/80 px-2 py-1 rounded-md border border-rose-100">
            <MapPin className="w-3 h-3 text-[#FF2B72] shrink-0" />
            <span className="truncate">{selectedBranch.name}</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center space-y-1.5">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-[#FF2B72] flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">No Treatment Selected</p>
          <p className="text-[10px] text-slate-500">
            Click <strong>&quot;Book&quot;</strong> on any treatment from the catalog to configure your appointment.
          </p>
        </div>
      )}

      {/* 1. Stylist Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-[#FF2B72]" /> Choose Stylist
          </label>
          <span className="text-[10px] text-slate-600 font-bold">
            {selectedStylist.name}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {stylists.map((stylist) => {
            const isSelected = selectedStylist.id === stylist.id;
            return (
              <button
                key={stylist.id}
                id={`stylist-chip-${stylist.id}`}
                onClick={() => onSelectStylist(stylist)}
                className={`flex flex-col items-center p-1 rounded-xl transition-all shrink-0 w-14 text-center ${
                  isSelected
                    ? 'bg-[#FFF5F8] ring-2 ring-[#FF2B72]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <img
                    referrerPolicy="no-referrer"
                    src={stylist.avatarUrl}
                    alt={stylist.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-white"
                  />
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FF2B72] text-white rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-semibold text-slate-800 mt-1 truncate w-full">
                  {stylist.id === 'any' ? 'Any' : stylist.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Date Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-[#FF2B72]" /> Pick Date
          </label>
          <span className="text-[10px] font-bold text-[#FF2B72]">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
          {nextDays.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                id={`date-strip-${d.iso}`}
                onClick={() => onSelectDate(d.iso)}
                className={`py-1.5 px-1 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#FF2B72] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-rose-50/80 text-slate-700 border border-slate-200'
                }`}
              >
                <span className={`text-[8px] uppercase font-medium ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                  {d.dayName}
                </span>
                <span className="text-xs font-bold">
                  {d.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slot Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FF2B72]" /> Time Slot
          </label>
          
          {/* Period tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[9px]">
            {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActiveTimePeriod(period)}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  activeTimePeriod === period
                    ? 'bg-white text-[#FF2B72] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Slot chips */}
        <div className="grid grid-cols-3 gap-1.5">
          {filteredSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <button
                key={slot.time}
                id={`time-slot-${slot.time.replace(/[:\s]/g, '-')}`}
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                  !slot.available
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                    : isSelected
                    ? 'bg-[#FF2B72] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{slot.time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Treatment Fee:</span>
          <span className="font-semibold text-slate-800">
            {selectedService ? `Rs. ${servicePrice.toLocaleString()}` : 'Rs. 0'}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Govt Tax (5%):</span>
          <span className="font-semibold text-slate-800">
            {selectedService ? `Rs. ${tax.toLocaleString()}` : 'Rs. 0'}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
          <span className="font-bold text-slate-900">Total Payable:</span>
          <span className="text-base font-bold text-[#FF2B72]">
            Rs. {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        id="sidebar-proceed-btn"
        disabled={!selectedService}
        onClick={onProceedToConfirm}
        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${
          selectedService
            ? 'bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-lg shadow-pink-100 active:scale-98'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        <span>Confirm Booking</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Safety & Policy Notice */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 flex items-center gap-2.5 text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="text-[10px] leading-tight">
          <p className="font-bold">Guaranteed Safety</p>
          <p className="text-emerald-600">Free rescheduling up to 2 hours before session</p>
        </div>
      </div>

    </div>
  );
}
