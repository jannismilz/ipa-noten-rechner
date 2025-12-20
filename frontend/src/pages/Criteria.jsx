import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { storage } from '../services/storage';
import ProgressOverview from '../components/ProgressOverview';
import CategorySection from '../components/CategorySection';
import ConfirmModal from '../components/ConfirmModal';

export default function Criteria() {
  const { token, isAuthenticated } = useAuth();
  const [criteriaData, setCriteriaData] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, token]);

  const loadData = async () => {
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
            note: c.note || ''
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
            note: localNotes[c.id] || ''
          };
        });
        setEvaluations(formatted);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (criteriaId, data) => {
    const newEvaluations = {
      ...evaluations,
      [criteriaId]: data
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
    if (isAuthenticated) {
      alert('Export ist nur im Offline-Modus verfügbar');
      return;
    }
    
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipa-noten-rechner-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (isAuthenticated) {
      alert('Import ist nur im Offline-Modus verfügbar');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          storage.importData(data);
          loadData();
        } catch (err) {
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
            note: ''
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
        <button onClick={loadData} className="btn-primary">Erneut versuchen</button>
      </div>
    );
  }

  if (!criteriaData) {
    return null;
  }

  const groupedCriterias = {};
  criteriaData.categories_with_weigth.forEach(category => {
    groupedCriterias[category.id] = criteriaData.criterias.filter(
      c => c.category === category.id
    );
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
      />

      <div className="categories-container">
        {criteriaData.categories_with_weigth.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            criterias={groupedCriterias[category.id] || []}
            evaluations={evaluations}
            onUpdate={handleUpdate}
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
