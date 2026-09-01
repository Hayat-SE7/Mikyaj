import { useState } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  FileText, 
  Merge, 
  Lock, 
  Sparkles, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { CustomerRecord, Booking, AdminUser } from '../../types';

interface AdminCustomersViewProps {
  customers: CustomerRecord[];
  bookings: Booking[];
  currentAdmin: AdminUser;
  onUpdateCustomerNotes: (customerId: string, notes: string) => void;
  onMergeCustomers: (primaryId: string, duplicateId: string) => void;
}

export default function AdminCustomersView({
  customers,
  bookings,
  currentAdmin,
  onUpdateCustomerNotes,
  onMergeCustomers
}: AdminCustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [primaryId, setPrimaryId] = useState('');
  const [duplicateId, setDuplicateId] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCustomer = (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes || '');
    setIsNotesSaved(false);
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      onUpdateCustomerNotes(selectedCustomer.id, editingNotes);
      setIsNotesSaved(true);
      setTimeout(() => setIsNotesSaved(false), 2000);
    }
  };

  const handleExecuteMerge = () => {
    if (primaryId && duplicateId && primaryId !== duplicateId) {
      onMergeCustomers(primaryId, duplicateId);
      setMergeModalOpen(false);
      setPrimaryId('');
      setDuplicateId('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Customer Directory & CRM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer profiles, lifetime visit records, internal notes, and identity deduplication.
          </p>
        </div>

        <button
          onClick={() => setMergeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
        >
          <Merge className="w-3.5 h-3.5" />
          <span>Merge Duplicate Records (FR-A-CUST-04)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by full name, phone number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          />
        </div>
      </div>

      {/* Main Customers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Internal Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-[#FF2B72] flex items-center justify-center font-bold text-xs shrink-0">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{cust.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {cust.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800">{cust.phone}</div>
                    <div className="text-[10px] text-slate-400">{cust.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                      {cust.totalBookings ?? cust.bookingCount ?? 0} visits
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {cust.lastVisit || 'N/A'}
                  </td>

                  {/* Spend (Owner-Only per §7) */}
                  <td className="py-3.5 px-4">
                    {currentAdmin.isOwner ? (
                      <span className="font-bold text-[#FF2B72]">
                        Rs. {(cust.totalSpendPKR ?? cust.totalSpent ?? 0).toLocaleString()}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Lock className="w-3 h-3" />
                        <span>Owner Confidential</span>
                      </div>
                    )}
                  </td>


                  <td className="py-3.5 px-4 max-w-[200px]">
                    <span className="text-slate-600 text-[11px] truncate block" title={cust.notes}>
                      {cust.notes || <em className="text-slate-400 font-normal">No notes logged</em>}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenCustomer(cust)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details & Notes Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF2B72] text-white flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.phone} • {selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            {/* Visit History for this customer */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Booking History ({bookings.filter(b => b.customerPhone === selectedCustomer.phone).length} records)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bookings
                  .filter(b => b.customerPhone === selectedCustomer.phone)
                  .map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{b.reference}</span>
                          <span className="text-[10px] text-slate-400">• {b.date} at {b.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-semibold">{b.serviceTitle} (with {b.stylistName})</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#FF2B72]">Rs. {b.totalAmount.toLocaleString()}</span>
                        <span className="block text-[10px] text-slate-500 uppercase">{b.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Internal Notes Editor (FR-A-CUST-03) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Staff Internal Notes (Allergies, preferences, color formulas)
              </label>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="E.g., Prefers ammonia-free hair dyes, allergic to certain scented oils. Always requests tea during blowdry."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF2B72] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                {isNotesSaved ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Notes saved successfully
                  </span>
                ) : <span />}
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Customer Merge Modal (FR-A-CUST-04) */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-100">
              <Merge className="w-5 h-5 text-[#FF2B72]" />
              <h3 className="font-bold text-base">Customer Account Deduplication</h3>
            </div>

            <p className="text-xs text-slate-600">
              Consolidate duplicate customer records created by varied phone formats or guest bookings. All past booking references will be migrated to the primary account.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Customer (Keep)</label>
                <select
                  value={primaryId}
                  onChange={(e) => setPrimaryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="">Select Primary Customer Record</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duplicate Customer (Merge & Remove)</label>
                <select
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="">Select Duplicate Customer Record</option>
                  {customers.filter(c => c.id !== primaryId).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMergeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMerge}
                disabled={!primaryId || !duplicateId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] text-white disabled:opacity-50"
              >
                Execute Merge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
