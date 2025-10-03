import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  filters = [],
  placeholder = "Search...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    
    // Remove empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key] || newFilters[key] === '') {
        delete newFilters[key];
      }
    });
    
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onSearch('');
    onFilter({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm;

  return (
    <div className={`search-filter ${className}`}>
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="filter-section">
          {filters.map(filter => (
            <div key={filter.key} className="filter-group">
              <label>{filter.label}</label>
              <select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="filter-select"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
          <div className="active-filters">
            {searchTerm && (
              <span className="active-filter">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>×</button>
              </span>
            )}
            {Object.entries(activeFilters).map(([key, value]) => {
              const filterConfig = filters.find(f => f.key === key);
              const option = filterConfig?.options.find(opt => opt.value === value);
              return (
                <span key={key} className="active-filter">
                  {filterConfig?.label}: {option?.label || value}
                  <button onClick={() => handleFilterChange(key, '')}>×</button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
