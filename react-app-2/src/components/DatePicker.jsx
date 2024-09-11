import React, { useState } from 'react';

const DatePicker = ({ date, onChange }) => {
  let start_date_str =`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  return (
    <div className="inline-block text-left w-32 ">
      <label htmlFor="date-picker" className="text-sm font-medium">
        Select Date:
      </label>
      <input
        type="date"
        id="date-picker"
        className="rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm sm:leading-6"
        value={start_date_str} // Format for date input
        onChange={onChange}
      />
    </div>
  );
};

export default DatePicker;
