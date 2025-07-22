import React from 'react';
import { Truck } from 'lucide-react';

const TruckIconTest: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Icon Test
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span>Emoji:</span>
          <span className="text-2xl">🚛</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Lucide Icon:</span>
          <Truck size={24} className="text-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span>Combined:</span>
          <span className="text-xl">🚛</span>
          <Truck size={20} className="text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default TruckIconTest;
