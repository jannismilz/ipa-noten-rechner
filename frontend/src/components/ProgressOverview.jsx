import { Download, Upload } from 'lucide-react';

export default function ProgressOverview({ categories, criterias, evaluations, onExport, onImport }) {
  const calculateCategoryScores = () => {
    const categoryScores = {};

    categories.forEach(category => {
      const categoryCriterias = criterias.filter(c => c.category === category.id);
      let totalScore = 0;
      let count = 0;

      categoryCriterias.forEach(criteria => {
        const ticked = evaluations[criteria.id]?.tickedRequirements || [];
        const grade = calculateGrade(criteria, ticked);
        if (grade !== null) {
          totalScore += grade;
          count++;
        }
      });

      const averageScore = count > 0 ? totalScore / count : 0;
      categoryScores[category.id] = {
        name: category.name,
        weight: category.weight,
        score: averageScore,
        weightedScore: averageScore * category.weight,
        progress: calculateCategoryProgress(categoryCriterias)
      };
    });

    return categoryScores;
  };

  const calculateGrade = (criteria, tickedRequirements) => {
    if (criteria.selection === 'single') {
      if (tickedRequirements.length === 0) return null;
      const selectedIndex = criteria.requirements.indexOf(tickedRequirements[0]);
      if (selectedIndex === -1) return null;

      for (const grade of ['3', '2', '1', '0']) {
        const condition = criteria.stages[grade];
        if (!condition) continue;
        if (condition.must !== undefined && condition.must === selectedIndex + 1) {
          return parseInt(grade);
        }
      }
      return null;
    }

    const tickedCount = tickedRequirements.length;
    const totalRequirements = criteria.requirements.length;

    for (const grade of ['3', '2', '1', '0']) {
      const condition = criteria.stages[grade];
      if (!condition) continue;

      if (condition.all && tickedCount === totalRequirements) return parseInt(grade);
      if (condition.count !== undefined && tickedCount >= condition.count) return parseInt(grade);
      if (condition.counts && condition.counts.includes(tickedCount)) return parseInt(grade);
      if (condition.count_less_than !== undefined && tickedCount < condition.count_less_than) return parseInt(grade);
      if (condition.must !== undefined) {
        const mustRequirement = criteria.requirements[condition.must - 1];
        if (tickedRequirements.includes(mustRequirement)) {
          if (condition.count !== undefined && tickedCount >= condition.count) return parseInt(grade);
          else if (condition.count === undefined) return parseInt(grade);
        }
      }
    }

    return 0;
  };

  const calculateCategoryProgress = (categoryCriterias) => {
    let totalCompleted = 0;
    let totalItems = 0;

    categoryCriterias.forEach(criteria => {
      const ticked = evaluations[criteria.id]?.tickedRequirements || [];
      totalCompleted += ticked.length;
      totalItems += criteria.requirements.length;
    });

    return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  };

  const categoryScores = calculateCategoryScores();
  const totalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.weightedScore, 0);
  const finalGrade = Math.round(totalScore * 10) / 10;

  const overallProgress = criterias.length > 0
    ? Math.round((Object.keys(evaluations).length / criterias.length) * 100)
    : 0;

  return (
    <div className="progress-overview">
      <div className="overview-header">
        <h2>Übersicht</h2>
        <div className="overview-actions">
          <button onClick={onExport} className="btn-icon" title="Export">
            <Download size={18} />
          </button>
          <button onClick={onImport} className="btn-icon" title="Import">
            <Upload size={18} />
          </button>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card primary">
          <div className="card-label">Gesamtnote</div>
          <div className="card-value large">{finalGrade.toFixed(1)}</div>
          <div className="card-detail">von 3.0</div>
        </div>

        <div className="overview-card">
          <div className="card-label">Fortschritt</div>
          <div className="card-value">{overallProgress}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {Object.entries(categoryScores).map(([id, data]) => (
          <div key={id} className="overview-card">
            <div className="card-label">{data.name}</div>
            <div className="card-value">{data.score.toFixed(2)}</div>
            <div className="card-detail">
              Gewichtet: {data.weightedScore.toFixed(2)} ({Math.round(data.weight * 100)}%)
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
