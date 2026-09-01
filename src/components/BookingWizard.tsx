import { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Copy, 
  CheckCheck, 
  Download, 
  Share2, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Heart,
  Star,
  ExternalLink,
  MessageCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServiceItem, ServiceCategory, Stylist, Branch, TimeSlot, Booking } from '../types';
import { submitBooking } from '../lib/bookingEngine';

interface BookingWizardProps {
  initialService?: ServiceItem | null;
  services: ServiceItem[];
  categories: ServiceCategory[];
  stylists: Stylist[];
  branches: Branch[];
  currentBranch: Branch;
  timeSlots: TimeSlot[];
  existingBookings?: Booking[];
  onFinishBooking: (booking: Booking) => void;
  onGoToHome: () => void;
  onGoToMyBookings: () => void;
}

export default function BookingWizard({
  initialService,
  services,
  categories,
  stylists,
  branches,
  currentBranch,
  timeSlots,
  existingBookings = [],
  onFinishBooking,
  onGoToHome,
  onGoToMyBookings
}: BookingWizardProps) {
  // Current Step: 1 = Service, 2 = Date, 3 = Time, 4 = Confirm, 5 = Complete
  const [currentStep, setCurrentStep] = useState<number>(initialService ? 2 : 1);
  
  // Selection States
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All Services');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(initialService || services[0]);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(currentBranch);
  const [selectedStylist, setSelectedStylist] = useState<Stylist>(stylists[0]);
  
  // Date selection states
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 5, 1)); // June 2025 matching reference
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-12'); // 12 June 2025 matching screenshot
  
  // Time slot selection
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  
  // Customer details form
  const [customerName, setCustomerName] = useState<string>('Hayat Khan');
  const [customerEmail, setCustomerEmail] = useState<string>('hayatkhan@gmail.com');
  const [customerPhone, setCustomerPhone] = useState<string>('+92 300 1234567');
  const [specialRequest, setSpecialRequest] = useState<string>("It's my wedding day ❤️");
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  
  // Booking engine error state
  const [bookingError, setBookingError] = useState<{ message: string; alternatives?: string[] } | null>(null);

  // Final confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Trigger confetti when step 5 is reached
  useEffect(() => {
    if (currentStep === 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2B72', '#FF6598', '#10B981', '#F59E0B', '#FFF5F8']
      });
    }
  }, [currentStep]);

  // Filter services by category
  const filteredServices = selectedCategory === 'All Services'
    ? services
    : services.filter(s => s.category === selectedCategory);

  // Price calculations
  const servicePrice = selectedService ? selectedService.price : 15000;
  const tax = Math.round(servicePrice * 0.05);
  const totalAmount = servicePrice + tax;

  // Calendar calculations for June 2025
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sun
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Status mapping for dates in June 2025
  const getDateStatus = (day: number) => {
    if (day < 8) return 'available';
    if (day === 12) return 'selected';
    if (day % 4 === 0) return 'limited';
    if (day % 7 === 0) return 'booked';
    return 'available';
  };

  const handleDateClick = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
  };

  const handleConfirmBooking = () => {
    if (!selectedService) return;
    setBookingError(null);

    const idempotencyKey = `idemp-${customerEmail}-${selectedService.id}-${selectedDate}-${selectedTime}`;

    const result = submitBooking(
      {
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        branchId: selectedBranch.id,
        stylistId: selectedStylist.id,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests: specialRequest,
        idempotencyKey
      },
      {
        services,
        stylists,
        branches,
        bookings: existingBookings,
        timeSlots
      }
    );

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
      onFinishBooking(result.booking);
      setCurrentStep(5);
    } else if (result.error) {
      setBookingError({
        message: result.error.message,
        alternatives: result.error.details?.alternatives
      });
    }
  };

  const handleCopyBookingId = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Google calendar generator
  const getGoogleCalendarUrl = () => {
    if (!confirmedBooking) return '#';
    const title = encodeURIComponent(`Mikyaj Salon: ${confirmedBooking.serviceTitle}`);
    const details = encodeURIComponent(`Appointment with ${confirmedBooking.stylistName} at ${confirmedBooking.branchName}. Booking ID: ${confirmedBooking.id}`);
    const location = encodeURIComponent(confirmedBooking.branchAddress);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-lux p-6 sm:p-10 mb-12">
      
      {/* Top Title Banner */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] flex items-center justify-center gap-2">
          <span>Book Your Appointment</span>
          <span className="text-[#FF2B72] font-normal">🤍</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          A few simple steps to enhance your beauty
        </p>
      </div>

      {/* 5-Step Process Indicator (Matching Reference Image) */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="relative flex items-center justify-between">
          {/* Background connector line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-rose-100 -z-0" />
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF2B72] transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />

          {[
            { step: 1, label: 'Service' },
            { step: 2, label: 'Date' },
            { step: 3, label: 'Time' },
            { step: 4, label: 'Confirm' },
            { step: 5, label: 'Complete' },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div 
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep && currentStep !== 5) {
                    setCurrentStep(item.step);
                  }
                }}
                className="flex flex-col items-center relative z-10 cursor-pointer group"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-[#FF2B72] text-white ring-4 ring-pink-100'
                      : isCurrent
                      ? 'bg-[#FF2B72] text-white ring-4 ring-pink-200 scale-110'
                      : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-rose-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
                </div>
                <span className={`text-[11px] sm:text-xs font-semibold mt-2 ${
                  isCurrent ? 'text-[#FF2B72] font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= STEP 1: SELECT SERVICE ================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">1. Select Service</h3>
            <p className="text-xs text-slate-500">Choose the service you want to book</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Left Sidebar */}
            <div className="lg:col-span-3 space-y-1 bg-[#FAFAFA] p-3 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                Categories
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-[#FF2B72] text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-rose-50/80'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Service Grid */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`bg-white rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 group ${
                      isSelected
                        ? 'border-[#FF2B72] ring-2 ring-[#FF2B72]/20 shadow-md bg-rose-50/20'
                        : 'border-slate-200 hover:border-rose-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img
                          referrerPolicy="no-referrer"
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#FF2B72] text-white rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#FF2B72] transition-colors">
                          {service.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration} min
                      </span>
                      <span className="text-xs font-bold text-[#FF2B72]">
                        Rs. {service.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                      className={`w-full mt-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#FF2B72] text-white shadow-xs'
                          : 'bg-rose-50 text-[#FF2B72] hover:bg-[#FF2B72] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar: Selected item banner & Next button */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 flex-wrap gap-4">
            {selectedService ? (
              <div className="flex items-center gap-3">
                <img
                  referrerPolicy="no-referrer"
                  src={selectedService.imageUrl}
                  alt={selectedService.title}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-rose-200"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{selectedService.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Rs. {selectedService.price.toLocaleString()} • {selectedService.duration} Min
                  </p>
                </div>
              </div>
            ) : <div />}

            <button
              id="wizard-next-date-btn"
              disabled={!selectedService}
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 flex items-center gap-2"
            >
              <span>Next: Choose Date</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SELECT DATE ================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">2. Select Date</h3>
            <p className="text-xs text-slate-500">Pick a date that works for you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calendar Container (8 cols) */}
            <div className="lg:col-span-8 bg-[#FAFAFA] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
              
              {/* Month Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-serif font-bold text-sm sm:text-base text-slate-800">
                  {monthName}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty days before 1st */}
                {[...Array(firstDay)].map((_, i) => (
                  <div key={`empty-${i}`} className="p-3 text-center text-xs text-slate-300">
                    {28 + i}
                  </div>
                ))}

                {/* Real Days of month */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const status = getDateStatus(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`p-2.5 sm:p-3 rounded-xl text-xs font-semibold text-center transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-[#FF2B72] text-white font-bold shadow-md shadow-pink-500/20 ring-2 ring-pink-300 scale-105'
                          : 'bg-white hover:bg-rose-50/80 text-slate-800 border border-slate-100 hover:border-rose-200'
                      }`}
                    >
                      <span>{day}</span>
                      {/* Availability dot */}
                      {!isSelected && (
                        <span className={`w-1 h-1 rounded-full mt-1 ${
                          status === 'limited' ? 'bg-amber-400' : status === 'booked' ? 'bg-rose-300' : 'bg-emerald-500'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legends (Matching screenshot: Available, Limited, Booked, Unavailable) */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Limited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Unavailable</span>
                </div>
              </div>

            </div>

            {/* Selected Date Summary Card (4 cols, matching reference) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#FFF5F8] rounded-2xl border border-rose-100 p-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Date
                </span>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2B72] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#FF2B72]" />
                  <span>We have <strong>8 time slots</strong> available on this day</span>
                </div>
              </div>

              {/* Stylist preview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Expert Stylist
                </span>
                <div className="flex items-center gap-2.5">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedStylist.avatarUrl}
                    alt={selectedStylist.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF2B72]/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selectedStylist.name}</p>
                    <p className="text-[11px] text-[#FF2B72] font-medium">{selectedStylist.role}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              id="wizard-next-time-btn"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 flex items-center gap-2"
            >
              <span>Next: Choose Time</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SELECT TIME ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">3. Select Time</h3>
            <p className="text-xs text-slate-500">
              Choose your preferred time slot for{' '}
              <strong>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </strong>
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Morning */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Morning Slots
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {timeSlots.filter(s => s.period === 'Morning').map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#FF2B72] text-white shadow-md shadow-pink-500/20 font-bold scale-102'
                          : 'bg-[#FAFAFA] hover:bg-rose-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Afternoon Slots
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {timeSlots.filter(s => s.period === 'Afternoon').map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#FF2B72] text-white shadow-md shadow-pink-500/20 font-bold scale-102'
                          : 'bg-[#FAFAFA] hover:bg-rose-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evening */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Evening Slots
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {timeSlots.filter(s => s.period === 'Evening').map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#FF2B72] text-white shadow-md shadow-pink-500/20 font-bold scale-102'
                          : 'bg-[#FAFAFA] hover:bg-rose-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Selected Time Banner */}
          <div className="p-4 bg-[#FFF5F8] rounded-2xl border border-rose-100 text-center">
            <span className="text-xs text-slate-600">
              Selected Time:{' '}
              <strong className="text-base font-bold text-[#FF2B72] ml-1">
                {selectedTime}
              </strong>
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              id="wizard-next-confirm-btn"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 flex items-center gap-2"
            >
              <span>Next: Confirm Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CONFIRM YOUR BOOKING ================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">4. Confirm Your Booking</h3>
            <p className="text-xs text-slate-500">Please review your booking details and customer info</p>
          </div>

          {/* Conflict / Booking Engine Error Banner */}
          {bookingError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#FF2B72] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Slot Unavailable / Booking Conflict</p>
                  <p className="text-rose-700 font-normal mt-0.5">{bookingError.message}</p>
                </div>
              </div>
              {bookingError.alternatives && bookingError.alternatives.length > 0 && (
                <div className="pt-2 border-t border-rose-200/60">
                  <span className="text-[11px] font-bold text-rose-900 block mb-1.5">
                    Suggested Nearest Alternative Slots:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {bookingError.alternatives.map((alt) => (
                      <button
                        key={alt}
                        onClick={() => {
                          setSelectedTime(alt);
                          setBookingError(null);
                        }}
                        className="px-3 py-1 bg-white hover:bg-rose-100 text-[#FF2B72] border border-rose-200 font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                      >
                        Switch to {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Appointment Summary (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Appointment Summary
                  </span>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-[#FF2B72] hover:underline"
                  >
                    Edit Service
                  </button>
                </div>

                {/* Service row */}
                {selectedService && (
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
                    <img
                      referrerPolicy="no-referrer"
                      src={selectedService.imageUrl}
                      alt={selectedService.title}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-rose-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-slate-900">{selectedService.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{selectedService.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                        <span>⏱ {selectedService.duration} Min</span>
                        <span className="font-bold text-[#FF2B72]">Rs. {selectedService.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-700 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#FF2B72]" /> Date
                    </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-[#FF2B72]" /> Time Slot
                    </span>
                    <span className="font-semibold text-slate-800">{selectedTime}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#FF2B72]" /> Branch Location
                    </span>
                    <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                      {selectedBranch.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5 text-[#FF2B72]" /> Staff Preference
                    </span>
                    <span className="font-semibold text-slate-800">{selectedStylist.name}</span>
                  </div>
                </div>

                {/* Price Details */}
                <div className="bg-[#FFF5F8] p-3.5 rounded-xl border border-rose-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Service Price:</span>
                    <span className="font-semibold">Rs. {servicePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (5% GST):</span>
                    <span className="font-semibold">Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-rose-200/60 flex justify-between text-sm">
                    <span className="font-serif font-bold text-slate-900">Total Amount:</span>
                    <span className="text-base font-bold text-[#FF2B72]">
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right side: Customer Details Form (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200 p-5 space-y-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Customer Information
                </span>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="customer-name-input"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Hayat Khan"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#FF2B72] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address (For Confirmation & E-Invoice) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="customer-email-input"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. hayatkhan@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#FF2B72] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone / WhatsApp Number (For SMS Reminder) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="customer-phone-input"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#FF2B72] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                    />
                  </div>
                </div>

                {/* Special Request */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Special Request (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      id="customer-special-request"
                      rows={2}
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      placeholder="Any skin allergies, preferred music, dress drape style, etc."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-[#FF2B72] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20"
                    />
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#FF2B72] border-slate-300 rounded focus:ring-[#FF2B72]"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I agree to the <strong className="text-slate-800">Terms & Conditions</strong> and <strong className="text-slate-800">Salon Cancellation Policy</strong>.
                  </span>
                </label>

              </div>
            </div>

          </div>

          {/* Navigation & Final Confirm button */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              id="wizard-confirm-booking-btn"
              disabled={!agreeTerms || !customerName || !customerPhone}
              onClick={handleConfirmBooking}
              className={`px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg flex items-center gap-2 ${
                agreeTerms && customerName && customerPhone
                  ? 'bg-[#FF2B72] hover:bg-[#E61B61] shadow-pink-500/25 active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm Booking</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: BOOKING CONFIRMED! (Exact Match with Reference Screen) ================= */}
      {currentStep === 5 && confirmedBooking && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header Celebratory Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FF2B72] text-white flex items-center justify-center mx-auto shadow-xl shadow-pink-500/30 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] flex items-center justify-center gap-2">
              <span>Booking Confirmed!</span>
              <span className="text-[#FF2B72]">🤍</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your appointment has been successfully booked. We look forward to giving you an amazing experience.
            </p>

            {/* Booking ID Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFF5F8] border border-rose-200">
              <span className="text-xs text-slate-500">Booking ID:</span>
              <span className="font-mono font-bold text-sm text-[#FF2B72]">{confirmedBooking.id}</span>
              <button
                onClick={handleCopyBookingId}
                className="p-1 text-slate-400 hover:text-[#FF2B72] transition-colors"
                title="Copy ID"
              >
                {copiedId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Multi-Section Breakdown Grid (Matching Reference Screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Card: Visual Model + Summary (4 cols) */}
            <div className="lg:col-span-4 bg-gradient-to-b from-[#FFF5F8] to-white rounded-3xl border border-rose-100 p-5 space-y-4 text-center">
              <div className="relative aspect-[4/4.5] rounded-2xl overflow-hidden shadow-md">
                <img
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="Mikyaj Beauty Transformation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-serif italic text-center">
                  &quot;Elegance is the only beauty that never fades.&quot;
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">{confirmedBooking.serviceTitle}</p>
                <p className="text-[11px] text-slate-500">With {confirmedBooking.stylistName}</p>
              </div>
            </div>

            {/* Middle Card: What's Next & Calendar Save (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* What's Next Card */}
              <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  What&apos;s Next?
                </h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <p className="text-xs text-slate-600">
                      We will send you a confirmation email & SMS shortly.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <p className="text-xs text-slate-600">
                      You will receive a reminder 24 hours before your appointment.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <p className="text-xs text-slate-600">
                      Our expert will be ready to pamper you!
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Need to make changes? You can reschedule or cancel your appointment anytime in My Bookings.
                </p>
              </div>

              {/* Save to Calendar & Share */}
              <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Save to Calendar
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Google Calendar</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    onClick={() => alert('Calendar event (.ics) downloaded for Apple Calendar!')}
                    className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Apple Calendar</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Share Appointment</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`I just booked ${confirmedBooking.serviceTitle} at Mikyaj Beauty Parlor on ${confirmedBooking.date} at ${confirmedBooking.time}!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <button
                      onClick={handleCopyShareLink}
                      className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs flex items-center gap-1"
                    >
                      {copiedShare ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedShare ? 'Link Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Card: Full Appointment Details breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-[#FFF5F8] rounded-2xl border border-rose-100 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-rose-200/60">
                  Appointment Details
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700 pt-3">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-800 text-right">{confirmedBooking.serviceTitle}</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {new Date(confirmedBooking.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-semibold text-slate-800">{confirmedBooking.time}</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-semibold text-slate-800 text-right">{confirmedBooking.branchName}</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="text-[11px] text-slate-600 text-right max-w-[180px]">{confirmedBooking.branchAddress}</span>
                  </div>

                  <div className="flex items-start justify-between pt-2 border-t border-rose-200/60">
                    <span className="font-serif font-bold text-slate-900">Amount Paid:</span>
                    <span className="font-bold text-base text-[#FF2B72]">
                      Rs. {confirmedBooking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => alert(`Downloading official PDF Invoice for ${confirmedBooking.id}...`)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-rose-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF2B72]" /> Download Invoice
                </button>
              </div>

            </div>

          </div>

          {/* Action CTAs (View My Bookings + Back to Home) */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 flex-wrap">
            <button
              id="confirmed-view-bookings-btn"
              onClick={onGoToMyBookings}
              className="px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20"
            >
              View My Bookings
            </button>

            <button
              id="confirmed-back-home-btn"
              onClick={onGoToHome}
              className="px-7 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Back to Home
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
