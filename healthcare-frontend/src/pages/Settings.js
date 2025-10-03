import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService, systemService } from '../services/api';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);
    const [userActivity, setUserActivity] = useState([]);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // System settings state
    const [systemSettings, setSystemSettings] = useState({
        auto_logout: true,
        session_timeout: 60,
        email_notifications: true,
        data_retention: 365,
        max_login_attempts: 5,
        password_min_length: 8
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || ''
            });
        }
        if (user?.role === 'admin') {
            fetchUsers();
            fetchUserActivity();
            fetchSystemSettings();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserActivity = async () => {
        try {
            const response = await systemService.getUserActivity();
            setUserActivity(response.data);
        } catch (error) {
            console.error('Error fetching user activity:', error);
        }
    };

    const fetchSystemSettings = async () => {
        try {
            const response = await systemService.getSettings();
            setSystemSettings(response.data);
        } catch (error) {
            console.error('Error fetching system settings:', error);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileForm);
            showMessage('Profile updated successfully!');
        } catch (error) {
            showMessage('Failed to update profile', 'error');
            console.error('Profile update error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showMessage('New passwords do not match', 'error');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return;
        }
        setLoading(true);
        try {
            await authService.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });
            showMessage('Password changed successfully!');
            setPasswordForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to change password';
            showMessage(errorMsg, 'error');
            console.error('Password change error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle system settings update
    const handleSystemSettingsUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await systemService.updateSettings(systemSettings);
            showMessage('System settings updated successfully!');
        } catch (error) {
            showMessage('Failed to update system settings', 'error');
            console.error('System settings update error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user role update (admin only)
    const handleUserRoleUpdate = async (userId, newRole) => {
        try {
            await userService.updateUser(userId, { role: newRole });
            showMessage(`User role updated to ${newRole}`);
            fetchUsers(); // Refresh users list
        } catch (error) {
            showMessage('Failed to update user role', 'error');
            console.error('Role update error:', error);
        }
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

    const isAdmin = user?.role === 'admin';

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account and system preferences</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <div className="settings-sidebar">
                    <nav className="settings-nav">
                        <button
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            👤 Profile Settings
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            🔒 Security
                        </button>

                        {isAdmin && (
                            <>
                                <button
                                    className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('system')}
                                >
                                    ⚙️ System Settings
                                </button>

                                <button
                                    className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('users')}
                                >
                                    👥 User Management
                                </button>
                            </>
                        )}

                        <button
                            className={`nav-item ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            ℹ️ About
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="settings-content">
                    {/* Profile Settings Tab */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2>Profile Settings</h2>
                            <form onSubmit={handleProfileUpdate} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.first_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.last_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        disabled
                                        className="disabled-input"
                                        title="Username cannot be changed"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        value={user?.role || ''}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>

                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h2>Security Settings</h2>
                            <form onSubmit={handlePasswordChange} className="settings-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>

                            <div className="security-info">
                                <h3>Security Tips</h3>
                                <ul>
                                    <li>Use a strong, unique password</li>
                                    <li>Enable two-factor authentication if available</li>
                                    <li>Never share your password with anyone</li>
                                    <li>Log out from shared devices</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* System Settings Tab (Admin Only) */}
                    {activeTab === 'system' && isAdmin && (
                        <div className="settings-section">
                            <h2>System Settings</h2>
                            <form onSubmit={handleSystemSettingsUpdate} className="settings-form">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings.auto_logout}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, auto_logout: e.target.checked })}
                                        />
                                        Enable Auto Logout
                                    </label>
                                    <small>Automatically log out users after period of inactivity</small>
                                </div>

                                <div className="form-group">
                                    <label>Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        value={systemSettings.session_timeout}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, session_timeout: parseInt(e.target.value) })}
                                        min="5"
                                        max="480"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings.email_notifications}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, email_notifications: e.target.checked })}
                                        />
                                        Email Notifications
                                    </label>
                                    <small>Send email notifications for system events</small>
                                </div>

                                <div className="form-group">
                                    <label>Data Retention Period (days)</label>
                                    <input
                                        type="number"
                                        value={systemSettings.data_retention}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, data_retention: parseInt(e.target.value) })}
                                        min="30"
                                        max="1095"
                                    />
                                    <small>How long to keep patient records before automatic deletion</small>
                                </div>

                                <div className="form-group">
                                    <label>Max Login Attempts</label>
                                    <input
                                        type="number"
                                        value={systemSettings.max_login_attempts}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, max_login_attempts: parseInt(e.target.value) })}
                                        min="3"
                                        max="10"
                                    />
                                    <small>Maximum allowed failed login attempts before account lock</small>
                                </div>

                                <div className="form-group">
                                    <label>Minimum Password Length</label>
                                    <input
                                        type="number"
                                        value={systemSettings.password_min_length}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, password_min_length: parseInt(e.target.value) })}
                                        min="6"
                                        max="20"
                                    />
                                    <small>Minimum characters required for user passwords</small>
                                </div>

                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? 'Saving...' : 'Save System Settings'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Add User Activity Tab */}
                    {activeTab === 'users' && isAdmin && (
                        <div className="settings-section">
                            <h2>User Management</h2>

                            {/* User Activity Section */}
                            {/* <div className="user-activity-section">
                                <h3>Recent User Activity</h3>
                                <div className="activity-list">
                                    {userActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-icon">
                                                {activity.type === 'login' ? '🔐' : '👤'}
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-title">
                                                    <strong>{activity.username}</strong> - {activity.activity}
                                                </div>
                                                <div className="activity-time">
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {userActivity.length === 0 && (
                                        <div className="no-activity">
                                            <p>No recent user activity found.</p>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Users Table */}
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Last Login</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((userItem) => (
                                            <tr key={userItem.id}>
                                                <td>
                                                    <div className="user-info">
                                                        <strong>{userItem.username}</strong>
                                                        {userItem.id === user?.id && <span className="you-badge">You</span>}
                                                    </div>
                                                </td>
                                                <td>{userItem.email}</td>
                                                <td>
                                                    <span className={`role-badge ${userItem.role}`}>
                                                        {userItem.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    {userItem.last_login ? formatDate(userItem.last_login) : 'Never'}
                                                </td>
                                                <td>
                                                    <div className="user-actions">
                                                        {userItem.id !== user?.id && (
                                                            <>
                                                                <button
                                                                    className="role-btn admin"
                                                                    onClick={() => handleUserRoleUpdate(userItem.id, 'admin')}
                                                                    disabled={userItem.role === 'admin'}
                                                                >
                                                                    Make Admin
                                                                </button>
                                                                <button
                                                                    className="role-btn user"
                                                                    onClick={() => handleUserRoleUpdate(userItem.id, 'user')}
                                                                    disabled={userItem.role === 'user'}
                                                                >
                                                                    Make User
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div className="settings-section">
                            <h2>About Healthcare System</h2>
                            <div className="about-content">
                                <div className="about-card">
                                    <h3>System Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <strong>Version:</strong>
                                            <span>1.0.0</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Last Updated:</strong>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Database:</strong>
                                            <span>PostgreSQL</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Backend:</strong>
                                            <span>Django REST Framework</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Frontend:</strong>
                                            <span>React.js</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="about-card">
                                    <h3>Support</h3>
                                    <p>If you need assistance with the system, please contact your system administrator.</p>
                                    <div className="support-contacts">
                                        <div className="contact-item">
                                            <strong>Email:</strong>
                                            <span>support@healthcaresystem.com</span>
                                        </div>
                                        <div className="contact-item">
                                            <strong>Phone:</strong>
                                            <span>+1 (555) 123-HELP</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="about-card">
                                    <h3>System Status</h3>
                                    <div className="status-grid">
                                        <div className="status-item online">
                                            <strong>Backend API:</strong>
                                            <span>Online</span>
                                        </div>
                                        <div className="status-item online">
                                            <strong>Database:</strong>
                                            <span>Online</span>
                                        </div>
                                        <div className="status-item online">
                                            <strong>Authentication:</strong>
                                            <span>Online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
