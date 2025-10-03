import React, { useState } from 'react';
import './Mapping.css';

const MappingForm = ({ patients, doctors, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient || !formData.doctor) {
      alert('Please select both patient and doctor');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Patient-Doctor Mapping</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Patient</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              required
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (Age: {patient.age}, {patient.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doctor</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Mapping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MappingForm;
