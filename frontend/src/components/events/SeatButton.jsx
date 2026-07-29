import React from 'react';

const SeatButton = ({ seat, onClick, disabled }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm cursor-pointer';
      case 'held':
        return 'bg-amber-100 text-amber-800 border-amber-300 cursor-not-allowed';
      case 'booked':
        return 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed line-through opacity-75';
      default:
        return 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || seat.seat_status !== 'available'}
      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center justify-center min-w-[50px] ${getStatusStyles(
        seat.seat_status
      )}`}
      title={`Seat #${seat.seat_id} (${seat.seat_status})`}
    >
      #{seat.seat_id}
    </button>
  );
};

export default SeatButton;
