function getRequirementText(req) {
  return typeof req === 'string' ? req : req.text;
}

export function filterRequirementsByProjectMethod(requirements, projectMethod) {
  return requirements.filter(req => {
    if (typeof req === 'string') return true;
    return !req.projectMethod || req.projectMethod === projectMethod;
  });
}

export function calculateGrade(criteria, tickedRequirements, projectMethod) {
  const filteredRequirements = projectMethod 
    ? filterRequirementsByProjectMethod(criteria.requirements, projectMethod)
    : criteria.requirements;

  const validRequirementTexts = filteredRequirements.map(getRequirementText);
  const validTickedRequirements = tickedRequirements.filter(t => validRequirementTexts.includes(t));

  if (criteria.selection === 'single') {
    if (validTickedRequirements.length === 0) return null;
    const selectedIndex = validRequirementTexts.indexOf(validTickedRequirements[0]);
    if (selectedIndex === -1) return null;

    for (const stage of ['3', '2', '1', '0']) {
      const condition = criteria.stages[stage];
      if (!condition) continue;
      if (condition.must !== undefined && condition.must === selectedIndex + 1) {
        return parseInt(stage);
      }
    }
    return null;
  }

  const tickedCount = validTickedRequirements.length;
  const totalRequirements = filteredRequirements.length;

  for (const stage of ['3', '2', '1', '0']) {
    const condition = criteria.stages[stage];
    if (!condition) continue;

    if (condition.must !== undefined) {
      const mustRequirement = getRequirementText(filteredRequirements[condition.must - 1]);
      const hasMust = validTickedRequirements.includes(mustRequirement);
      
      if (condition.count !== undefined) {
        if (hasMust && tickedCount >= condition.count) return parseInt(stage);
      } else if (hasMust) {
        return parseInt(stage);
      }
      continue;
    }

    if (condition.all && tickedCount === totalRequirements) return parseInt(stage);
    if (condition.count !== undefined && tickedCount >= condition.count) return parseInt(stage);
    if (condition.counts && condition.counts.includes(tickedCount)) return parseInt(stage);
    if (condition.count_less_than !== undefined && tickedCount < condition.count_less_than) return parseInt(stage);
  }

  return 0;
}

export function calculateCategoryScores(categories, criterias, evaluations, projectMethod) {
  const categoryScores = {};
  const maxPointsPerCriteria = 3;

  categories.forEach(category => {
    const categoryCriterias = criterias.filter(c => c.category === category.id);
    let totalPoints = 0;
    let totalPossiblePoints = categoryCriterias.length * maxPointsPerCriteria;

    categoryCriterias.forEach(criteria => {
      const ticked = evaluations[criteria.id]?.tickedRequirements || [];
      const points = calculateGrade(criteria, ticked, projectMethod);
      if (points !== null) {
        totalPoints += points;
      }
    });

    const grade = convertPointsToGrade(totalPoints, totalPossiblePoints);
    const weightedGrade = grade * category.weight;
    
    categoryScores[category.id] = {
      name: category.name,
      weight: category.weight,
      totalPoints: totalPoints,
      totalPossiblePoints: totalPossiblePoints,
      grade: grade,
      weightedGrade: weightedGrade,
      progress: calculateCategoryProgress(categoryCriterias, evaluations, projectMethod)
    };
  });

  return categoryScores;
}

function convertPointsToGrade(points, maxPoints) {
  const grade = (points / maxPoints) * 5 + 1;
  return Math.round(grade * 100) / 100;
}

function calculateCategoryProgress(categoryCriterias, evaluations, projectMethod) {
  let totalCompleted = 0;
  let totalItems = 0;

  categoryCriterias.forEach(criteria => {
    const filteredReqs = projectMethod 
      ? filterRequirementsByProjectMethod(criteria.requirements, projectMethod)
      : criteria.requirements;
    const validRequirementTexts = filteredReqs.map(getRequirementText);
    const ticked = evaluations[criteria.id]?.tickedRequirements || [];
    const validTicked = ticked.filter(t => validRequirementTexts.includes(t));
    totalCompleted += validTicked.length;
    totalItems += filteredReqs.length;
  });

  return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
}

export function calculateFinalGrade(categoryScores) {
  const totalWeightedGrade = Object.values(categoryScores).reduce((sum, cat) => sum + cat.weightedGrade, 0);
  return Math.round(totalWeightedGrade * 100) / 100;
}
