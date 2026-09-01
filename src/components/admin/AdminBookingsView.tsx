import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Check, 
  AlertTriangle, 
  Eye, 
  FileText, 
  UserX, 
  RotateCcw, 
  Send, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  Printer, 
  Download,
  Plus
} from 'lucide-react';
import { 
  Booking, 
  BookingStatus, 
  Stylist, 
  AdminUser, 
  AuditLogItem, 
  NotificationOutboxItem 
} from '../../types';
import { getHoursUntilAppointment, SALON_POLICIES } from '../../lib/bookingEngine';

interface AdminBookingsViewProps {
  bookings: Booking[];
  stylists: Stylist[];
  currentAdmin: AdminUser;
  onUpdateBookingStatus: (bookingId: string, newStatus: BookingStatus, reason?: string) => void;
  onReassignStylist: (bookingId: string, newStylistId: string, reason: string) => void;
  onRescheduleBooking: (bookingId: string, newDate: string, newTime: string, reason: string) => void;
  onResendNotification: (bookingId: string, channel: 'email' | 'whatsapp') => void;
  onOpenWalkInModal: () => void;
  notificationOutbox: NotificationOutboxItem[];
}

export default function AdminBookingsView({
  bookings,
  stylists,
  currentAdmin,
  onUpdateBookingStatus,
  onReassignStylist,
  onRescheduleBooking,
  onResendNotification,
  onOpenWalkInModal,
  notificationOutbox
}: AdminBookingsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stylistFilter, setStylistFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals state
  const [selectedBookingForHistory, setSelectedBookingForHistory] = useState<Booking | null>(null);
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    actionType: 'CANCEL' | 'REJECT' | 'REASSIGN' | 'RESCHEDULE';
    newStylistId?: string;
    newDate?: string;
    newTime?: string;
  }>({
    isOpen: false,
    booking: null,
    actionType: 'CANCEL'
  });
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Search query matches reference, customerName, customerPhone, customerEmail, serviceTitle
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      b.reference.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.toLowerCase().includes(term) ||
      b.customerEmail.toLowerCase().includes(term) ||
      b.serviceTitle.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesStylist = stylistFilter === 'ALL' || b.stylistId === stylistFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;

    return matchesSearch && matchesStatus && matchesStylist && matchesDate;
  });

  // Handle Action Trigger
  const handleActionClick = (booking: Booking, action: 'ACCEPT' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCEL' | 'REJECT') => {
    if (action === 'ACCEPT') {
      onUpdateBookingStatus(booking.id, 'ACCEPTED');
    } else if (action === 'IN_PROGRESS') {
      onUpdateBookingStatus(booking.id, 'IN_PROGRESS');
    } else if (action === 'COMPLETED') {
      onUpdateBookingStatus(booking.id, 'COMPLETED');
    } else if (action === 'NO_SHOW') {
      onUpdateBookingStatus(booking.id, 'NO_SHOW');
    } else if (action === 'CANCEL') {
      // Check if within 24h window
      const hoursLeft = getHoursUntilAppointment(booking.date, booking.time);
      if (hoursLeft < SALON_POLICIES.cancellationWindowHours) {
        // Within 24h: policy override mandatory
        setOverrideModal({
          isOpen: true,
          booking,
          actionType: 'CANCEL'
        });
        setOverrideReason('');
        setOverrideError('');
      } else {
        onUpdateBookingStatus(booking.id, 'CANCELLED', 'Admin cancellation standard window');
      }
    } else if (action === 'REJECT') {
      setOverrideModal({
        isOpen: true,
        booking,
        actionType: 'REJECT'
      });
      setOverrideReason('');
      setOverrideError('');
    }
  };

  const submitOverrideAction = () => {
    if (!overrideReason.trim()) {
      setOverrideError('A detailed reason is required for administrative audit compliance (AUD-08).');
      return;
    }

    if (!overrideModal.booking) return;

    if (overrideModal.actionType === 'CANCEL') {
      onUpdateBookingStatus(overrideModal.booking.id, 'CANCELLED', overrideReason);
    } else if (overrideModal.actionType === 'REJECT') {
      onUpdateBookingStatus(overrideModal.booking.id, 'REJECTED', overrideReason);
    } else if (overrideModal.actionType === 'REASSIGN' && overrideModal.newStylistId) {
      onReassignStylist(overrideModal.booking.id, overrideModal.newStylistId, overrideReason);
    } else if (overrideModal.actionType === 'RESCHEDULE' && overrideModal.newDate && overrideModal.newTime) {
      onRescheduleBooking(overrideModal.booking.id, overrideModal.newDate, overrideModal.newTime, overrideReason);
    }

    setOverrideModal({ isOpen: false, booking: null, actionType: 'CANCEL' });
    setOverrideReason('');
  };

  // Print Daily Schedule Simulation (FR-A-BOOK-07)
  const handlePrintSchedule = () => {
    window.print();
  };

  // Export CSV (FR-A-BOOK-07)
  const handleExportCSV = () => {
    const headers = 'Reference,Date,Time,Status,Service,Customer,Phone,Stylist,Amount\n';
    const rows = filteredBookings.map(b => 
      `"${b.reference}","${b.date}","${b.time}","${b.status}","${b.serviceTitle}","${b.customerName}","${b.customerPhone}","${b.stylistName}",${b.totalAmount}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mikyaj_bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Booking Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch appointments, manage status transitions, and enforce cancellation policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintSchedule}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={onOpenWalkInModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Walk-in Booking</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search MK ref, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED (Confirmed)</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Stylist Filter */}
        <div>
          <select
            value={stylistFilter}
            onChange={(e) => setStylistFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          >
            <option value="ALL">All Stylists</option>
            {stylists.filter(s => s.id !== 'any').map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-600 font-bold hover:underline shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service & Total</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Stylist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notifications</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No bookings found matching your active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  // Badge color mapping
                  const statusColors: Record<BookingStatus, string> = {
                    DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
                    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
                    ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
                    COMPLETED: 'bg-slate-100 text-slate-800 border-slate-300',
                    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
                    NO_SHOW: 'bg-red-100 text-red-900 border-red-300',
                    REJECTED: 'bg-neutral-200 text-neutral-800 border-neutral-300',
                    RESCHEDULE_REQUESTED: 'bg-blue-100 text-blue-800 border-blue-300',
                    RESCHEDULED: 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  };


                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {b.reference}
                        </span>
                        {b.isGuest && (
                          <span className="ml-1 text-[9px] uppercase font-bold text-slate-500 bg-slate-200/70 px-1 rounded">
                            Guest
                          </span>
                        )}
                        {b.rescheduleCount > 0 && (
                          <span className="block text-[10px] text-blue-600 mt-0.5">
                            Rescheduled ({b.rescheduleCount}/2)
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.customerName}</div>
                        <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{b.customerEmail}</div>
                      </td>

                      {/* Service & Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.serviceTitle}</div>
                        <div className="text-[11px] text-[#FF2B72] font-bold">
                          Rs. {b.totalAmount.toLocaleString()}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-900 font-bold">{b.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{b.time}</span>
                        </div>
                      </td>

                      {/* Stylist */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{b.stylistName}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[b.status] || 'bg-slate-100'}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Notifications (Independent Delivery per §14 & DEC-027) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Email badge */}
                          <div 
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              b.emailStatus === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              b.emailStatus === 'DEAD_LETTER' ? 'bg-red-950 text-red-300 border-red-800' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                            title={`Email Status: ${b.emailStatus || 'SENT'}`}
                          >
                            <Mail className="w-2.5 h-2.5" />
                            <span>{b.emailStatus === 'DEAD_LETTER' ? 'DLQ' : (b.emailStatus || 'SENT')}</span>
                          </div>

                          {/* WhatsApp badge */}
                          <div 
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              b.whatsAppStatus === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              b.whatsAppStatus === 'DEAD_LETTER' ? 'bg-red-950 text-red-300 border-red-800' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                            title={`WhatsApp Status: ${b.whatsAppStatus || 'SENT'}`}
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>{b.whatsAppStatus === 'DEAD_LETTER' ? 'DLQ' : (b.whatsAppStatus || 'SENT')}</span>
                          </div>

                          {/* Scoped Single-Channel Resend (DEC-027) */}
                          {(b.emailStatus === 'DEAD_LETTER' || b.emailStatus === 'FAILED') && (
                            <button
                              onClick={() => onResendNotification(b.id, 'email')}
                              className="text-[9px] font-bold text-pink-600 hover:underline bg-pink-50 px-1 py-0.5 rounded"
                              title="Resend Email only"
                            >
                              Retry Email
                            </button>
                          )}
                          {(b.whatsAppStatus === 'DEAD_LETTER' || b.whatsAppStatus === 'FAILED') && (
                            <button
                              onClick={() => onResendNotification(b.id, 'whatsapp')}
                              className="text-[9px] font-bold text-emerald-600 hover:underline bg-emerald-50 px-1 py-0.5 rounded"
                              title="Resend WhatsApp only"
                            >
                              Retry WA
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* PENDING State Actions */}
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleActionClick(b, 'ACCEPT')}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                title="Accept & Notify"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleActionClick(b, 'REJECT')}
                                className="px-2 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Reject"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* ACCEPTED State Actions */}
                          {b.status === 'ACCEPTED' && (
                            <>
                              <button
                                onClick={() => handleActionClick(b, 'IN_PROGRESS')}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                                title="Check In Client (In Service)"
                              >
                                <Play className="w-3 h-3" />
                                <span>Check-in</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(b, 'NO_SHOW')}
                                className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                                title="Mark as No-Show"
                              >
                                No-Show
                              </button>
                              <button
                                onClick={() => handleActionClick(b, 'CANCEL')}
                                className="px-2 py-1 rounded-md text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100"
                                title="Cancel (Checks 24h Policy)"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* IN_PROGRESS State Actions */}
                          {b.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleActionClick(b, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                              title="Mark Service Completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* View Status Timeline History */}
                          <button
                            onClick={() => setSelectedBookingForHistory(b)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="View Status History Timeline (DEC-003)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Booking Status History Timeline Drawer (DEC-003) */}
      {selectedBookingForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Status History Audit</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-pink-600 font-bold">
                    {selectedBookingForHistory.reference}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Immutable status transitions (DEC-003)</p>
              </div>
              <button
                onClick={() => setSelectedBookingForHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 max-h-[360px] overflow-y-auto pr-1">
              {selectedBookingForHistory.statusHistory && selectedBookingForHistory.statusHistory.length > 0 ? (
                selectedBookingForHistory.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-0 last:pb-0">
                    <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#FF2B72] ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {item.fromStatus} → <span className="text-[#FF2B72]">{item.toStatus}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600"><strong>Actor:</strong> {item.actor}</p>
                      {item.reason && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                          <strong>Override Reason:</strong> &quot;{item.reason}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No historical status records found.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBookingForHistory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mandatory Policy Override Reason Modal (BR-C-008, AUD-08) */}
      {overrideModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Administrative Policy Override</h3>
                <p className="text-xs text-slate-500">
                  Target: {overrideModal.booking?.reference} ({overrideModal.actionType})
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Compliance Directive (AUD-08 / BR-C-008):</p>
              <p className="text-[11px]">
                Any manual cancellation within the 24h cancellation window, rejection, or stylist reassignment requires a logged justification in the immutable audit trail.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Mandatory Override Justification Reason *
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => {
                  setOverrideReason(e.target.value);
                  setOverrideError('');
                }}
                placeholder="E.g., Client called front desk with medical emergency; waived penalty per salon manager authorization."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF2B72] focus:outline-none"
              />
              {overrideError && (
                <p className="text-xs text-rose-600 font-bold">{overrideError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModal({ isOpen: false, booking: null, actionType: 'CANCEL' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Dismiss
              </button>
              <button
                onClick={submitOverrideAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
              >
                Confirm & Log Override
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
