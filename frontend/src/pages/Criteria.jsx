import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { storage } from '../services/storage';
import ProgressOverview from '../components/ProgressOverview';
import CategorySection from '../components/CategorySection';
import ConfirmModal from '../components/ConfirmModal';

export default function Criteria() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [criteriaData, setCriteriaData] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const criteria = await api.getCriteria();
      setCriteriaData(criteria);

      if (isAuthenticated && token) {
        const evalData = await api.getEvaluations(token);
        const formatted = {};
        evalData.criterias.forEach(c => {
          formatted[c.id] = {
            tickedRequirements: c.ticked_requirements || [],
            note: c.note || '',
          };
        });
        setEvaluations(formatted);
      } else {
        const localTicked = storage.getTickedRequirements();
        const localNotes = storage.getNotes();
        const formatted = {};
        criteria.criterias.forEach(c => {
          formatted[c.id] = {
            tickedRequirements: localTicked[c.id] || [],
            note: localNotes[c.id] || '',
          };
        });
        setEvaluations(formatted);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && user) {
      const isProfileComplete = user.first_name && user.last_name && user.topic && user.submission_date && user.specialty && user.project_method;
      if (!isProfileComplete) {
        navigate('/onboarding');
        return;
      }
    } else if (!isAuthenticated) {
      const localProfile = storage.getProfile();
      const isLocalProfileComplete = localProfile.firstName && localProfile.lastName && localProfile.topic && localProfile.submissionDate && localProfile.specialty && localProfile.projectMethod;
      if (!isLocalProfileComplete) {
        navigate('/onboarding');
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async (criteriaId, data) => {
    const newEvaluations = {
      ...evaluations,
      [criteriaId]: data,
    };
    setEvaluations(newEvaluations);

    if (isAuthenticated && token) {
      try {
        await api.saveEvaluation(token, criteriaId, data);
      } catch (err) {
        console.error('Failed to save to server:', err);
        setError('Fehler beim Speichern auf dem Server');
      }
    } else {
      storage.saveTickedRequirements(criteriaId, data.tickedRequirements);
      storage.saveNote(criteriaId, data.note);
    }
  };

  const handleExport = () => {
    const tickedRequirements = {};
    const notes = {};

    Object.entries(evaluations).forEach(([criteriaId, data]) => {
      if (data.tickedRequirements && data.tickedRequirements.length > 0) {
        tickedRequirements[criteriaId] = data.tickedRequirements;
      }
      if (data.note) {
        notes[criteriaId] = data.note;
      }
    });

    let profile = {};
    if (isAuthenticated && user) {
      profile = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        topic: user.topic || '',
        submissionDate: user.submission_date || '',
        specialty: user.specialty || '',
        projectMethod: user.project_method || '',
      };
    } else {
      profile = storage.getProfile();
    }

    const exportData = {
      tickedRequirements,
      notes,
      profile,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipa-noten-rechner-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

          if (isAuthenticated && token) {
            const allCriteriaIds = criteriaData?.criterias?.map(c => c.id) || [];
            for (const criteriaId of allCriteriaIds) {
              const evalData = {
                tickedRequirements: data.tickedRequirements?.[criteriaId] || [],
                note: data.notes?.[criteriaId] || '',
              };
              await api.saveEvaluation(token, criteriaId, evalData);
            }
          } else {
            storage.importData(data);
          }

          loadData();
        } catch (err) {
          console.error('Import error:', err);
          alert('Fehler beim Importieren der Datei');
        }
      }
    };
    input.click();
  };

  const handleReset = async () => {
    try {
      if (isAuthenticated && token) {
        for (const criteriaId of Object.keys(evaluations)) {
          await api.saveEvaluation(token, criteriaId, {
            tickedRequirements: [],
            note: '',
          });
        }
      } else {
        storage.clear();
      }

      setEvaluations({});
      loadData();
      setShowResetModal(false);
    } catch (err) {
      console.error('Reset failed:', err);
      setError('Fehler beim Zurücksetzen der Daten');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Lade Kriterien...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Fehler: {error}</p>
        <button onClick={loadData} className="btn-primary">
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!criteriaData) {
    return null;
  }

  const projectMethod = isAuthenticated && user ? user.project_method : storage.getProfile().projectMethod;

  const groupedCriterias = {};
  criteriaData.categories_with_weigth.forEach(category => {
    groupedCriterias[category.id] = criteriaData.criterias.filter(c => c.category === category.id);
  });

  return (
    <div className="criteria-page">
      <ProgressOverview
        categories={criteriaData.categories_with_weigth}
        criterias={criteriaData.criterias}
        evaluations={evaluations}
        onExport={handleExport}
        onImport={handleImport}
        onReset={() => setShowResetModal(true)}
        isAuthenticated={isAuthenticated}
        projectMethod={projectMethod}
      />

      <div className="categories-container">
        {criteriaData.categories_with_weigth.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            criterias={groupedCriterias[category.id] || []}
            evaluations={evaluations}
            onUpdate={handleUpdate}
            projectMethod={projectMethod}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Alle Daten zurücksetzen?"
        message="Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Bewertungen und Notizen werden gelöscht."
      />
    </div>
  );
}
