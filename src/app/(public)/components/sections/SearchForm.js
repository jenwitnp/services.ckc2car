'use client';
import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchForm = () => {
  const [searchData, setSearchData] = useState({
    keyword: '',
    priceRange: '',
    condition: ''
  });

  const priceRanges = [
    'ทุกช่วงราคา',
    'ต่ำกว่า 500,000',
    '500,000 - 1,000,000',
    '1,000,000 - 2,000,000',
    'มากกว่า 2,000,000'
  ];

  const conditions = [
    'ทุกสภาพรถ',
    'รถใหม่',
    'รถมือสอง',
    'รถโชว์รูม'
  ];

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Search data:', searchData);
    // Handle search logic here
  };

  return (
    <section className="relative -mt-20 lg:-mt-16 z-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchData.keyword}
                  onChange={(e) => handleInputChange('keyword', e.target.value)}
                  placeholder="ค้นหารุ่น/ยี่ห้อรถ"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Price Range */}
              <div className="relative">
                <select
                  value={searchData.priceRange}
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Condition */}
              <div className="relative">
                <select
                  value={searchData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              ค้นหา
            </button>

            {/* Quick Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-3">ค้นหาแบบด่วน:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  Toyota
                </button>
                <button className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  Honda
                </button>
                <button className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  รถ SUV
                </button>
                <button className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  รถเก๋ง
                </button>
                <button className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  ราคาต่ำกว่า 500K
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchForm;
