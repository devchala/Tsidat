import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapView() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Map Monitoring</h1>
        <div className="flex gap-2">
          <select className="border px-3 py-2 rounded-md bg-white text-sm">
            <option>All Reports</option>
            <option>High Priority</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center relative overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="text-center z-10">
          <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Interactive Map Integration</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            This section is prepared for a mapping library like Google Maps or React Leaflet. 
            The coordinates from the mock data should be plotted here.
          </p>
        </div>
      </div>
    </div>
  );
}
