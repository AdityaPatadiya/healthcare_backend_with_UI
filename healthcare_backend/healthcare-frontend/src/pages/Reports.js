import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Placeholder.css';

const Reports = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Reports</h1>
        <p>Analytics and reporting dashboard</p>
      </div>

      <div className="placeholder-container">
        <div className="placeholder-content">
          <div className="placeholder-icon">📊</div>
          <h2>Reports & Analytics</h2>
          <p>This feature is coming soon!</p>
          <p>Here you'll find comprehensive reports, analytics, and insights about your healthcare system.</p>
          
          <div className="features-list">
            <h3>Planned Features:</h3>
            <ul>
              <li>Patient statistics and trends</li>
              <li>Doctor performance metrics</li>
              <li>Appointment analytics</li>
              <li>Revenue reports</li>
              <li>System usage statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
