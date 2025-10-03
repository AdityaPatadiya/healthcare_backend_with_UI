import React, { useState, useEffect } from 'react';
import './Doctor.css';

const DoctorForm = ({ doctor, onSubmit, onClose, isAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        contact: doctor.contact,
        email: doctor.email
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <h3>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!isAdmin && doctor?.created_by}
            />
          </div>

          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              disabled={!isAdmin && doctor?.created_by}
            />
          </div>

          <div className="form-group">
            <label>Contact</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              pattern="[0-9]{10,15}"
              title="Contact must be 10-15 digits"
              disabled={!isAdmin && doctor?.created_by}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!isAdmin && doctor?.created_by}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || (!isAdmin && doctor?.created_by)} 
              className="btn-primary"
            >
              {loading ? 'Saving...' : (doctor ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;
