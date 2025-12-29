import { describe, test, expect, beforeEach } from 'vitest';
import { storage } from '../services/storage';

describe('Storage Service Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('FE-IT-03: Save Ticked Requirements', () => {
    test('should save ticked requirements to localStorage', () => {
      storage.saveTickedRequirements('A1', ['Requirement 1', 'Requirement 2']);

      const stored = JSON.parse(localStorage.getItem('ipa_ticked_requirements'));
      expect(stored).toEqual({
        A1: ['Requirement 1', 'Requirement 2']
      });
    });

    test('should update existing criteria without affecting others', () => {
      storage.saveTickedRequirements('A1', ['Req 1']);
      storage.saveTickedRequirements('A2', ['Req 2']);
      storage.saveTickedRequirements('A1', ['Req 1', 'Req 3']);

      const stored = JSON.parse(localStorage.getItem('ipa_ticked_requirements'));
      expect(stored).toEqual({
        A1: ['Req 1', 'Req 3'],
        A2: ['Req 2']
      });
    });
  });

  describe('FE-IT-04: Load Ticked Requirements', () => {
    test('should load ticked requirements from localStorage', () => {
      const testData = {
        A1: ['Requirement 1', 'Requirement 2'],
        B1: ['Requirement 3']
      };
      localStorage.setItem('ipa_ticked_requirements', JSON.stringify(testData));

      const result = storage.getTickedRequirements();

      expect(result).toEqual(testData);
    });

    test('should return empty object if no data exists', () => {
      const result = storage.getTickedRequirements();

      expect(result).toEqual({});
    });

    test('should handle corrupted data gracefully', () => {
      localStorage.setItem('ipa_ticked_requirements', 'invalid json');

      const result = storage.getTickedRequirements();

      expect(result).toEqual({});
    });
  });

  describe('Save and Load Notes', () => {
    test('should save notes to localStorage', () => {
      storage.saveNote('A1', 'This is a test note');

      const stored = JSON.parse(localStorage.getItem('ipa_criteria_notes'));
      expect(stored).toEqual({
        A1: 'This is a test note'
      });
    });

    test('should load notes from localStorage', () => {
      const testData = {
        A1: 'Note 1',
        B1: 'Note 2'
      };
      localStorage.setItem('ipa_criteria_notes', JSON.stringify(testData));

      const result = storage.getNotes();

      expect(result).toEqual(testData);
    });

    test('should delete note when empty string or null provided', () => {
      storage.saveNote('A1', 'Initial note');
      storage.saveNote('A2', 'Another note');
      storage.saveNote('A1', '');

      const stored = JSON.parse(localStorage.getItem('ipa_criteria_notes'));
      expect(stored).toEqual({
        A2: 'Another note'
      });
    });

    test('should delete note when null provided', () => {
      storage.saveNote('A1', 'Initial note');
      storage.saveNote('A1', null);

      const stored = JSON.parse(localStorage.getItem('ipa_criteria_notes'));
      expect(stored).toEqual({});
    });
  });

  describe('Export and Import Data', () => {
    test('should export all evaluation data', () => {
      storage.saveTickedRequirements('A1', ['Req 1']);
      storage.saveNote('A1', 'Test note');

      const exported = storage.exportData();

      expect(exported).toMatchObject({
        tickedRequirements: { A1: ['Req 1'] },
        notes: { A1: 'Test note' }
      });
      expect(exported.exportedAt).toBeDefined();
      expect(new Date(exported.exportedAt)).toBeInstanceOf(Date);
    });

    test('should import data correctly', () => {
      const importData = {
        tickedRequirements: { A1: ['Req 1'], B1: ['Req 2'] },
        notes: { A1: 'Note 1' },
        exportedAt: new Date().toISOString()
      };

      storage.importData(importData);

      expect(storage.getTickedRequirements()).toEqual(importData.tickedRequirements);
      expect(storage.getNotes()).toEqual(importData.notes);
    });

    test('should handle partial import data', () => {
      storage.importData({ tickedRequirements: { A1: ['Req 1'] } });

      expect(storage.getTickedRequirements()).toEqual({ A1: ['Req 1'] });
      expect(storage.getNotes()).toEqual({});
    });
  });

  describe('Clear Storage', () => {
    test('should clear all evaluation data', () => {
      storage.saveTickedRequirements('A1', ['Req 1']);
      storage.saveNote('A1', 'Test note');

      storage.clear();

      expect(storage.getTickedRequirements()).toEqual({});
      expect(storage.getNotes()).toEqual({});
      expect(localStorage.getItem('ipa_ticked_requirements')).toBeNull();
      expect(localStorage.getItem('ipa_criteria_notes')).toBeNull();
    });
  });
});
