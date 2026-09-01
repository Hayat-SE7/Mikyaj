import { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Clock, 
  DollarSign, 
  Check, 
  EyeOff, 
  Eye, 
  Search,
  Tag
} from 'lucide-react';
import { ServiceItem } from '../../types';

interface AdminServicesViewProps {
  services: ServiceItem[];
  onToggleServiceActive: (serviceId: string) => void;
  onUpdateService: (updatedService: ServiceItem) => void;
  onAddService: (newService: ServiceItem) => void;
}

export default function AdminServicesView({
  services,
  onToggleServiceActive,
  onUpdateService,
  onAddService
}: AdminServicesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  // New service state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hair');
  const [newPrice, setNewPrice] = useState(4000);
  const [newDuration, setNewDuration] = useState(45);
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const categories = ['ALL', 'Hair', 'Skin & Facial', 'Bridal & Party', 'Nails & Spa', 'Massage'];

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSaveNewService = () => {
    if (!newTitle.trim()) return;
    const newService: ServiceItem = {
      id: `srv-${Date.now().toString(36)}`,
      title: newTitle,
      category: newCategory as any,
      price: newPrice,
      duration: newDuration,
      description: newDescription || 'Premium beauty treatment with luxury salon products.',
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      active: true,
      popular: false,
      rating: 5.0,
      reviewsCount: 0,
      included: ['Consultation', 'Premium Treatment', 'Finishing Styling']
    };

    onAddService(newService);
    setIsNewServiceModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleSaveEditService = () => {
    if (editingService) {
      onUpdateService(editingService);
      setEditingService(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Services & Treatment Menu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage salon services, pricing in PKR, durations, and visibility status.
          </p>
        </div>

        <button
          onClick={() => setIsNewServiceModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service name or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF2B72]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`bg-white rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition-all ${
              service.active === false ? 'opacity-60 border-dashed border-slate-300' : 'border-slate-200 hover:border-pink-300'
            }`}
          >
            <div>
              <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                <img
                  referrerPolicy="no-referrer"
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {service.category}
                  </span>
                  {service.active === false && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                      Inactive (Soft Deleted)
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900">{service.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold text-[#FF2B72] text-sm">
                  Rs. {service.price.toLocaleString()}
                </span>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{service.duration} mins</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onToggleServiceActive(service.id)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  service.active === false
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Soft delete toggle: Inactive services are hidden from customer wizard but remain in past booking audits."
              >
                {service.active === false ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Activate</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deactivate</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setEditingService({ ...service })}
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Edit Service */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">Edit Service Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditService}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] text-white shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Service */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">Create New Salon Service</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  placeholder="E.g., Keratin Hair Botox Deluxe"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skin & Facial">Skin & Facial</option>
                    <option value="Bridal & Party">Bridal & Party</option>
                    <option value="Nails & Spa">Nails & Spa</option>
                    <option value="Massage">Massage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (m)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Enter treatment overview..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewService}
                disabled={!newTitle.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] text-white disabled:opacity-50"
              >
                Create Service
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
