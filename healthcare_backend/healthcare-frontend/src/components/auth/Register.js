import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { validation, validateForm } from '../../utils/validation';
import Notification from '../common/Notification';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { notification, showNotification, clearNotification } = useNotification();
  const navigate = useNavigate();

  const validationRules = {
    username: [
      value => validation.required(value, 'Username'),
      value => validation.username(value)
    ],
    email: [
      value => validation.required(value, 'Email'),
      value => validation.email(value)
    ],
    password: [
      value => validation.required(value, 'Password'),
      value => validation.password(value)
    ],
    password2: [
      value => validation.required(value, 'Password confirmation'),
      value => value !== formData.password ? 'Passwords do not match' : null
    ],
    first_name: [
      value => validation.required(value, 'First name'),
      value => validation.name(value, 'First name')
    ],
    last_name: [
      value => validation.required(value, 'Last name'),
      value => validation.name(value, 'Last name')
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field when user changes it
    if (touched[name]) {
      const fieldRules = validationRules[name] || [];
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          setErrors(prev => ({ ...prev, [name]: error }));
          return;
        }
      }
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field when user leaves it
    const fieldRules = validationRules[name] || [];
    const value = formData[name];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        return;
      }
    }
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      showNotification('Please fix the form errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      showNotification('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      // Handle server-side errors
      if (error.response?.data) {
        const serverErrors = error.response.data;
        
        // Map server errors to form fields
        Object.keys(serverErrors).forEach(key => {
          if (key in formData) {
            setErrors(prev => ({ 
              ...prev, 
              [key]: Array.isArray(serverErrors[key]) 
                ? serverErrors[key].join(', ') 
                : serverErrors[key] 
            }));
          }
        });
        
        // Show non-field errors
        if (serverErrors.non_field_errors) {
          showNotification(serverErrors.non_field_errors, 'error');
        } else if (Object.keys(serverErrors).some(k => !(k in formData))) {
          showNotification('Registration failed. Please check your input.', 'error');
        }
      } else {
        showNotification('Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== null);

  return (
    <div className="auth-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />
      
      <div className="auth-form">
        <h2>Register for Healthcare System</h2>
        <form onSubmit={handleSubmit}>
          {['username', 'email', 'first_name', 'last_name', 'password', 'password2'].map(field => (
            <div key={field} className="form-group">
              <label htmlFor={field}>
                {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors[field] ? 'error' : ''}
                disabled={loading}
                placeholder={`Enter your ${field.replace('_', ' ')}`}
              />
              {errors[field] && (
                <div className="error-message">
                  {errors[field]}
                </div>
              )}
            </div>
          ))}

          <button 
            type="submit" 
            disabled={loading || hasErrors} 
            className={`auth-button ${hasErrors ? 'disabled' : ''}`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
