import { useState, useMemo } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import SearchFilterBar from './components/SearchFilterBar';
import ServiceCatalog from './components/ServiceCatalog';
import BookingSidebar from './components/BookingSidebar';
import BookingWizard from './components/BookingWizard';
import MyBookingsView from './components/MyBookingsView';
import PackagesView from './components/PackagesView';
import StylistsView from './components/StylistsView';
import BranchesView from './components/BranchesView';
import InvoiceModal from './components/InvoiceModal';
import CustomerSupportModal from './components/CustomerSupportModal';
import Footer from './components/Footer';

// Admin Console Components
import AdminHeader from './components/admin/AdminHeader';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBookingsView from './components/admin/AdminBookingsView';
import AdminCustomersView from './components/admin/AdminCustomersView';
import AdminStaffView from './components/admin/AdminStaffView';
import AdminServicesView from './components/admin/AdminServicesView';
import AdminReportsView from './components/admin/AdminReportsView';
import AdminSettingsView from './components/admin/AdminSettingsView';
import AdminConcurrencyTestView from './components/admin/AdminConcurrencyTestView';
import WalkInBookingModal from './components/admin/WalkInBookingModal';

import { 
  SERVICES, 
  STYLISTS, 
  BRANCHES, 
  INITIAL_BOOKINGS, 
  SPECIAL_PACKAGES, 
  TIME_SLOTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATION_OUTBOX
} from './data/salonData';
import { 
  ServiceItem, 
  ServiceCategory, 
  Stylist, 
  Branch, 
  Booking, 
  PackageOffer, 
  CustomerNotification,
  AdminUser,
  AuditLogItem,
  CustomerRecord,
  NotificationOutboxItem,
  SalonPolicyConfig,
  BookingStatus
} from './types';
import { SALON_POLICIES, generateBookingReference } from './lib/bookingEngine';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState<boolean>(false);

  // Admin Profile & Role State (Owner vs Staff Desk)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser>({
    id: 'admin-owner-1',
    name: 'Hayat Rahman',
    email: 'hayat.rahman@mikyaj.pk',
    isOwner: true,
    branchId: 'gulberg'
  });

  // Core Data States
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [stylists, setStylists] = useState<Stylist[]>(STYLISTS);
  const [branches] = useState<Branch[]>(BRANCHES);
  const [packages] = useState<PackageOffer[]>(SPECIAL_PACKAGES);
  const [timeSlots] = useState(TIME_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useState<CustomerNotification[]>(INITIAL_NOTIFICATIONS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [notificationOutbox, setNotificationOutbox] = useState<NotificationOutboxItem[]>(INITIAL_NOTIFICATION_OUTBOX);
  const [policies, setPolicies] = useState<SalonPolicyConfig>(SALON_POLICIES);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All Services');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(BRANCHES[0]); // Gulberg Flagship
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-12');
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [selectedStylist, setSelectedStylist] = useState<Stylist>(STYLISTS[0]); // Sana

  // Active Selected Service for live booking cart
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(SERVICES[0]); // Bridal Makeup default

  // Modals
  const [invoiceModalBooking, setInvoiceModalBooking] = useState<Booking | null>(null);
  const [supportModalType, setSupportModalType] = useState<'support' | 'reviews' | 'policies' | null>(null);

  // Categories list
  const categories: ServiceCategory[] = [
    'All Services',
    'Hair',
    'Makeup',
    'Skincare',
    'Nail Art',
    'Bridal',
    'Facial',
    'Body Spa',
    'Threading'
  ];

  // Helper: Append Audit Log Item
  const logAuditEvent = (
    action: string,
    entityType: 'Booking' | 'Staff' | 'Setting' | 'Customer' | 'Service',
    entityId: string,
    reason: string,
    beforeState?: string,
    afterState?: string
  ) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: isAdminPortalOpen ? currentAdmin.id : 'customer-hayat',
      actorName: isAdminPortalOpen ? currentAdmin.name : 'Hayat Khan (Customer)',
      actorRole: isAdminPortalOpen ? (currentAdmin.isOwner ? 'Owner' : 'Admin') : 'Customer',
      action,
      entityType,
      entityId,
      reason,
      beforeState,
      afterState,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'All Services' || service.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Active upcoming booking for footer tracking ribbon
  const upcomingBookings = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PENDING' || b.status === 'Upcoming');
  const activeUpcomingBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  // Handlers for Customer Flow
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleSelectStylist = (stylist: Stylist) => {
    setSelectedStylist(stylist);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleRescheduleBooking = (bookingId: string, newDate: string, newTime: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const oldDate = booking ? booking.date : '';
    const oldTime = booking ? booking.time : '';
    const updatedRescheduleCount = (booking?.rescheduleCount || 0) + 1;

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const newStatusHistory = [
            ...(b.statusHistory || []),
            {
              id: `sh-${Date.now()}`,
              bookingId: b.id,
              fromStatus: b.status,
              toStatus: b.status,
              actor: 'Customer: Hayat Khan',
              notes: `Rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}`,
              timestamp: new Date().toISOString()
            }
          ];

          return {
            ...b,
            date: newDate,
            time: newTime,
            rescheduleCount: updatedRescheduleCount,
            updatedAt: new Date().toISOString(),
            statusHistory: newStatusHistory
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'CUSTOMER_RESCHEDULE',
      'Booking',
      booking?.reference || bookingId,
      `Customer rescheduled appointment (${updatedRescheduleCount}/2 used)`,
      `${oldDate} ${oldTime}`,
      `${newDate} ${newTime}`
    );

    // Add confirmation notification
    const newNotif: CustomerNotification = {
      id: `notif-${Date.now()}`,
      title: `Appointment Rescheduled: ${booking?.reference || bookingId}`,
      message: `Your booking was updated to ${newDate} at ${newTime} at ${selectedBranch.name}.`,
      timestamp: 'Just now',
      unread: true,
      type: 'booking',
      bookingRef: booking?.reference || bookingId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const newStatusHistory = [
            ...(b.statusHistory || []),
            {
              id: `sh-${Date.now()}`,
              bookingId: b.id,
              fromStatus: b.status,
              toStatus: 'CANCELLED' as BookingStatus,
              actor: 'Customer: Hayat Khan',
              reason: 'Customer initiated cancellation under 24-hour free window',
              timestamp: new Date().toISOString()
            }
          ];
          return {
            ...b,
            status: 'CANCELLED' as BookingStatus,
            cancellationReason: 'Customer initiated cancellation under 24-hour free window',
            updatedAt: new Date().toISOString(),
            statusHistory: newStatusHistory
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'CUSTOMER_CANCELLATION',
      'Booking',
      booking?.reference || bookingId,
      'Customer cancelled appointment within free 24-hour self-service window',
      booking?.status || 'ACCEPTED',
      'CANCELLED'
    );

    const newNotif: CustomerNotification = {
      id: `notif-${Date.now()}`,
      title: `Booking Cancelled: ${booking?.reference || bookingId}`,
      message: `Your appointment has been cancelled successfully without penalty.`,
      timestamp: 'Just now',
      unread: true,
      type: 'booking',
      bookingRef: booking?.reference || bookingId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleFinishNewBooking = (newBooking: Booking) => {
    // Ensure audit trail & reference are complete
    const completedBooking: Booking = {
      ...newBooking,
      reference: newBooking.reference || generateBookingReference(),
      rescheduleCount: 0,
      refundStatus: 'none',
      emailStatus: 'SENT',
      whatsAppStatus: 'SENT',
      statusHistory: newBooking.statusHistory && newBooking.statusHistory.length > 0 ? newBooking.statusHistory : [
        {
          id: `sh-${Date.now()}`,
          bookingId: newBooking.id,
          fromStatus: 'DRAFT',
          toStatus: newBooking.status,
          actor: `Customer: ${newBooking.customerName}`,
          notes: 'Online booking created through customer portal',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setBookings(prev => [completedBooking, ...prev]);

    logAuditEvent(
      'BOOKING_CREATED',
      'Booking',
      completedBooking.reference,
      `New online booking created for ${completedBooking.serviceTitle} on ${completedBooking.date}`,
      'DRAFT',
      completedBooking.status
    );

    const newNotif: CustomerNotification = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed: ${completedBooking.reference}`,
      message: `Your ${completedBooking.serviceTitle} appointment for ${completedBooking.date} at ${completedBooking.time} is confirmed!`,
      timestamp: 'Just now',
      unread: true,
      type: 'booking',
      bookingRef: completedBooking.reference
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSelectPackage = (pkg: PackageOffer) => {
    const matchingService = services.find(s => s.category === 'Bridal') || services[0];
    setSelectedService({
      ...matchingService,
      id: pkg.id,
      title: pkg.title,
      price: pkg.discountedPrice,
      duration: 90,
      description: pkg.tagline,
      imageUrl: pkg.imageUrl
    });
    setIsWizardOpen(true);
  };

  const handleBookWithStylist = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setIsWizardOpen(true);
  };

  const handleBookAtBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsWizardOpen(true);
  };

  // Handlers for Admin Operations
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus, reason?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const oldStatus = booking.status;
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const newHistory = [
            ...(b.statusHistory || []),
            {
              id: `sh-${Date.now()}`,
              bookingId: b.id,
              fromStatus: oldStatus,
              toStatus: newStatus,
              actor: `Admin: ${currentAdmin.name} (${currentAdmin.isOwner ? 'Owner' : 'Staff'})`,
              reason: reason || `Status changed by salon desk to ${newStatus}`,
              timestamp: new Date().toISOString()
            }
          ];
          return {
            ...b,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            statusHistory: newHistory
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'ADMIN_STATUS_UPDATE',
      'Booking',
      booking.reference || bookingId,
      reason || `Admin changed status from ${oldStatus} to ${newStatus}`,
      oldStatus,
      newStatus
    );
  };

  const handleReassignStylist = (bookingId: string, newStylistId: string, reason: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const targetStylist = stylists.find(s => s.id === newStylistId);
    if (!booking || !targetStylist) return;

    const oldStylist = booking.stylistName;
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            stylistId: targetStylist.id,
            stylistName: targetStylist.name,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...(b.statusHistory || []),
              {
                id: `sh-${Date.now()}`,
                bookingId: b.id,
                fromStatus: b.status,
                toStatus: b.status,
                actor: `Admin: ${currentAdmin.name}`,
                notes: `Stylist reassigned from ${oldStylist} to ${targetStylist.name}. Reason: ${reason}`,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'STAFF_REASSIGNMENT',
      'Booking',
      booking.reference || bookingId,
      reason,
      oldStylist,
      targetStylist.name
    );
  };

  const handleRescheduleByAdmin = (bookingId: string, newDate: string, newTime: string, reason: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            date: newDate,
            time: newTime,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...(b.statusHistory || []),
              {
                id: `sh-${Date.now()}`,
                bookingId: b.id,
                fromStatus: b.status,
                toStatus: b.status,
                actor: `Admin: ${currentAdmin.name}`,
                notes: `Admin override reschedule to ${newDate} ${newTime}. Reason: ${reason}`,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'ADMIN_RESCHEDULE_OVERRIDE',
      'Booking',
      booking.reference || bookingId,
      reason,
      `${booking.date} ${booking.time}`,
      `${newDate} ${newTime}`
    );
  };

  const handleResendNotification = (bookingId: string, channel: 'email' | 'whatsapp') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Simulate resending notification
    setNotificationOutbox(prev => [
      {
        id: `outbox-${Date.now()}`,
        bookingId: booking.id,
        bookingRef: booking.reference || booking.id,
        channel,
        event: 'manual_resend',
        templateName: `resend_${channel}`,
        recipient: channel === 'email' ? booking.customerEmail : booking.customerPhone,
        status: 'SENT',
        attemptCount: 1,
        maxAttempts: 5,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      },
      ...prev
    ]);

    // Update status on booking
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            [channel === 'email' ? 'emailStatus' : 'whatsAppStatus']: 'SENT'
          };
        }
        return b;
      })
    );

    logAuditEvent(
      'NOTIFICATION_RESEND',
      'Booking',
      booking.reference || bookingId,
      `Manual resend of ${channel.toUpperCase()} notification by Admin`
    );
  };

  const handleConfirmWalkIn = (bookingData: {
    serviceId: string;
    stylistId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    time: string;
    specialRequests?: string;
  }) => {
    const srv = services.find(s => s.id === bookingData.serviceId) || services[0];
    const sty = stylists.find(s => s.id === bookingData.stylistId) || stylists[0];
    const tax = Math.round(srv.price * (policies.taxRatePercent / 100));

    const newBooking: Booking = {
      id: `bkg-walkin-${Date.now()}`,
      reference: generateBookingReference(),
      serviceId: srv.id,
      serviceTitle: srv.title,
      serviceCategory: srv.category,
      servicePrice: srv.price,
      tax,
      totalAmount: srv.price + tax,
      duration: srv.duration,
      date: bookingData.date,
      time: bookingData.time,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      branchAddress: selectedBranch.address,
      stylistId: sty.id,
      stylistName: sty.name,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      specialRequests: bookingData.specialRequests,
      status: 'ACCEPTED',
      createdAt: new Date().toISOString(),
      imageUrl: srv.imageUrl,
      rescheduleCount: 0,
      refundStatus: 'none',
      emailStatus: 'SENT',
      whatsAppStatus: 'SENT',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          bookingId: `bkg-walkin-${Date.now()}`,
          fromStatus: 'DRAFT',
          toStatus: 'ACCEPTED',
          actor: `Front Desk Walk-In (${currentAdmin.name})`,
          notes: 'Direct salon front desk walk-in appointment entry',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setBookings(prev => [newBooking, ...prev]);
    setIsWalkInModalOpen(false);

    logAuditEvent(
      'WALKIN_BOOKING_CREATED',
      'Booking',
      newBooking.reference,
      `Front desk created walk-in booking for ${bookingData.customerName}`
    );
  };

  const handleToggleAdminRole = (isOwner: boolean) => {
    setCurrentAdmin(prev => ({
      ...prev,
      isOwner,
      name: isOwner ? 'Hayat Rahman (Owner)' : 'Amina Staff Desk'
    }));
  };

  const handleUpdateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, notes: [...c.notes, notes] } : c
      )
    );
    logAuditEvent('CUSTOMER_NOTES_UPDATE', 'Customer', customerId, `Updated internal customer notes: ${notes}`);
  };

  const handleMergeCustomers = (primaryId: string, duplicateId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== duplicateId));
    logAuditEvent('CUSTOMER_MERGE', 'Customer', primaryId, `Merged duplicate customer record ${duplicateId} into ${primaryId}`);
  };

  const handleToggleBookable = (stylistId: string) => {
    setStylists(prev =>
      prev.map(s => {
        if (s.id === stylistId) {
          const updated = { ...s, available: !s.available };
          logAuditEvent('STAFF_AVAILABILITY_TOGGLE', 'Staff', stylistId, `Changed stylist bookable status to ${updated.available}`);
          return updated;
        }
        return s;
      })
    );
  };

  const handleUpdateQualifiedServices = (stylistId: string, serviceIds: string[]) => {
    setStylists(prev =>
      prev.map(s =>
        s.id === stylistId ? { ...s, specialities: serviceIds } : s
      )
    );
    logAuditEvent('STAFF_SKILLS_UPDATE', 'Staff', stylistId, `Updated qualified services list: ${serviceIds.join(', ')}`);
  };

  const handleAddLeavePeriod = (stylistId: string, leave: { start: string; end: string; reason: string }) => {
    logAuditEvent('STAFF_LEAVE_REGISTERED', 'Staff', stylistId, `Leave scheduled from ${leave.start} to ${leave.end}: ${leave.reason}`);
  };

  const handleToggleServiceActive = (serviceId: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const updated = { ...s, active: s.active === false ? true : false };
          logAuditEvent('SERVICE_ACTIVE_TOGGLE', 'Service', serviceId, `Service active status changed to ${updated.active}`);
          return updated;
        }
        return s;
      })
    );
  };

  const handleUpdateService = (updatedService: ServiceItem) => {
    setServices(prev =>
      prev.map(s => (s.id === updatedService.id ? updatedService : s))
    );
    logAuditEvent('SERVICE_DETAILS_UPDATE', 'Service', updatedService.id, `Updated pricing or details for ${updatedService.title}`);
  };

  const handleAddService = (newService: ServiceItem) => {
    setServices(prev => [newService, ...prev]);
    logAuditEvent('SERVICE_CREATED', 'Service', newService.id, `Created new service item: ${newService.title}`);
  };

  const handleUpdatePolicies = (updatedPolicies: SalonPolicyConfig) => {
    setPolicies(updatedPolicies);
    logAuditEvent('SALON_POLICIES_UPDATE', 'Setting', 'salon_policy_config', 'Updated salon policy settings (cancellation, tax, buffer)');
  };

  const handleTriggerDeadLetterSimulation = () => {
    const deadLetterItem: NotificationOutboxItem = {
      id: `outbox-dl-${Date.now()}`,
      bookingId: bookings[0]?.id || 'bkg-demo',
      bookingRef: bookings[0]?.reference || 'MK-SIM99',
      channel: 'whatsapp',
      event: 'booking_accepted',
      templateName: 'booking_accepted_wa',
      recipient: '+92 300 0000000',
      status: 'DEAD_LETTER',
      attemptCount: 5,
      maxAttempts: 5,
      lastError: 'Simulated Network Failure: WhatsApp Business API 503 Service Unavailable',
      createdAt: new Date().toISOString()
    };
    setNotificationOutbox(prev => [deadLetterItem, ...prev]);
  };

  // Dead-letter count
  const deadLetterCount = notificationOutbox.filter(item => item.status === 'DEAD_LETTER').length;
  const pendingBookingCount = bookings.filter(b => b.status === 'PENDING').length;

  // ================= RENDER: ADMIN CONSOLE =================
  if (isAdminPortalOpen) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        {/* Admin Header */}
        <AdminHeader
          currentAdmin={currentAdmin}
          onToggleAdminRole={handleToggleAdminRole}
          activeTab={adminTab}
          onSelectTab={setAdminTab}
          onSwitchToCustomerPortal={() => setIsAdminPortalOpen(false)}
          pendingCount={pendingBookingCount}
          deadLetterCount={deadLetterCount}
        />

        {/* Admin Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {adminTab === 'dashboard' && (
            <AdminDashboard
              bookings={bookings}
              stylists={stylists}
              currentBranch={selectedBranch}
              currentAdmin={currentAdmin}
              onAcceptBooking={(id) => handleUpdateBookingStatus(id, 'ACCEPTED', 'Accepted by admin dashboard')}
              onRejectBooking={(id, reason) => handleUpdateBookingStatus(id, 'REJECTED', reason || 'Rejected by salon desk')}
              onOpenBookingDetails={(b) => setInvoiceModalBooking(b)}
              onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
              onNavigateToBookings={() => setAdminTab('bookings')}
              auditLogs={auditLogs}
            />
          )}

          {adminTab === 'bookings' && (
            <AdminBookingsView
              bookings={bookings}
              stylists={stylists}
              currentAdmin={currentAdmin}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onReassignStylist={handleReassignStylist}
              onRescheduleBooking={handleRescheduleByAdmin}
              onResendNotification={handleResendNotification}
              onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
              notificationOutbox={notificationOutbox}
            />
          )}

          {adminTab === 'customers' && (
            <AdminCustomersView
              customers={customers}
              bookings={bookings}
              currentAdmin={currentAdmin}
              onUpdateCustomerNotes={handleUpdateCustomerNotes}
              onMergeCustomers={handleMergeCustomers}
            />
          )}

          {adminTab === 'staff' && (
            <AdminStaffView
              stylists={stylists}
              services={services}
              onToggleBookable={handleToggleBookable}
              onUpdateQualifiedServices={handleUpdateQualifiedServices}
              onAddLeavePeriod={handleAddLeavePeriod}
            />
          )}

          {adminTab === 'services' && (
            <AdminServicesView
              services={services}
              onToggleServiceActive={handleToggleServiceActive}
              onUpdateService={handleUpdateService}
              onAddService={handleAddService}
            />
          )}

          {adminTab === 'reports' && (
            <AdminReportsView
              bookings={bookings}
              stylists={stylists}
              services={services}
              currentAdmin={currentAdmin}
            />
          )}

          {adminTab === 'settings' && (
            <AdminSettingsView
              policies={policies}
              onUpdatePolicies={handleUpdatePolicies}
              auditLogs={auditLogs}
              currentAdmin={currentAdmin}
            />
          )}

          {adminTab === 'concurrency-test' && (
            <AdminConcurrencyTestView
              services={services}
              stylists={stylists}
              currentBranch={selectedBranch}
              bookings={bookings}
              timeSlots={timeSlots}
              notificationOutbox={notificationOutbox}
              onTriggerDeadLetterSimulation={handleTriggerDeadLetterSimulation}
              onResendNotification={handleResendNotification}
            />
          )}
        </main>

        {/* Walk-in Booking Modal */}
        <WalkInBookingModal
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          services={services}
          stylists={stylists}
          currentBranch={selectedBranch}
          onConfirmWalkIn={handleConfirmWalkIn}
        />

        {/* Invoice / Details Modal */}
        {invoiceModalBooking && (
          <InvoiceModal
            booking={invoiceModalBooking}
            onClose={() => setInvoiceModalBooking(null)}
          />
        )}
      </div>
    );
  }

  // ================= RENDER: CUSTOMER SELF-SERVICE PORTAL =================
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1E293B]">
      
      {/* 1. Top Header & Navigation Bar */}
      <Header
        currentTab={isWizardOpen ? 'wizard' : currentTab}
        onSelectTab={(tab) => {
          setIsWizardOpen(false);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        upcomingBookingCount={upcomingBookings.length}
        onOpenBooking={() => {
          setIsWizardOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        customerName="Hayat Khan"
        activeBookings={bookings}
        onSwitchToAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* ================= VIEW 1: FULL-SCREEN GUIDED BOOKING WIZARD ================= */}
        {isWizardOpen ? (
          <BookingWizard
            initialService={selectedService}
            services={services}
            categories={categories}
            stylists={stylists}
            branches={branches}
            currentBranch={selectedBranch}
            timeSlots={timeSlots}
            existingBookings={bookings}
            onFinishBooking={handleFinishNewBooking}
            onGoToHome={() => setIsWizardOpen(false)}
            onGoToMyBookings={() => {
              setIsWizardOpen(false);
              setCurrentTab('bookings');
            }}
          />
        ) : (
          <>
            {/* ================= VIEW 2: HOME / SERVICES (2-COLUMN GRID PORTAL) ================= */}
            {(currentTab === 'home' || currentTab === 'services') && (
              <div>
                
                {/* Promotional Hero Banner */}
                <HeroBanner
                  onBookClick={() => setIsWizardOpen(true)}
                  onExplorePackages={() => setCurrentTab('packages')}
                />

                {/* Quick Service Search & Filter Bar */}
                <SearchFilterBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  branches={branches}
                  selectedBranch={selectedBranch}
                  onBranchChange={setSelectedBranch}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Services');
                  }}
                  totalMatches={filteredServices.length}
                />

                {/* Services & Booking Grid (2-Column Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                  
                  {/* Left Column — Interactive Service Catalog (8 cols) */}
                  <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                          {selectedCategory === 'All Services' ? 'Explore Beauty Services & Treatments' : `${selectedCategory} Treatments`}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select any treatment below to customize your appointment session.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsWizardOpen(true)}
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2B72] hover:underline"
                      >
                        <span>Step-by-Step Wizard</span>
                        <span>→</span>
                      </button>
                    </div>

                    <ServiceCatalog
                      services={filteredServices}
                      selectedService={selectedService}
                      onSelectService={handleSelectService}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      categories={categories}
                    />
                  </div>

                  {/* Right Column — Live Booking Widget / Cart (4 cols) */}
                  <div className="lg:col-span-4">
                    <BookingSidebar
                      selectedService={selectedService}
                      stylists={stylists}
                      selectedStylist={selectedStylist}
                      onSelectStylist={handleSelectStylist}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      timeSlots={timeSlots}
                      selectedBranch={selectedBranch}
                      onProceedToConfirm={() => setIsWizardOpen(true)}
                      onClearService={() => setSelectedService(null)}
                    />
                  </div>

                </div>

              </div>
            )}

            {/* ================= VIEW 3: SPECIAL PACKAGES ================= */}
            {currentTab === 'packages' && (
              <PackagesView
                packages={packages}
                onSelectPackage={handleSelectPackage}
              />
            )}

            {/* ================= VIEW 4: OUR STYLISTS ================= */}
            {currentTab === 'stylists' && (
              <StylistsView
                stylists={stylists}
                onBookWithStylist={handleBookWithStylist}
              />
            )}

            {/* ================= VIEW 5: LOCATIONS / BRANCHES ================= */}
            {currentTab === 'branches' && (
              <BranchesView
                branches={branches}
                selectedBranch={selectedBranch}
                onSelectBranch={setSelectedBranch}
                onBookAtBranch={handleBookAtBranch}
              />
            )}

            {/* ================= VIEW 6: MY BOOKINGS DASHBOARD ================= */}
            {currentTab === 'bookings' && (
              <MyBookingsView
                bookings={bookings}
                onReschedule={handleRescheduleBooking}
                onCancelBooking={handleCancelBooking}
                onBookNewService={() => {
                  setCurrentTab('services');
                  setIsWizardOpen(false);
                }}
                onShowInvoice={(b) => setInvoiceModalBooking(b)}
                onSelectTab={setCurrentTab}
              />
            )}

          </>
        )}

      </main>

      {/* Footer & Active Booking Tracker */}
      <Footer
        activeUpcomingBooking={activeUpcomingBooking}
        onOpenBookingTab={() => {
          setIsWizardOpen(false);
          setCurrentTab('bookings');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSupport={() => setSupportModalType('support')}
        onOpenReviews={() => setSupportModalType('reviews')}
        onOpenPolicies={() => setSupportModalType('policies')}
        onSelectTab={(tab) => {
          setIsWizardOpen(false);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Invoice Modal */}
      {invoiceModalBooking && (
        <InvoiceModal
          booking={invoiceModalBooking}
          onClose={() => setInvoiceModalBooking(null)}
        />
      )}

      {/* Support / Reviews / Policies Modal */}
      {supportModalType && (
        <CustomerSupportModal
          type={supportModalType}
          onClose={() => setSupportModalType(null)}
        />
      )}

    </div>
  );
}

