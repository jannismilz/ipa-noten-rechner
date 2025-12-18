const Criteria = require('./models/Criteria');

const sampleCriteria = [
  {
    criteriaId: 'A1',
    title: 'Projektmanagement - Projektplanung',
    guidingQuestion: 'Wurde das Projekt systematisch geplant?',
    requirements: {
      "1": "Projektauftrag ist vorhanden und vollständig",
      "2": "Meilensteine sind definiert und terminiert",
      "3": "Ressourcenplanung ist vorhanden"
    },
    qualityLevels: {
      "0": "Keine oder unvollständige Projektplanung",
      "1": "Grundlegende Projektplanung vorhanden, aber lückenhaft",
      "2": "Umfassende Projektplanung mit klaren Meilensteinen",
      "3": "Ausgefeilte Projektplanung mit Risikoanalyse und Alternativszenarien"
    },
    category: 'A'
  },
  {
    criteriaId: 'B2',
    title: 'Fachliche Umsetzung - Funktionalität',
    guidingQuestion: 'Sind die geforderten Funktionen vollständig umgesetzt?',
    requirements: {
      "1": "Grundfunktionen sind implementiert",
      "2": "Erweiterte Funktionen sind umgesetzt",
      "3": "Zusatzfunktionen sind vorhanden"
    },
    qualityLevels: {
      "0": "Keine Funktionen umgesetzt",
      "1": "Grundfunktionen teilweise umgesetzt",
      "2": "Alle Grundfunktionen und einige erweiterte Funktionen umgesetzt",
      "3": "Alle Funktionen inklusive Zusatzfunktionen vollständig umgesetzt"
    },
    category: 'B'
  },
  {
    criteriaId: 'D1',
    title: 'Dokumentation - Technische Dokumentation',
    guidingQuestion: 'Ist die technische Dokumentation vollständig und verständlich?',
    requirements: {
      "1": "Installationsanleitung vorhanden",
      "2": "Benutzerhandbuch vorhanden",
      "3": "API-Dokumentation vorhanden"
    },
    qualityLevels: {
      "0": "Keine Dokumentation vorhanden",
      "1": "Grundlegende Dokumentation vorhanden, aber lückenhaft",
      "2": "Umfassende Dokumentation mit Installations- und Benutzeranleitung",
      "3": "Ausführliche Dokumentation mit allen relevanten Aspekten und Beispielen"
    },
    category: 'D'
  }
];

async function initializeSampleData() {
  try {
    console.log('Initializing sample criteria data...');
    
    for (const criteria of sampleCriteria) {
      // Check if criteria already exists
      const existing = await Criteria.findById(criteria.criteriaId);
      
      if (!existing) {
        await Criteria.create(criteria);
        console.log(`Created criteria: ${criteria.criteriaId} - ${criteria.title}`);
      } else {
        console.log(`Criteria ${criteria.criteriaId} already exists, skipping...`);
      }
    }
    
    console.log('Sample data initialization completed.');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSampleData();
