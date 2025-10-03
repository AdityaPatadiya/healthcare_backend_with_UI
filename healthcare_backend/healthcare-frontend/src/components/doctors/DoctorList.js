import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import DoctorForm from './DoctorForm';
import './Doctor.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const { user } = useAuth();
  const { notification, showNotification, clearNotification } = useNotification();

  const isAdmin = user?.profile?.role === 'admin';

  // Fixed: useCallback to prevent infinite re-renders
  const loadDoctors = useCallback(async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (error) {
      showNotification('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Added dependency

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]); // Fixed dependency

  // ... rest of the component remains the same
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
        loadDoctors();
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
      loadDoctors();
    } catch (error) {
      const message = error.response?.data || 'Operation failed';
      showNotification(JSON.stringify(message), 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="doctor-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      <div className="doctor-header">
        <h2>Doctors</h2>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary">
            Add New Doctor
          </button>
        )}
      </div>

      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          isAdmin={isAdmin}
        />
      )}

      <div className="doctor-list">
        {doctors.length === 0 ? (
          <p className="no-data">No doctors found.</p>
        ) : (
          doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-info">
                <h3>Dr. {doctor.name}</h3>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
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
    </div>
  );
};

export default DoctorList;
