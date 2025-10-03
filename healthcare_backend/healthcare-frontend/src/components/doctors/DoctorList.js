import React, { useState, useEffect, useCallback } from 'react';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import DoctorForm from './DoctorForm';
import Pagination from '../common/Pagination';
import SearchFilter from '../common/SearchFilter';
import './Doctor.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const { user } = useAuth();
  const { notification, showNotification, clearNotification } = useNotification();

  const isAdmin = user?.profile?.role === 'admin';

  // Filter options
  const specializationOptions = [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Psychiatry', label: 'Psychiatry' }
  ];

  const filterConfig = [
    {
      key: 'specialization',
      label: 'Specialization',
      options: specializationOptions
    }
  ];

  const loadDoctors = useCallback(async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const data = await doctorService.getAll(page, search);
      setDoctors(data);
      setTotalPages(Math.ceil(data.length / 10) || 1);
    } catch (error) {
      showNotification('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadDoctors(1, searchTerm, filters);
  }, [loadDoctors, searchTerm, filters]);

  const handleSearch = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilter = (filterParams) => {
    setFilters(filterParams);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    if (!isAdmin) {
      showNotification('Only administrators can create doctors', 'error');
      return;
    }
    setEditingDoctor(null);
    setShowForm(true);
  };

  const handleEdit = (doctor) => {
    if (!isAdmin && doctor.created_by !== user.id) {
      showNotification('You can only edit doctors you created', 'error');
      return;
    }
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      showNotification('Only administrators can delete doctors', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.delete(id);
        showNotification('Doctor deleted successfully', 'success');
        loadDoctors(currentPage, searchTerm, filters);
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to delete doctor';
        showNotification(message, 'error');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDoctor(null);
  };

  const handleFormSubmit = async (doctorData) => {
    try {
      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, doctorData);
        showNotification('Doctor updated successfully', 'success');
      } else {
        await doctorService.create(doctorData);
        showNotification('Doctor created successfully', 'success');
      }
      setShowForm(false);
      setEditingDoctor(null);
      loadDoctors(currentPage, searchTerm, filters);
    } catch (error) {
      const message = error.response?.data || 'Operation failed';
      showNotification(JSON.stringify(message), 'error');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadDoctors(page, searchTerm, filters);
  };

  // Apply filters to doctors
  const filteredDoctors = doctors.filter(doctor => {
    // Search filter
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Specialization filter
    const matchesSpecialization = !filters.specialization || 
      doctor.specialization === filters.specialization;

    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="doctor-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      <div className="doctor-header">
        <h2>Doctors Management</h2>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary">
            Add New Doctor
          </button>
        )}
      </div>

      {/* Advanced Search and Filter */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filterConfig}
        placeholder="Search doctors by name, specialization, or email..."
      />

      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          isAdmin={isAdmin}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="doctor-list">
            {filteredDoctors.length === 0 ? (
              <div className="no-data">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'No doctors found matching your criteria.' 
                  : 'No doctors found.'
                }
              </div>
            ) : (
              filteredDoctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-info">
                    <h3>Dr. {doctor.name}</h3>
                    <p className="specialization">
                      <strong>Specialization:</strong> 
                      <span className="specialty-badge">{doctor.specialization}</span>
                    </p>
                    <p><strong>Contact:</strong> {doctor.contact}</p>
                    <p><strong>Email:</strong> {doctor.email}</p>
                    {doctor.created_by_details && (
                      <p><strong>Created By:</strong> {doctor.created_by_details.username}</p>
                    )}
                  </div>
                  <div className="doctor-actions">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="btn-secondary"
                      disabled={!isAdmin && doctor.created_by !== user?.id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="btn-danger"
                      disabled={!isAdmin && doctor.created_by !== user?.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default DoctorList;
