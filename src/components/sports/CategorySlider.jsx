import React from 'react';

export const CategorySlider = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-3">
      {categories.map((sport) => {
        const isActive = activeCategory === sport.slug;
        return (
          <button
            key={sport._id || sport.slug}
            onClick={() => onSelectCategory(sport.slug)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-lg shadow-teal-500/10'
                : 'bg-[#161925] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {sport.iconUrl && (
              <img src={sport.iconUrl} alt="" className="w-4 h-4 object-contain" />
            )}
            <span>{sport.name}</span>
            {sport.liveMatchCount > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white text-teal-600' : 'bg-red-500 text-white'
              }`}>
                {sport.liveMatchCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};