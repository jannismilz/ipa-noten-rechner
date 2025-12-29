import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserCircle } from 'lucide-react';

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    topic: '',
    submissionDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const isProfileComplete = user.first_name && user.last_name && user.topic && user.submission_date;
      
      if (isProfileComplete) {
        navigate('/');
        return;
      }

      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        topic: user.topic || '',
        submissionDate: user.submission_date || ''
      });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateProfile(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <UserCircle className="onboarding-icon" />
          <h1>Willkommen!</h1>
          <p>Bitte vervollständigen Sie Ihr Profil</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {error && <div className="error-message">{error}</div>}

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
            <input
              id="topic"
              name="topic"
              type="text"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="submissionDate">Abgabedatum</label>
            <input
              id="submissionDate"
              name="submissionDate"
              type="date"
              value={formData.submissionDate}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
