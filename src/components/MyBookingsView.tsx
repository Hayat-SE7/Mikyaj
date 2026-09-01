import React, { useState, FormEvent } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CreditCard, 
  Bell, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  RotateCcw, 
  XCircle, 
  Sparkles, 
  CheckCircle,
  Download,
  AlertTriangle,
  History,
  Star,
  ShieldCheck,
  Check,
  X,
  Search,
  CalendarPlus,
  Share2
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import RescheduleModal from './RescheduleModal';
import { canCustomerCancel, canCustomerReschedule } from '../lib/bookingEngine';

interface MyBookingsViewProps {
  bookings: Booking[];
  onReschedule: (bookingId: string, newDate: string, newTime: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onBookNewService: () => void;
  onShowInvoice: (booking: Booking) => void;
  onSelectTab: (tab: string) => void;
}

export default function MyBookingsView({
  bookings,
  onReschedule,
  onCancelBooking,
  onBookNewService,
  onShowInvoice,
  onSelectTab
}: MyBookingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'Active' | 'Completed' | 'Cancelled' | 'Lookup'>('Active');
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [timelineBooking, setTimelineBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Loved the service! The stylist was very attentive and skilled.');
  const [reviewSubmitted, setReviewSubmitted] = useState<string | null>(null);

  // Guest Lookup State (BR-C-021, DEC-025)
  const [lookupRef, setLookupRef] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Helper function to map domain statuses to 3 tab buckets
  const isBookingInTab = (status: BookingStatus, tab: 'Active' | 'Completed' | 'Cancelled' | 'Lookup') => {
    if (tab === 'Active') {
      return status === 'PENDING' || status === 'ACCEPTED' || status === 'IN_PROGRESS' || status === 'DRAFT' || status === 'RESCHEDULED' || status === 'RESCHEDULE_REQUESTED';
    }
    if (tab === 'Completed') {
      return status === 'COMPLETED';
    }
    if (tab === 'Cancelled') {
      return status === 'CANCELLED' || status === 'REJECTED' || status === 'NO_SHOW';
    }
    return false;
  };

  const handleGuestLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setSearchedBooking(null);

    const ref = lookupRef.trim().toUpperCase();
    const phone = lookupPhone.trim();

    if (!ref || !phone) {
      setLookupError('Please enter both your Booking Reference (e.g. MK-882910) and Phone Number.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const found = bookings.find(b => {
      const matchRef = (b.reference || b.id).toUpperCase() === ref;
      const bPhoneClean = b.customerPhone.replace(/[^0-9]/g, '');
      const matchPhone = bPhoneClean.includes(cleanPhone) || cleanPhone.includes(bPhoneClean);
      return matchRef && matchPhone;
    });

    if (found) {
      setSearchedBooking(found);
    } else {
      setLookupError(`No booking found matching Reference "${ref}" with phone ending in "${phone.slice(-4)}". Please check your reference code or call front desk.`);
    }
  };

  // Google Calendar Integration
  const handleAddToGoogleCalendar = (booking: Booking) => {
    const title = encodeURIComponent(`Mikyaj Parlor: ${booking.serviceTitle}`);
    const details = encodeURIComponent(`Appointment Ref: ${booking.reference || booking.id}\nService: ${booking.serviceTitle}\nStylist: ${booking.stylistName}\nLocation: ${booking.branchName} (${booking.branchAddress})`);
    const location = encodeURIComponent(`${booking.branchName}, ${booking.branchAddress}`);
    
    // format YYYYMMDDTHHMMSS
    const dateFormatted = booking.date.replace(/-/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T100000Z/${dateFormatted}T113000Z`;
    window.open(gCalUrl, '_blank');
  };

  // Download .ics File
  const handleDownloadICS = (booking: Booking) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mikyaj Beauty Parlor//Appointment Reservation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Mikyaj Salon: ${booking.serviceTitle}`,
      `DESCRIPTION:Booking Ref: ${booking.reference || booking.id} with ${booking.stylistName}`,
      `LOCATION:${booking.branchName}, ${booking.branchAddress}`,
      `DTSTART:${booking.date.replace(/-/g, '')}T100000Z`,
      `DTEND:${booking.date.replace(/-/g, '')}T113000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mikyaj_booking_${booking.reference || booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter(b => isBookingInTab(b.status, activeSubTab));

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <Check className="w-3 h-3 text-slate-600" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <X className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-600" /> Rescheduled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };


  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-lux p-6 sm:p-8 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Customer Portal Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2 border-r border-slate-100 pr-0 lg:pr-6">
          <div className="p-3 bg-[#FFF5F8] rounded-2xl mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF2B72] text-white flex items-center justify-center font-bold text-sm">
                H
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Hayat Khan</p>
                <p className="text-[11px] text-slate-500">hayatkhan@gmail.com</p>
                <span className="inline-block mt-0.5 px-2 py-0.2 bg-emerald-100 text-emerald-700 font-semibold text-[9px] rounded-full">
                  VIP Gold Member
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('home')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FFF5F8] text-[#FF2B72] flex items-center justify-between"
            >
              <span className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-[#FF2B72]" />
                <span>My Bookings</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FF2B72] text-white font-bold">
                {bookings.filter(b => isBookingInTab(b.status, 'Active')).length}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('services')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile & Preferences</span>
            </button>

            <button
              onClick={() => onSelectTab('packages')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Notifications</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF2B72]" />
            </button>

            <button
              onClick={() => onSelectTab('branches')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Saved Branches</span>
            </button>

            <button
              onClick={() => alert('Payment method: Cash or Card upon arrival at Salon Reception')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Payment Methods</span>
            </button>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectTab('home')}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-700 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Back to Main Site</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Bookings Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header & Status Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                My Bookings & Appointments
              </h2>
              <p className="text-xs text-slate-500">
                Self-service appointment management, audit tracking & rescheduling
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs flex-wrap">
              {(['Active', 'Completed', 'Cancelled', 'Lookup'] as const).map((tab) => {
                const count = tab === 'Lookup' ? undefined : bookings.filter(b => isBookingInTab(b.status, tab)).length;
                return (
                  <button
                    key={tab}
                    id={`filter-tab-${tab.toLowerCase()}`}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                      activeSubTab === tab
                        ? 'bg-white text-[#FF2B72] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab === 'Active' ? 'Active / Upcoming' : tab === 'Lookup' ? '🔍 Guest Lookup' : tab}</span>
                    {count !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeSubTab === tab ? 'bg-[#FFF5F8] text-[#FF2B72]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content: Guest Reference Lookup View (BR-C-021, DEC-025) */}
          {activeSubTab === 'Lookup' && (
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-xs space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#FF2B72] flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Find Your Guest Booking (Reference + Phone Verification)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the unique 6-character booking code (e.g. MK-882910) sent to your WhatsApp and your registered phone number.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGuestLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-[#FFFDFE] p-4 rounded-xl border border-rose-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booking Reference <span className="text-[#FF2B72]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MK-882910"
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Phone Number <span className="text-[#FF2B72]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Lookup Appointment</span>
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}

              {searchedBooking && (
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Booking Verified
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FF2B72] bg-white px-2.5 py-1 rounded-md border border-rose-100">
                      {searchedBooking.reference || searchedBooking.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Service</span>
                      <strong className="text-slate-800">{searchedBooking.serviceTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date & Time</span>
                      <strong className="text-slate-800">{searchedBooking.date} @ {searchedBooking.time}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Stylist & Branch</span>
                      <strong className="text-slate-800">{searchedBooking.stylistName} ({searchedBooking.branchName})</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => onShowInvoice(searchedBooking)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Receipt
                    </button>
                    <button
                      onClick={() => handleAddToGoogleCalendar(searchedBooking)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Google Calendar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab !== 'Lookup' && (
            <>
              {/* Policy Notice Box */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#FF2B72] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Mikyaj Self-Service Policy (BR-C-007 & BR-C-020):</p>
                  <p className="text-slate-600 text-[11px]">
                    • Free cancellations are allowed up to <strong>24 hours</strong> prior to your session.
                    <br />
                    • You can self-reschedule up to <strong>2 times</strong> online. Further changes require admin override.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#FF2B72] flex items-center justify-center mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No {activeSubTab} Appointments</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any {activeSubTab.toLowerCase()} bookings recorded right now.
              </p>
              <button
                onClick={onBookNewService}
                className="mt-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61]"
              >
                Book a Treatment Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const cancelCheck = canCustomerCancel(booking);
                const rescheduleCheck = canCustomerReschedule(booking);
                const isActionable = booking.status === 'ACCEPTED' || booking.status === 'PENDING' || booking.status === 'RESCHEDULED';

                return (
                  <div
                    key={booking.id}
                    id={`booking-card-${booking.id}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-rose-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-start gap-3.5">
                        <img
                          referrerPolicy="no-referrer"
                          src={booking.imageUrl}
                          alt={booking.serviceTitle}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-1 ring-slate-100 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-[#FF2B72] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                              {booking.reference || booking.id}
                            </span>
                            {getStatusBadge(booking.status)}
                            {booking.rescheduleCount > 0 && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                Rescheduled {booking.rescheduleCount}/2x
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif font-bold text-base text-slate-900">
                            {booking.serviceTitle}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Stylist: <strong className="text-slate-700">{booking.stylistName}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Amount</span>
                        <span className="text-base sm:text-lg font-bold text-[#FF2B72]">
                          Rs. {booking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#FAFAFA] p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#FF2B72]" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#FF2B72]" />
                        <span>{booking.time} ({booking.duration} Mins)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#FF2B72] shrink-0" />
                        <span className="truncate">{booking.branchName}</span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="text-xs text-slate-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                        <strong className="text-slate-800">Special Note:</strong> {booking.specialRequests}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTimelineBooking(booking)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" /> Audit Timeline
                        </button>

                        {booking.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setReviewBooking(booking);
                              setReviewSubmitted(null);
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Review Experience
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isActionable && (
                          <button
                            onClick={() => handleAddToGoogleCalendar(booking)}
                            className="px-3.5 py-2 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" /> +Calendar
                          </button>
                        )}

                        <button
                          onClick={() => onShowInvoice(booking)}
                          className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </button>

                        {isActionable && (
                          <>
                            <button
                              id={`reschedule-btn-${booking.id}`}
                              disabled={!rescheduleCheck.allowed}
                              onClick={() => {
                                if (rescheduleCheck.allowed) {
                                  setRescheduleBooking(booking);
                                } else {
                                  alert(rescheduleCheck.reason);
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                rescheduleCheck.allowed
                                  ? 'text-[#FF2B72] bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                              }`}
                              title={!rescheduleCheck.allowed ? rescheduleCheck.reason : 'Reschedule appointment'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                            </button>

                            <button
                              id={`cancel-btn-${booking.id}`}
                              disabled={!cancelCheck.allowed}
                              onClick={() => {
                                if (cancelCheck.allowed) {
                                  setCancelModalBooking(booking);
                                } else {
                                  alert(cancelCheck.message);
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                cancelCheck.allowed
                                  ? 'text-rose-700 bg-rose-100/70 hover:bg-rose-200'
                                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                              }`}
                              title={!cancelCheck.allowed ? cancelCheck.message : 'Cancel appointment'}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onConfirmReschedule={onReschedule}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-rose-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your <strong>{cancelModalBooking.serviceTitle}</strong> booking ({cancelModalBooking.reference || cancelModalBooking.id})? No cancellation fee applies under the 24-hour self-service window.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  onCancelBooking(cancelModalBooking.id);
                  setCancelModalBooking(null);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History & Status Timeline Modal */}
      {timelineBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#FF2B72]" /> Audit Trail & History
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref: {timelineBooking.reference || timelineBooking.id}
                </p>
              </div>
              <button
                onClick={() => setTimelineBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 max-h-80 overflow-y-auto">
              {timelineBooking.statusHistory && timelineBooking.statusHistory.length > 0 ? (
                timelineBooking.statusHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-[#FF2B72] flex items-center justify-center font-bold shrink-0 text-[10px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.status}</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{item.reason || item.notes || 'Status transition logged by system'}</p>
                      <span className="text-[9px] text-slate-400 block font-mono">By: {item.changedBy}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Initial booking status: {timelineBooking.status}
                </div>
              )}
            </div>

            <button
              onClick={() => setTimelineBooking(null)}
              className="w-full py-2.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-rose-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Review Your Experience</h3>
            <p className="text-xs text-slate-500">
              How was your <strong>{reviewBooking.serviceTitle}</strong> with <strong>{reviewBooking.stylistName}</strong>?
            </p>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs space-y-1">
                <p className="font-bold">Thank you for your feedback! ⭐</p>
                <p className="text-[11px]">Your 5-star review has been verified and added to {reviewBooking.stylistName}&apos;s profile.</p>
                <button
                  onClick={() => setReviewBooking(null)}
                  className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Rating</label>
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Review Notes</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                    placeholder="Share feedback on cleanliness, styling, timing, and hospitality..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReviewBooking(null)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setReviewSubmitted('success')}
                    className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61]"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
