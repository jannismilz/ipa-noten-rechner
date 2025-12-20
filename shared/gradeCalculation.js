export function calculateGrade(criteria, tickedRequirements) {
  if (criteria.selection === 'single') {
    if (tickedRequirements.length === 0) return null;
    const selectedIndex = criteria.requirements.indexOf(tickedRequirements[0]);
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

  const tickedCount = tickedRequirements.length;
  const totalRequirements = criteria.requirements.length;

  for (const stage of ['3', '2', '1', '0']) {
    const condition = criteria.stages[stage];
    if (!condition) continue;

    if (condition.all && tickedCount === totalRequirements) return parseInt(stage);
    if (condition.count !== undefined && tickedCount >= condition.count) return parseInt(stage);
    if (condition.counts && condition.counts.includes(tickedCount)) return parseInt(stage);
    if (condition.count_less_than !== undefined && tickedCount < condition.count_less_than) return parseInt(stage);
    if (condition.must !== undefined) {
      const mustRequirement = criteria.requirements[condition.must - 1];
      if (tickedRequirements.includes(mustRequirement)) {
        if (condition.count !== undefined && tickedCount >= condition.count) return parseInt(stage);
        else if (condition.count === undefined) return parseInt(stage);
      }
    }
  }

  return 0;
}

export function calculateCategoryScores(categories, criterias, evaluations) {
  const categoryScores = {};

  categories.forEach(category => {
    const categoryCriterias = criterias.filter(c => c.category === category.id);
    let totalPoints = 0;
    let count = 0;

    categoryCriterias.forEach(criteria => {
      const ticked = evaluations[criteria.id]?.tickedRequirements || [];
      const points = calculateGrade(criteria, ticked);
      if (points !== null) {
        totalPoints += points;
        count++;
      }
    });

    const averagePoints = count > 0 ? totalPoints / count : 0;
    const grade = convertPointsToGrade(averagePoints);
    const weightedGrade = grade * category.weight;
    
    categoryScores[category.id] = {
      name: category.name,
      weight: category.weight,
      points: averagePoints,
      grade: grade,
      weightedGrade: weightedGrade,
      progress: calculateCategoryProgress(categoryCriterias, evaluations)
    };
  });

  return categoryScores;
}

function convertPointsToGrade(points) {
  if (points >= 3) return 6.0;
  if (points >= 2) return 5.0;
  if (points >= 1) return 4.0;
  if (points > 0) return 3.0;
  return 1.0;
}

function calculateCategoryProgress(categoryCriterias, evaluations) {
  let totalCompleted = 0;
  let totalItems = 0;

  categoryCriterias.forEach(criteria => {
    const ticked = evaluations[criteria.id]?.tickedRequirements || [];
    totalCompleted += ticked.length;
    totalItems += criteria.requirements.length;
  });

  return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
}

export function calculateFinalGrade(categoryScores) {
  const totalWeightedGrade = Object.values(categoryScores).reduce((sum, cat) => sum + cat.weightedGrade, 0);
  return Math.round(totalWeightedGrade * 10) / 10;
}
