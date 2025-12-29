import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserCircle, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    topic: '',
    submissionDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        topic: user.topic || '',
        submissionDate: user.submission_date || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={20} />
          Zurück
        </button>

        <div className="profile-header">
          <UserCircle className="profile-icon" />
          <h1>Profil bearbeiten</h1>
          <p>Aktualisieren Sie Ihre Profildaten</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Profil erfolgreich aktualisiert!</div>}

          <div className="form-group">
            <label htmlFor="firstName">Vorname</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Nachname</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic">IPA-Thema</label>
            <input id="topic" name="topic" type="text" value={formData.topic} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="submissionDate">Abgabedatum</label>
            <input
              id="submissionDate"
              name="submissionDate"
              type="date"
              value={formData.submissionDate.split('T')[0]}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Speichern...' : 'Änderungen speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
