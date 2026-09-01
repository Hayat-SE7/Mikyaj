// Mikyaj API v1 Client
// Conforms to Mikyaj Engineering Specification Rev. 5 (Section 11) & SRS v2.1 (Section 8.2)

export interface ApiStandardError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

export class MikyajApiClient {
  private baseUrl: string = '/api/v1';

  // Helper for fetch with JSON error handling
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw data as ApiStandardError;
    }
    return data as T;
  }

  // 1. Health check
  public async getHealth() {
    return this.request<{ status: string; system: string; version: string }>('/health');
  }

  // 2. Services & Availability
  public async getServices() {
    return this.request<{ services: any[]; categories: any[] }>('/services');
  }

  public async getAvailability(serviceId: string, date: string, staffId?: string) {
    const query = new URLSearchParams({ serviceId, date });
    if (staffId && staffId !== 'any') query.append('staffId', staffId);
    return this.request<{ date: string; serviceId: string; slots: any[] }>(`/availability?${query.toString()}`);
  }

  // 3. Bookings
  public async createBooking(payload: {
    serviceId: string;
    date: string;
    startTime: string;
    stylistId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    specialRequests?: string;
    branchId?: string;
  }, idempotencyKey?: string) {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    return this.request<{ booking: any; message: string }>('/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  }

  public async getBooking(id: string) {
    return this.request<{ booking: any; history: any[] }>(`/bookings/${id}`);
  }

  public async lookupGuestBooking(reference: string, phone: string) {
    return this.request<{ booking: any; history: any[] }>('/bookings/lookup', {
      method: 'POST',
      body: JSON.stringify({ reference, phone })
    });
  }

  public async rescheduleBooking(id: string, newDate: string, newTime: string, reason?: string, isAdminOverride?: boolean) {
    return this.request<{ success: boolean; booking: any; message: string }>(`/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDate, newTime, reason, isAdminOverride })
    });
  }

  public async cancelBooking(id: string, reason?: string, isAdminOverride?: boolean) {
    return this.request<{ success: boolean; booking: any; message: string }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, isAdminOverride })
    });
  }

  // 4. Reviews
  public async submitReview(bookingId: string, rating: number, comment?: string) {
    return this.request<{ success: boolean; review: any; message: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookingId, rating, comment })
    });
  }

  // 5. Admin operations
  public async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  public async getAdminBookings(filters?: { status?: string; staffId?: string; date?: string; search?: string }) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.staffId) query.append('staffId', filters.staffId);
    if (filters?.date) query.append('date', filters.date);
    if (filters?.search) query.append('search', filters.search);
    return this.request<{ bookings: any[]; total: number }>(`/admin/bookings?${query.toString()}`);
  }

  public async updateBookingStatus(id: string, action: 'accept' | 'reject' | 'complete' | 'noshow' | 'start', reason?: string, actorName?: string) {
    return this.request<{ success: boolean; booking: any; message: string }>(`/admin/bookings/${id}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ reason, actorName })
    });
  }

  public async reassignStylist(id: string, newStylistId: string, reason?: string, actorName?: string) {
    return this.request<{ success: boolean; booking: any }>(`/admin/bookings/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ newStylistId, reason, actorName })
    });
  }

  public async createWalkIn(payload: any) {
    return this.request<{ success: boolean; booking: any }>('/admin/bookings/walkin', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async resendNotification(id: string, actorName?: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/notifications/${id}/resend`, {
      method: 'POST',
      body: JSON.stringify({ actorName })
    });
  }

  public async runConcurrency50Test(serviceId?: string, date?: string, slot?: string) {
    return this.request<{
      totalRequests: number;
      successCount: number;
      conflictCount: number;
      results: any[];
    }>('/test/concurrency-50', {
      method: 'POST',
      body: JSON.stringify({ serviceId, date, slot })
    });
  }
}

export const api = new MikyajApiClient();
