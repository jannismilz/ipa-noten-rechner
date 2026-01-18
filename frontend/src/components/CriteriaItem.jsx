import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calculateGrade } from '../../../shared/gradeCalculation.js';

export default function CriteriaItem({ criteria, tickedRequirements, note, onUpdate, projectMethod }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNote, setLocalNote] = useState(note || '');

  const filteredRequirements = criteria.requirements.filter(req => {
    if (typeof req === 'string') return true;
    return !req.projectMethod || req.projectMethod === projectMethod;
  });

  const getRequirementText = (req) => typeof req === 'string' ? req : req.text;

  const handleRequirementToggle = requirement => {
    const newTicked = tickedRequirements.includes(requirement)
      ? tickedRequirements.filter(r => r !== requirement)
      : criteria.selection === 'single'
        ? [requirement]
        : [...tickedRequirements, requirement];

    onUpdate({ tickedRequirements: newTicked, note: localNote });
  };

  const handleNoteChange = e => {
    const newNote = e.target.value;
    setLocalNote(newNote);
  };

  const handleNoteBlur = () => {
    onUpdate({ tickedRequirements, note: localNote });
  };

  const points = calculateGrade(criteria, tickedRequirements, projectMethod);
  const gradeClass = points !== null ? `grade-${points}` : 'grade-none';

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
          {points !== null && (
            <span className={`grade-badge ${gradeClass}`}>
              {points} {points === 1 ? 'Punkt' : 'Punkte'}
            </span>
          )}
          <span className="criteria-progress">
            {tickedRequirements.length}/{filteredRequirements.length}
          </span>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div className="criteria-content">
          <div className="requirements-list">
            {filteredRequirements.map((requirement, index) => {
              const text = getRequirementText(requirement);
              return (
                <div key={index} className="requirement-item">
                  <label>
                    <input
                      type={criteria.selection === 'single' ? 'radio' : 'checkbox'}
                      name={`criteria-${criteria.id}`}
                      checked={tickedRequirements.includes(text)}
                      onChange={() => handleRequirementToggle(text)}
                    />
                    <span className="requirement-text">{text}</span>
                  </label>
                </div>
              );
            })}
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
