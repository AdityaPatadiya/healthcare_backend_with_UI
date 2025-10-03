import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`pagination ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-prev"
      >
        ← Previous
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`pagination-btn pagination-number ${
              page === currentPage ? 'active' : ''
            } ${typeof page !== 'number' ? 'pagination-dots' : ''}`}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-next"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
