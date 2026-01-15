import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import { UserCircle, Upload } from 'lucide-react';

export default function Onboarding() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    topic: '',
    submissionDate: '',
    specialty: '',
    projectMethod: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const isProfileComplete = user.first_name && user.last_name && user.topic && user.submission_date && user.specialty && user.project_method;

      if (isProfileComplete) {
        navigate('/');
        return;
      }

      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        topic: user.topic || '',
        submissionDate: user.submission_date || '',
        specialty: user.specialty || '',
        projectMethod: user.project_method || '',
      });
    } else if (!isAuthenticated) {
      const localProfile = storage.getProfile();
      const isLocalProfileComplete = localProfile.firstName && localProfile.lastName && localProfile.topic && localProfile.submissionDate && localProfile.specialty && localProfile.projectMethod;

      if (isLocalProfileComplete) {
        navigate('/');
        return;
      }

      setFormData({
        firstName: localProfile.firstName || '',
        lastName: localProfile.lastName || '',
        topic: localProfile.topic || '',
        submissionDate: localProfile.submissionDate || '',
        specialty: localProfile.specialty || '',
        projectMethod: localProfile.projectMethod || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAuthenticated) {
        await updateProfile(formData);
      } else {
        storage.saveProfile(formData);
      }
      navigate('/');
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

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async e => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          storage.importData(data);

          if (data.profile) {
            setFormData({
              firstName: data.profile.firstName || '',
              lastName: data.profile.lastName || '',
              topic: data.profile.topic || '',
              submissionDate: data.profile.submissionDate?.split('T')[0] || '',
              specialty: data.profile.specialty || '',
              projectMethod: data.profile.projectMethod || '',
            });
          }
        } catch (err) {
          console.error('Import error:', err);
          setError('Fehler beim Importieren der Datei');
        }
      }
    };
    input.click();
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
            <input id="topic" name="topic" type="text" value={formData.topic} onChange={handleChange} required />
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

          <div className="form-group">
            <label htmlFor="specialty">Fachrichtung</label>
            <select
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
            >
              <option value="">Bitte wählen...</option>
              <option value="Applikationsentwicklung">Applikationsentwicklung</option>
              <option value="Plattformentwicklung">Plattformentwicklung</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="projectMethod">Projektmethode</label>
            <select
              id="projectMethod"
              name="projectMethod"
              value={formData.projectMethod}
              onChange={handleChange}
              required
            >
              <option value="">Bitte wählen...</option>
              <option value="Agil">Agil</option>
              <option value="Linear">Linear</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Speichern...' : 'Speichern'}
          </button>

          <div className="form-divider">
            <span>oder</span>
          </div>

          <button type="button" onClick={handleImport} className="btn-secondary">
            <Upload size={18} />
            Daten importieren
          </button>
        </form>
      </div>
    </div>
  );
}
