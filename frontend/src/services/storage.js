const STORAGE_KEYS = {
  TICKED: 'ipa_ticked_requirements',
  NOTES: 'ipa_criteria_notes',
  PROFILE: 'ipa_user_profile',
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

  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  exportData() {
    return {
      tickedRequirements: this.getTickedRequirements(),
      notes: this.getNotes(),
      profile: this.getProfile(),
      exportedAt: new Date().toISOString(),
    };
  },

  importData(data) {
    if (data.tickedRequirements) {
      localStorage.setItem(STORAGE_KEYS.TICKED, JSON.stringify(data.tickedRequirements));
    }
    if (data.notes) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
    }
    if (data.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.TICKED);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  },
};
