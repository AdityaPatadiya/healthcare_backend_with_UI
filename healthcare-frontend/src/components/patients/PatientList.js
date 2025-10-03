import React, { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
import './Patient.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { notification, showNotification, clearNotification } = useNotification();

  const loadPatients = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await patientService.getAll(page, search);
      setPatients(data);
      // For now, we'll use a fixed total pages since Django might not return pagination info
      // In a real app, you'd get this from the API response
      setTotalPages(Math.ceil(data.length / 10) || 1);
    } catch (error) {
      showNotification('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadPatients(1, searchTerm);
  }, [loadPatients, searchTerm]);

  const handleCreate = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.delete(id);
        showNotification('Patient deleted successfully', 'success');
        loadPatients(currentPage, searchTerm);
      } catch (error) {
        showNotification('Failed to delete patient', 'error');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleFormSubmit = async (patientData) => {
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, patientData);
        showNotification('Patient updated successfully', 'success');
      } else {
        await patientService.create(patientData);
        showNotification('Patient created successfully', 'success');
      }
      setShowForm(false);
      setEditingPatient(null);
      loadPatients(currentPage, searchTerm);
    } catch (error) {
      const message = error.response?.data || 'Operation failed';
      showNotification(JSON.stringify(message), 'error');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPatients(page, searchTerm);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Simple search filter (in a real app, this would be done by the API)
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      <div className="patient-header">
        <h2>Patients Management</h2>
        <button onClick={handleCreate} className="btn-primary">
          Add New Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patients by name, condition, or gender..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        {searchTerm && (
          <div className="search-results-info">
            Showing {filteredPatients.length} of {patients.length} patients
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        )}
      </div>

      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="patient-list">
            {filteredPatients.length === 0 ? (
              <div className="no-data">
                {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div key={patient.id} className="patient-card">
                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p><strong>Age:</strong> {patient.age}</p>
                    <p><strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Condition:</strong> {patient.condition}</p>
                    <p><strong>Address:</strong> {patient.address}</p>
                    <p><strong>Created:</strong> {new Date(patient.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="patient-actions">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="btn-danger"
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

export default PatientList;
