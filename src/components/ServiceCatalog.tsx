import { useState } from 'react';
import { 
  Clock, 
  Star, 
  Check, 
  Plus, 
  Info, 
  Sparkles, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../types';

interface ServiceCatalogProps {
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  onSelectService: (service: ServiceItem) => void;
  selectedCategory: ServiceCategory;
  onCategoryChange: (category: ServiceCategory) => void;
  categories: ServiceCategory[];
}

export default function ServiceCatalog({
  services,
  selectedService,
  onSelectService,
  selectedCategory,
  onCategoryChange,
  categories
}: ServiceCatalogProps) {
  const [detailModalService, setDetailModalService] = useState<ServiceItem | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Category Navigation Pills (Matching Reference Image sidebar/tab style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`catalog-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#FF2B72] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white text-slate-600 hover:bg-rose-50/70 border border-slate-200'
              }`}
            >
              <span>{cat}</span>
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Services Grid (2 Columns on large screen for left area) */}
      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-[#FF2B72] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No treatments match your current filter. Try resetting or selecting a different category.
          </p>
          <button
            onClick={() => onCategoryChange('All Services')}
            className="mt-4 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#FF2B72]"
          >
            Show All Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className={`group bg-white p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FF2B72] ring-2 ring-[#FF2B72]/20 shadow-md'
                    : 'border-slate-100 shadow-xs hover:border-[#FF2B72]/30 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Image Thumbnail with Overlay Price Badge */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 mb-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    {/* Category Tag */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs">
                      {service.category}
                    </span>

                    {/* Price Pill Badge (Signature Editorial Card Style) */}
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 backdrop-blur-xs text-slate-900 shadow-xs">
                      Rs. {service.price.toLocaleString()}
                    </span>

                    {/* Rating Badge Bottom Left */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] text-white font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{service.rating}</span>
                      <span className="text-slate-300">({service.reviewsCount})</span>
                    </div>

                    {/* Discount badge if present */}
                    {service.featuredDiscount && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF2B72] text-white shadow-xs">
                        {service.featuredDiscount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Card Title and Description */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#1E293B] group-hover:text-[#FF2B72] transition-colors leading-snug">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Duration & Action Buttons */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.duration} min</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`info-service-btn-${service.id}`}
                      onClick={() => setDetailModalService(service)}
                      title="View Details"
                      className="p-2 rounded-lg text-xs font-bold text-slate-500 hover:text-[#FF2B72] bg-slate-50 hover:bg-[#FFF5F8] border border-slate-200 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      id={`select-service-btn-${service.id}`}
                      onClick={() => onSelectService(service)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                        isSelected
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#FFF5F8] text-[#FF2B72] hover:bg-[#FF2B72] hover:text-white border border-[#FF2B72]/25'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Book</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Detail Modal */}
      {detailModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="relative aspect-video">
              <img
                referrerPolicy="no-referrer"
                src={detailModalService.imageUrl}
                alt={detailModalService.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailModalService(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-800">
                {detailModalService.category}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">{detailModalService.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      ★ {detailModalService.rating} ({detailModalService.reviewsCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {detailModalService.duration} Minutes
                    </span>
                  </div>
                </div>
                <span className="text-xl font-bold text-[#FF2B72]">
                  Rs. {detailModalService.price.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {detailModalService.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  What&apos;s Included In This Session:
                </h4>
                <div className="space-y-1.5">
                  {detailModalService.included.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-[#FFF5F8] p-2 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-[#FF2B72] shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    onSelectService(detailModalService);
                    setDetailModalService(null);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20"
                >
                  {selectedService?.id === detailModalService.id ? 'Already Selected ✓' : 'Select This Treatment'}
                </button>
                <button
                  onClick={() => setDetailModalService(null)}
                  className="px-5 py-3 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
