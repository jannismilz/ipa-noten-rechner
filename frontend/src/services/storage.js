const STORAGE_KEYS = {
  TICKED: 'ipa_ticked_requirements',
  NOTES: 'ipa_criteria_notes'
};

export const storage = {
  getTickedRequirements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TICKED);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveTickedRequirements(criteriaId, requirements) {
    const all = this.getTickedRequirements();
    all[criteriaId] = requirements;
    localStorage.setItem(STORAGE_KEYS.TICKED, JSON.stringify(all));
  },

  getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveNote(criteriaId, note) {
    const all = this.getNotes();
    if (note === null || note === '') {
      delete all[criteriaId];
    } else {
      all[criteriaId] = note;
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(all));
  },

  exportData() {
    return {
      tickedRequirements: this.getTickedRequirements(),
      notes: this.getNotes(),
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.tickedRequirements) {
      localStorage.setItem(STORAGE_KEYS.TICKED, JSON.stringify(data.tickedRequirements));
    }
    if (data.notes) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.TICKED);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
  }
};
