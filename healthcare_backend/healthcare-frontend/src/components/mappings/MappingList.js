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
      console.log('Patients data:', response.data); // Debug log
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data);
      console.log('Doctors data:', response.data); // Debug log
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

  // Get patient name by ID - UPDATED
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      return `Patient ${patientId}`;
    }
    
    // Try different possible structures
    if (patient.user) {
      // If patient has user object
      const user = patient.user;
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      if (user.first_name) {
        return user.first_name;
      }
      if (user.last_name) {
        return user.last_name;
      }
      if (user.username) {
        return user.username;
      }
    }
    
    // If patient has direct name fields
    if (patient.first_name && patient.last_name) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    if (patient.first_name) {
      return patient.first_name;
    }
    if (patient.last_name) {
      return patient.last_name;
    }
    if (patient.name) {
      return patient.name;
    }
    
    // Fallback
    return `Patient ${patientId}`;
  };

  // Get doctor name by ID - UPDATED
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return `Doctor ${doctorId}`;
    }
    
    // Try different possible structures
    if (doctor.name) {
      return doctor.name;
    }
    if (doctor.first_name && doctor.last_name) {
      return `${doctor.first_name} ${doctor.last_name}`;
    }
    if (doctor.first_name) {
      return doctor.first_name;
    }
    if (doctor.last_name) {
      return doctor.last_name;
    }
    
    // Fallback
    return `Doctor ${doctorId}`;
  };

  // Get patient options for dropdown
  const getPatientOptions = () => {
    return patients.map(patient => {
      const name = getPatientName(patient.id);
      return {
        id: patient.id,
        name: name,
        display: name === `Patient ${patient.id}` ? `${name} (ID: ${patient.id})` : name
      };
    });
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
                {getPatientOptions().map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.display}
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
                    {getDoctorName(doctor.id)} {doctor.specialization ? `(${doctor.specialization})` : ''}
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

      {/* Debug Information (remove in production) */}
      {isAdmin && (
        <div className="debug-info" style={{marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px'}}>
          <h4>Debug Information:</h4>
          <p><strong>Patients count:</strong> {patients.length}</p>
          <p><strong>Doctors count:</strong> {doctors.length}</p>
          <p><strong>Mappings count:</strong> {mappings.length}</p>
          <details>
            <summary>Patients Data</summary>
            <pre>{JSON.stringify(patients, null, 2)}</pre>
          </details>
          <details>
            <summary>Doctors Data</summary>
            <pre>{JSON.stringify(doctors, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default MappingList;
