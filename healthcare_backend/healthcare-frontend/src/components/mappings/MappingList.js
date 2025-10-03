import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { mappingService } from '../../services/mappingService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import MappingForm from './MappingForm';
import './Mapping.css';

const MappingList = () => {
  const [mappings, setMappings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { notification, showNotification, clearNotification } = useNotification();

  const isAdmin = user?.profile?.role === 'admin';

  // Fixed: useCallback to prevent infinite re-renders
  const loadData = useCallback(async () => {
    try {
      const [mappingsData, patientsData, doctorsData] = await Promise.all([
        mappingService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ]);
      
      setMappings(mappingsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Added dependency

  useEffect(() => {
    loadData();
  }, [loadData]); // Fixed dependency

  // ... rest of the component remains the same
  const handleCreate = () => {
    if (!isAdmin) {
      showNotification('Only administrators can create mappings', 'error');
      return;
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      showNotification('Only administrators can delete mappings', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this mapping?')) {
      try {
        await mappingService.delete(id);
        showNotification('Mapping deleted successfully', 'success');
        loadData();
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to delete mapping';
        showNotification(message, 'error');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSubmit = async (mappingData) => {
    try {
      await mappingService.create(mappingData);
      showNotification('Mapping created successfully', 'success');
      setShowForm(false);
      loadData();
    } catch (error) {
      const message = error.response?.data || 'Operation failed';
      showNotification(JSON.stringify(message), 'error');
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.name} (${doctor.specialization})` : 'Unknown Doctor';
  };

  // Filter mappings for non-admin users (only show their own patients)
  const filteredMappings = isAdmin 
    ? mappings 
    : mappings.filter(mapping => {
        const patient = patients.find(p => p.id === mapping.patient);
        return patient && patient.user === user?.id;
      });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mapping-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      <div className="mapping-header">
        <h2>Patient-Doctor Mappings</h2>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary">
            Add New Mapping
          </button>
        )}
      </div>

      {showForm && (
        <MappingForm
          patients={patients}
          doctors={doctors}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <div className="mapping-list">
        {filteredMappings.length === 0 ? (
          <p className="no-data">No mappings found.</p>
        ) : (
          filteredMappings.map(mapping => (
            <div key={mapping.id} className="mapping-card">
              <div className="mapping-info">
                <h3>Patient-Doctor Relationship</h3>
                <p><strong>Patient:</strong> {mapping.patient_name || getPatientName(mapping.patient)}</p>
                <p><strong>Doctor:</strong> {mapping.doctor_name || getDoctorName(mapping.doctor)}</p>
                {mapping.doctor_specialization && (
                  <p><strong>Specialization:</strong> {mapping.doctor_specialization}</p>
                )}
                <p><strong>Created:</strong> {new Date(mapping.created_at).toLocaleDateString()}</p>
              </div>
              <div className="mapping-actions">
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(mapping.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MappingList;
