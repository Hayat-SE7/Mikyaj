import { MapPin, Phone, Clock, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { Branch } from '../types';

interface BranchesViewProps {
  branches: Branch[];
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  onBookAtBranch: (branch: Branch) => void;
}

export default function BranchesView({
  branches,
  selectedBranch,
  onSelectBranch,
  onBookAtBranch
}: BranchesViewProps) {
  return (
    <div className="space-y-8 mb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F5] to-[#FFF5F8] rounded-3xl border border-rose-200/80 p-6 sm:p-10 text-center space-y-3 shadow-lux">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-xs font-bold text-[#FF2B72] border border-rose-200 shadow-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>5 Luxury Locations Across Pakistan</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E293B]">
          Mikyaj Parlor Branches & Lounges
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Visit any of our aesthetic beauty sanctuaries designed with soothing aromatherapy suites, private bridal rooms, and sterilized equipment.
        </p>
      </div>

      {/* Branches List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const isSelected = selectedBranch.id === branch.id;
          return (
            <div
              key={branch.id}
              id={`branch-card-${branch.id}`}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-[#FF2B72] ring-2 ring-[#FF2B72]/20 shadow-xl'
                  : 'border-slate-200 hover:border-rose-200 shadow-lux hover:shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF2B72] uppercase tracking-wider">
                      {branch.city}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-slate-900 mt-0.5">
                      {branch.name}
                    </h3>
                  </div>

                  {branch.isFlagship && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF5F8] text-[#FF2B72] border border-rose-200">
                      ★ Flagship
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#FF2B72] shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#FF2B72] shrink-0" />
                    <span>{branch.phone}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#FF2B72] shrink-0" />
                    <span>{branch.hours}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{branch.rating} / 5.0 Rating</span>
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center gap-2">
                <button
                  id={`select-branch-btn-${branch.id}`}
                  onClick={() => {
                    onSelectBranch(branch);
                    onBookAtBranch(branch);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#FF2B72] text-white shadow-md shadow-pink-500/20'
                      : 'bg-[#FFF5F8] text-[#FF2B72] hover:bg-[#FF2B72] hover:text-white'
                  }`}
                >
                  {isSelected ? 'Book at this Branch ✓' : 'Select Branch'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
