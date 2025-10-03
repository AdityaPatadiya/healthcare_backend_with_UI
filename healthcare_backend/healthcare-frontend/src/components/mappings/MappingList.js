import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mappingService, patientService, doctorService } from '../../services/api';
import './Mapping.css';

const MappingList = () => {
  const { user } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: ''
  });

  const isAdmin = user?.role === 'admin';

  // Fetch all data
  useEffect(() => {
    fetchMappings();
    if (isAdmin) {
      fetchPatients();
      fetchDoctors();
    }
  }, [isAdmin]);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const response = await mappingService.getAll();
      setMappings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch mappings');
      console.error('Error fetching mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Create new mapping
  const handleCreateMapping = async (e) => {
    e.preventDefault();
    try {
      await mappingService.create(formData);
      setShowCreateForm(false);
      setFormData({ patient: '', doctor: '' });
      await fetchMappings(); // Refresh the list
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create mapping');
      console.error('Error creating mapping:', err);
    }
  };

  // Delete mapping
  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) {
      return;
    }
    try {
      await mappingService.delete(mappingId);
      await fetchMappings(); // Refresh the list
      setError('');
    } catch (err) {
      setError('Failed to delete mapping');
      console.error('Error deleting mapping:', err);
    }
  };

  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient && patient.user) {
      return `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim() || patient.user.username || `Patient ${patientId}`;
    }
    return `Patient ${patientId}`;
  };

  // Get doctor name by ID
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  if (loading) {
    return (
      <div className="mapping-container">
        <div className="loading">Loading mappings...</div>
      </div>
    );
  }

  return (
    <div className="mapping-container">
      <div className="mapping-header">
        <h1>Patient-Doctor Mappings</h1>
        <p>Manage relationships between patients and doctors</p>
        
        {isAdmin && (
          <button 
            className="create-mapping-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Mapping'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Create Mapping Form (Admin only) */}
      {showCreateForm && isAdmin && (
        <div className="mapping-form">
          <h3>Create New Mapping</h3>
          <form onSubmit={handleCreateMapping}>
            <div className="form-group">
              <label>Patient:</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.user ? 
                      `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim() || patient.user.username 
                      : `Patient ${patient.id}`
                    }
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Doctor:</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Create Mapping
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mappings List */}
      <div className="mappings-list">
        <h2>Existing Mappings ({mappings.length})</h2>
        
        {mappings.length === 0 ? (
          <div className="no-mappings">
            <p>No mappings found.</p>
            {isAdmin && (
              <p>Click "Create New Mapping" to add the first mapping.</p>
            )}
          </div>
        ) : (
          <div className="mappings-table-container">
            <table className="mappings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Created Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.id}>
                    <td>{mapping.id}</td>
                    <td>{getPatientName(mapping.patient)}</td>
                    <td>{getDoctorName(mapping.doctor)}</td>
                    <td>
                      {mapping.created_at ? new Date(mapping.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteMapping(mapping.id)}
                          title="Delete mapping"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Card */}
      <div className="mapping-info-card">
        <h3>About Patient-Doctor Mappings</h3>
        <div className="info-content">
          <p>
            <strong>For Administrators:</strong> You can create and manage relationships between patients and doctors. 
            Each mapping represents which doctor is assigned to care for which patient.
          </p>
          <p>
            <strong>For Regular Users:</strong> You can view the mappings for your own patients. 
            This shows which doctors are assigned to care for your patients.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MappingList;
