import { Download, Upload, Trash2 } from 'lucide-react';
import { calculateCategoryScores, calculateFinalGrade } from '../../../shared/gradeCalculation.js';

export default function ProgressOverview({ categories, criterias, evaluations, onExport, onImport, onReset, isAuthenticated }) {
  const categoryScores = calculateCategoryScores(categories, criterias, evaluations);
  const finalGrade = calculateFinalGrade(categoryScores);

  return (
    <div className="progress-overview">
      <div className="overview-header">
        <h2>Übersicht</h2>
        <div className="overview-actions">
          {!isAuthenticated && (
            <>
              <button onClick={onExport} className="btn-icon" title="Export">
                <Download size={18} />
              </button>
              <button onClick={onImport} className="btn-icon" title="Import">
                <Upload size={18} />
              </button>
            </>
          )}
          <button onClick={onReset} className="btn-icon btn-danger" title="Alles zurücksetzen">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card primary">
          <div className="card-label">Gesamtnote</div>
          <div className="card-value large">{finalGrade.toFixed(2)}</div>
          <div className="card-detail">von 6.00</div>
        </div>

        {Object.entries(categoryScores).map(([id, data]) => (
          <div key={id} className="overview-card">
            <div className="card-label">{data.name}</div>
            <div className="card-value">{data.grade.toFixed(2)}</div>
            <div className="card-detail">
              {data.totalPoints} / {data.totalPossiblePoints} Punkte
            </div>
            <div className="card-detail">
              Gewichtet: {data.weightedGrade.toFixed(2)} ({Math.round(data.weight * 100)}%)
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${data.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
