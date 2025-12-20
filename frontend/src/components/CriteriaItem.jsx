import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CriteriaItem({ criteria, tickedRequirements, note, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNote, setLocalNote] = useState(note || '');

  const handleRequirementToggle = (requirement) => {
    const newTicked = tickedRequirements.includes(requirement)
      ? tickedRequirements.filter(r => r !== requirement)
      : criteria.selection === 'single'
        ? [requirement]
        : [...tickedRequirements, requirement];
    
    onUpdate({ tickedRequirements: newTicked, note: localNote });
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setLocalNote(newNote);
  };

  const handleNoteBlur = () => {
    onUpdate({ tickedRequirements, note: localNote });
  };

  const calculateGrade = () => {
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

      if (condition.all && tickedCount === totalRequirements) {
        return parseInt(grade);
      }
      if (condition.count !== undefined && tickedCount >= condition.count) {
        return parseInt(grade);
      }
      if (condition.counts && condition.counts.includes(tickedCount)) {
        return parseInt(grade);
      }
      if (condition.count_less_than !== undefined && tickedCount < condition.count_less_than) {
        return parseInt(grade);
      }
      if (condition.must !== undefined) {
        const mustRequirement = criteria.requirements[condition.must - 1];
        if (tickedRequirements.includes(mustRequirement)) {
          if (condition.count !== undefined && tickedCount >= condition.count) {
            return parseInt(grade);
          } else if (condition.count === undefined) {
            return parseInt(grade);
          }
        }
      }
    }

    return 0;
  };

  const grade = calculateGrade();
  const gradeClass = grade !== null ? `grade-${grade}` : 'grade-none';

  return (
    <div className="criteria-item">
      <div className="criteria-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="criteria-info">
          <span className="criteria-id">{criteria.id}</span>
          <div className="criteria-titles">
            <h3>{criteria.title}</h3>
            <p>{criteria.subtitle}</p>
          </div>
        </div>
        <div className="criteria-meta">
          {grade !== null && (
            <span className={`grade-badge ${gradeClass}`}>Note: {grade}</span>
          )}
          <span className="criteria-progress">
            {tickedRequirements.length}/{criteria.requirements.length}
          </span>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div className="criteria-content">
          <div className="requirements-list">
            {criteria.requirements.map((requirement, index) => (
              <div key={index} className="requirement-item">
                <label>
                  <input
                    type={criteria.selection === 'single' ? 'radio' : 'checkbox'}
                    name={`criteria-${criteria.id}`}
                    checked={tickedRequirements.includes(requirement)}
                    onChange={() => handleRequirementToggle(requirement)}
                  />
                  <span className="requirement-text">{requirement}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="note-section">
            <label htmlFor={`note-${criteria.id}`}>Notizen:</label>
            <textarea
              id={`note-${criteria.id}`}
              value={localNote}
              onChange={handleNoteChange}
              onBlur={handleNoteBlur}
              placeholder="Eigene Notizen zu diesem Kriterium..."
              rows="3"
            />
          </div>
        </div>
      )}
    </div>
  );
}
