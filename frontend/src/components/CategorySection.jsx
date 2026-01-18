import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CriteriaItem from './CriteriaItem';

export default function CategorySection({ category, criterias, evaluations, onUpdate, projectMethod }) {
  const [isOpen, setIsOpen] = useState(true);

  const getFilteredRequirements = (requirements) => {
    return requirements.filter(req => {
      if (typeof req === 'string') return true;
      return !req.projectMethod || req.projectMethod === projectMethod;
    });
  };

  const getRequirementText = (req) => typeof req === 'string' ? req : req.text;

  const calculateCategoryProgress = () => {
    let totalCompleted = 0;
    let totalItems = 0;

    criterias.forEach(criteria => {
      const filteredReqs = getFilteredRequirements(criteria.requirements);
      const validRequirementTexts = filteredReqs.map(getRequirementText);
      const ticked = evaluations[criteria.id]?.tickedRequirements || [];
      const validTicked = ticked.filter(t => validRequirementTexts.includes(t));
      totalCompleted += validTicked.length;
      totalItems += filteredReqs.length;
    });

    return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  };

  const progress = calculateCategoryProgress();

  return (
    <div className="category-section">
      <div className="category-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="category-info">
          <h2>{category.name}</h2>
          <span className="category-weight">Gewichtung: {Math.round(category.weight * 100)}%</span>
        </div>
        <div className="category-meta">
          <div className="progress-bar-small">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progress}%</span>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div className="category-content">
          {criterias.map(criteria => (
            <CriteriaItem
              key={criteria.id}
              criteria={criteria}
              tickedRequirements={evaluations[criteria.id]?.tickedRequirements || []}
              note={evaluations[criteria.id]?.note || ''}
              onUpdate={data => onUpdate(criteria.id, data)}
              projectMethod={projectMethod}
            />
          ))}
        </div>
      )}
    </div>
  );
}
