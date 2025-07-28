import React from 'react';

function DateFilter({ startDate, endDate, onDateChange, onApplyFilter }) {
  const today = new Date().toISOString().split('T')[0]; 

  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-b border-gray-200 mb-4"> {/* Added padding and border-b */}
      <div className="flex items-center gap-2">
        <label htmlFor="startDate" className="text-gray-700 font-medium">From:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onDateChange('start', e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={endDate || today} // Start date cannot be after end date or today
        />
        {console.log(today)}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="endDate" className="text-gray-700 font-medium">To:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onDateChange('end', e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={today} 
          min={startDate}
        />
      </div>
      <button
        onClick={onApplyFilter}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply Filter
      </button>
    </div>
  );
}

export default DateFilter;