import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { patientService } from '../../services/patientService';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import PatientForm from './PatientForm';
import './Patient.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const { notification, showNotification, clearNotification } = useNotification();

  // Fixed: useCallback to prevent infinite re-renders
  const loadPatients = useCallback(async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      showNotification('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Added dependency

  useEffect(() => {
    loadPatients();
  }, [loadPatients]); // Fixed dependency

  // ... rest of the component remains the same
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
        loadPatients();
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
      loadPatients();
    } catch (error) {
      const message = error.response?.data || 'Operation failed';
      showNotification(JSON.stringify(message), 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="patient-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      <div className="patient-header">
        <h2>Patients</h2>
        <button onClick={handleCreate} className="btn-primary">
          Add New Patient
        </button>
      </div>

      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <div className="patient-list">
        {patients.length === 0 ? (
          <p className="no-data">No patients found.</p>
        ) : (
          patients.map(patient => (
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
    </div>
  );
};

export default PatientList;
