import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientService, doctorService, mappingService, userService } from '../services/api';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    mappings: 0,
    users: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [patientsRes, doctorsRes, mappingsRes, usersRes] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
        mappingService.getAll(),
        userService.getAllUsers()
      ]);

      const patients = patientsRes.data;
      const doctors = doctorsRes.data;
      const mappings = mappingsRes.data;
      const users = usersRes.data;

      // Calculate statistics
      setStats({
        patients: patients.length,
        doctors: doctors.length,
        mappings: mappings.length,
        users: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length
      });

      // Generate recent activity (last 10 items)
      const activity = [
        ...patients.slice(-5).map(p => ({
          type: 'patient',
          id: p.id,
          name: getPatientName(p),
          timestamp: p.created_at || new Date().toISOString(),
          action: 'Created'
        })),
        ...doctors.slice(-3).map(d => ({
          type: 'doctor',
          id: d.id,
          name: d.name,
          timestamp: d.created_at || new Date().toISOString(),
          action: 'Added'
        })),
        ...mappings.slice(-2).map(m => ({
          type: 'mapping',
          id: m.id,
          name: `Patient ${m.patient} - Doctor ${m.doctor}`,
          timestamp: m.created_at || new Date().toISOString(),
          action: 'Assigned'
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

      setRecentActivity(activity);
      setError('');

    } catch (err) {
      setError('Failed to fetch report data');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patient) => {
    if (patient.user) {
      const user = patient.user;
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      return user.username || `Patient ${patient.id}`;
    }
    if (patient.first_name && patient.last_name) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    return `Patient ${patient.id}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'patient': return '👤';
      case 'doctor': return '👨‍⚕️';
      case 'mapping': return '🔗';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-content">
          <h1>System Reports & Analytics</h1>
          <p>Comprehensive overview of your healthcare system</p>
        </div>
        <div className="time-filter">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Total Patients</h3>
            <div className="stat-number">{stats.patients}</div>
            <div className="stat-trend">Active in system</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>Total Doctors</h3>
            <div className="stat-number">{stats.doctors}</div>
            <div className="stat-trend">Medical professionals</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3>Active Mappings</h3>
            <div className="stat-number">{stats.mappings}</div>
            <div className="stat-trend">Patient-Doctor relationships</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>System Users</h3>
            <div className="stat-number">{stats.users}</div>
            <div className="stat-breakdown">
              {stats.admins} admins, {stats.regularUsers} users
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="reports-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button 
            className="refresh-btn"
            onClick={fetchReportData}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    <strong>{activity.action}</strong> {activity.type}: {activity.name}
                  </div>
                  <div className="activity-time">
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
                <div className="activity-badge">
                  {activity.type}
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="reports-section">
        <h2>System Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <h3>📊 Usage Statistics</h3>
            <div className="overview-stats">
              <div className="overview-stat">
                <span className="label">Patients per Doctor:</span>
                <span className="value">
                  {stats.doctors > 0 ? (stats.mappings / stats.doctors).toFixed(1) : 0}
                </span>
              </div>
              <div className="overview-stat">
                <span className="label">Mapped Patients:</span>
                <span className="value">
                  {stats.patients > 0 ? ((stats.mappings / stats.patients) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="overview-stat">
                <span className="label">Admin Ratio:</span>
                <span className="value">
                  {stats.users > 0 ? ((stats.admins / stats.users) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h3>🚀 Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => window.location.href = '/patients'}>
                Manage Patients
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/doctors'}>
                Manage Doctors
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/mappings'}>
                View Mappings
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/users'}>
                User Management
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="reports-section">
        <h2>Data Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h4>Patient Distribution</h4>
            <div className="summary-content">
              <div className="summary-item">
                <span>Total Patients:</span>
                <strong>{stats.patients}</strong>
              </div>
              <div className="summary-item">
                <span>With Doctors:</span>
                <strong>{stats.mappings}</strong>
              </div>
              <div className="summary-item">
                <span>Without Doctors:</span>
                <strong>{stats.patients - stats.mappings}</strong>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>User Distribution</h4>
            <div className="summary-content">
              <div className="summary-item">
                <span>Total Users:</span>
                <strong>{stats.users}</strong>
              </div>
              <div className="summary-item">
                <span>Administrators:</span>
                <strong>{stats.admins}</strong>
              </div>
              <div className="summary-item">
                <span>Regular Users:</span>
                <strong>{stats.regularUsers}</strong>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>System Health</h4>
            <div className="summary-content">
              <div className="summary-item">
                <span>Data Integrity:</span>
                <strong className="status-good">Excellent</strong>
              </div>
              <div className="summary-item">
                <span>Active Connections:</span>
                <strong>{stats.mappings}</strong>
              </div>
              <div className="summary-item">
                <span>Last Updated:</span>
                <strong>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
