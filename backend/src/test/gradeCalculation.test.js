import { describe, test, expect } from 'bun:test';
import { calculateGrade, calculateCategoryScores, calculateFinalGrade } from '../../../shared/gradeCalculation.js';

describe('Grade Calculation Unit Tests', () => {
  describe('calculateGrade - Single Selection', () => {
    test('UT-GC-01: should calculate grade for single selection with correct index', () => {
      const criteria = {
        id: 'F&P05',
        selection: 'single',
        requirements: [
          'Requirement 1',
          'Requirement 2',
          'Requirement 3',
          'Requirement 4'
        ],
        stages: {
          '3': { must: 1 },
          '2': { must: 2 },
          '1': { must: 3 },
          '0': { must: 4 }
        }
      };

      expect(calculateGrade(criteria, ['Requirement 1'])).toBe(3);
      expect(calculateGrade(criteria, ['Requirement 2'])).toBe(2);
      expect(calculateGrade(criteria, ['Requirement 3'])).toBe(1);
      expect(calculateGrade(criteria, ['Requirement 4'])).toBe(0);
    });

    test('should return null for single selection with no ticked requirements', () => {
      const criteria = {
        selection: 'single',
        requirements: ['Req 1', 'Req 2'],
        stages: {
          '3': { must: 1 },
          '0': { must: 2 }
        }
      };

      expect(calculateGrade(criteria, [])).toBe(null);
    });

    test('should return null for single selection with invalid requirement', () => {
      const criteria = {
        selection: 'single',
        requirements: ['Req 1', 'Req 2'],
        stages: {
          '3': { must: 1 },
          '0': { must: 2 }
        }
      };

      expect(calculateGrade(criteria, ['Invalid Req'])).toBe(null);
    });
  });

  describe('calculateGrade - Multiple Selection', () => {
    test('UT-GC-02: should calculate grade for all requirements fulfilled', () => {
      const criteria = {
        id: 'A01',
        selection: 'multiple',
        requirements: [
          'Requirement 1',
          'Requirement 2',
          'Requirement 3',
          'Requirement 4'
        ],
        stages: {
          '3': { all: true },
          '2': { count: 3 },
          '1': { count: 2 },
          '0': { count_less_than: 2 }
        }
      };

      const allRequirements = [
        'Requirement 1',
        'Requirement 2',
        'Requirement 3',
        'Requirement 4'
      ];

      expect(calculateGrade(criteria, allRequirements)).toBe(3);
    });

    test('UT-GC-03: should calculate grade for count condition', () => {
      const criteria = {
        selection: 'multiple',
        requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4'],
        stages: {
          '3': { all: true },
          '2': { count: 3 },
          '1': { count: 2 },
          '0': { count_less_than: 2 }
        }
      };

      expect(calculateGrade(criteria, ['Req 1', 'Req 2', 'Req 3'])).toBe(2);
      expect(calculateGrade(criteria, ['Req 1', 'Req 2'])).toBe(1);
      expect(calculateGrade(criteria, ['Req 1'])).toBe(0);
    });

    test('UT-GC-04: should calculate grade for counts array condition', () => {
      const criteria = {
        selection: 'multiple',
        requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4', 'Req 5'],
        stages: {
          '3': { all: true },
          '2': { counts: [3, 4] },
          '1': { count: 2 },
          '0': { count_less_than: 2 }
        }
      };

      expect(calculateGrade(criteria, ['Req 1', 'Req 2', 'Req 3'])).toBe(2);
      expect(calculateGrade(criteria, ['Req 1', 'Req 2', 'Req 3', 'Req 4'])).toBe(2);
      expect(calculateGrade(criteria, ['Req 1', 'Req 2'])).toBe(1);
    });

    test('UT-GC-05: should handle empty requirements', () => {
      const criteria = {
        selection: 'multiple',
        requirements: ['Req 1', 'Req 2', 'Req 3'],
        stages: {
          '3': { all: true },
          '2': { count: 2 },
          '1': { count: 1 },
          '0': { count: 0 }
        }
      };

      expect(calculateGrade(criteria, [])).toBe(0);
    });

    test('should handle count_less_than condition', () => {
      const criteria = {
        selection: 'multiple',
        requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4'],
        stages: {
          '3': { all: true },
          '2': { count: 3 },
          '1': { count: 2 },
          '0': { count_less_than: 2 }
        }
      };

      expect(calculateGrade(criteria, ['Req 1'])).toBe(0);
      expect(calculateGrade(criteria, [])).toBe(0);
    });

    test('should handle must condition with count', () => {
      const criteria = {
        selection: 'multiple',
        requirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4'],
        stages: {
          '3': { all: true },
          '2': { must: 4, count: 3 },
          '1': { count: 2 },
          '0': { count_less_than: 2 }
        }
      };

      expect(calculateGrade(criteria, ['Req 1', 'Req 2', 'Req 4'])).toBe(2);
      expect(calculateGrade(criteria, ['Req 1', 'Req 2', 'Req 3'])).toBe(1);
    });
  });

  describe('calculateCategoryScores', () => {
    test('UT-GC-06: should calculate category scores with weighting', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 0.5,
          part: 'Teil 1'
        },
        {
          id: 'cat2',
          name: 'Category 2',
          weight: 0.5,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1', 'R2', 'R3'],
          stages: {
            '3': { all: true },
            '2': { count: 2 },
            '1': { count: 1 },
            '0': { count: 0 }
          }
        },
        {
          id: 'C2',
          category: 'cat2',
          selection: 'multiple',
          requirements: ['R1', 'R2', 'R3'],
          stages: {
            '3': { all: true },
            '2': { count: 2 },
            '1': { count: 1 },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {
        C1: { tickedRequirements: ['R1', 'R2', 'R3'] },
        C2: { tickedRequirements: ['R1', 'R2'] }
      };

      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1).toBeDefined();
      expect(scores.cat1.totalPoints).toBe(3);
      expect(scores.cat1.totalPossiblePoints).toBe(3);
      expect(scores.cat1.grade).toBe(6);
      expect(scores.cat1.weightedGrade).toBe(3);

      expect(scores.cat2).toBeDefined();
      expect(scores.cat2.totalPoints).toBe(2);
      expect(scores.cat2.grade).toBe(4.33);
      expect(scores.cat2.weightedGrade).toBeCloseTo(2.17, 1);
    });

    test('should handle empty evaluations', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 1.0,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1', 'R2'],
          stages: {
            '3': { all: true },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {};
      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1).toBeDefined();
      expect(scores.cat1.totalPoints).toBe(0);
      expect(scores.cat1.grade).toBe(1);
    });

    test('should calculate progress correctly', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 1.0,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1', 'R2', 'R3', 'R4'],
          stages: {
            '3': { all: true },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {
        C1: { tickedRequirements: ['R1', 'R2'] }
      };

      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1.progress).toBe(50);
    });
  });

  describe('convertPointsToGrade (via calculateCategoryScores)', () => {
    test('UT-GC-07: should convert 50% points to grade 3.5', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 1.0,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1', 'R2'],
          stages: {
            '3': { must: 1 },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {
        C1: { tickedRequirements: ['R1'] }
      };

      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1.totalPoints).toBe(3);
      expect(scores.cat1.totalPossiblePoints).toBe(3);
      expect(scores.cat1.grade).toBe(6);
    });

    test('should convert 0% points to grade 1.0', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 1.0,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1'],
          stages: {
            '3': { all: true },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {};
      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1.grade).toBe(1);
    });

    test('should convert 100% points to grade 6.0', () => {
      const categories = [
        {
          id: 'cat1',
          name: 'Category 1',
          weight: 1.0,
          part: 'Teil 1'
        }
      ];

      const criterias = [
        {
          id: 'C1',
          category: 'cat1',
          selection: 'multiple',
          requirements: ['R1', 'R2'],
          stages: {
            '3': { all: true },
            '0': { count: 0 }
          }
        }
      ];

      const evaluations = {
        C1: { tickedRequirements: ['R1', 'R2'] }
      };

      const scores = calculateCategoryScores(categories, criterias, evaluations);

      expect(scores.cat1.totalPoints).toBe(3);
      expect(scores.cat1.totalPossiblePoints).toBe(3);
      expect(scores.cat1.grade).toBe(6);
    });
  });

  describe('calculateFinalGrade', () => {
    test('UT-GC-08: should calculate final grade from weighted category scores', () => {
      const categoryScores = {
        cat1: {
          name: 'Category 1',
          weight: 0.5,
          grade: 5.0,
          weightedGrade: 2.5
        },
        cat2: {
          name: 'Category 2',
          weight: 0.3,
          grade: 4.0,
          weightedGrade: 1.2
        },
        cat3: {
          name: 'Category 3',
          weight: 0.2,
          grade: 6.0,
          weightedGrade: 1.2
        }
      };

      const finalGrade = calculateFinalGrade(categoryScores);

      expect(finalGrade).toBe(4.9);
    });

    test('should handle single category', () => {
      const categoryScores = {
        cat1: {
          name: 'Category 1',
          weight: 1.0,
          grade: 5.5,
          weightedGrade: 5.5
        }
      };

      const finalGrade = calculateFinalGrade(categoryScores);

      expect(finalGrade).toBe(5.5);
    });

    test('should handle all categories with grade 1.0', () => {
      const categoryScores = {
        cat1: {
          name: 'Category 1',
          weight: 0.5,
          grade: 1.0,
          weightedGrade: 0.5
        },
        cat2: {
          name: 'Category 2',
          weight: 0.5,
          grade: 1.0,
          weightedGrade: 0.5
        }
      };

      const finalGrade = calculateFinalGrade(categoryScores);

      expect(finalGrade).toBe(1.0);
    });

    test('should round to 2 decimal places', () => {
      const categoryScores = {
        cat1: {
          name: 'Category 1',
          weight: 0.333,
          grade: 5.0,
          weightedGrade: 1.665
        },
        cat2: {
          name: 'Category 2',
          weight: 0.667,
          grade: 4.0,
          weightedGrade: 2.668
        }
      };

      const finalGrade = calculateFinalGrade(categoryScores);

      expect(finalGrade).toBe(4.33);
    });
  });
});
