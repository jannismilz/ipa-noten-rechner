#!/usr/bin/env node

// KI: Validator wurde aus der selbstgeschriebenen Spezifikation des Kriterienkatalogs generiert.

const fs = require('fs');
const path = require('path');

const CRITERIAS_PATH = path.join(__dirname, '..', 'criterias.json');

const errors = [];
const warnings = [];

function addError(message) {
    errors.push(`❌ ERROR: ${message}`);
}

function addWarning(message) {
    warnings.push(`⚠️  WARNING: ${message}`);
}

function validateJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        addError(`File not found: ${filePath}`);
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        addError(`Invalid JSON: ${err.message}`);
        return null;
    }
}

function validateCategories(data) {
    if (!data.categories_with_weigth) {
        addError('Missing required key: "categories_with_weigth"');
        return;
    }

    if (!Array.isArray(data.categories_with_weigth)) {
        addError('"categories_with_weigth" must be an array');
        return;
    }

    if (data.categories_with_weigth.length === 0) {
        addError('"categories_with_weigth" cannot be empty');
        return;
    }

    const categoryIds = new Set();
    let totalWeight = 0;

    data.categories_with_weigth.forEach((category, index) => {
        const prefix = `categories_with_weigth[${index}]`;

        if (!category.id) {
            addError(`${prefix}: Missing required key "id"`);
        } else if (typeof category.id !== 'string') {
            addError(`${prefix}: "id" must be a string`);
        } else if (category.id.trim() === '') {
            addError(`${prefix}: "id" cannot be empty`);
        } else if (categoryIds.has(category.id)) {
            addError(`${prefix}: Duplicate category ID "${category.id}"`);
        } else {
            categoryIds.add(category.id);
        }

        if (!category.name) {
            addError(`${prefix}: Missing required key "name"`);
        } else if (typeof category.name !== 'string') {
            addError(`${prefix}: "name" must be a string`);
        } else if (category.name.trim() === '') {
            addError(`${prefix}: "name" cannot be empty`);
        }

        if (category.weight === undefined) {
            addError(`${prefix}: Missing required key "weight"`);
        } else if (typeof category.weight !== 'number') {
            addError(`${prefix}: "weight" must be a number`);
        } else if (category.weight < 0 || category.weight > 1) {
            addError(`${prefix}: "weight" must be between 0 and 1, got ${category.weight}`);
        } else {
            totalWeight += category.weight;
        }

        if (!category.part) {
            addError(`${prefix}: Missing required key "part"`);
        } else if (typeof category.part !== 'string') {
            addError(`${prefix}: "part" must be a string`);
        } else if (category.part.trim() === '') {
            addError(`${prefix}: "part" cannot be empty`);
        }
    });

    if (Math.abs(totalWeight - 1.0) > 0.001) {
        addError(`Total weight of categories should be 1.0, got ${totalWeight.toFixed(3)}`);
    }

    return categoryIds;
}

function validateStages(stages, criteriaId, requirementsCount, selection) {
    if (!stages || typeof stages !== 'object') {
        addError(`Criteria "${criteriaId}": "stages" must be an object`);
        return;
    }

    const requiredStages = ['0', '1', '2', '3'];
    requiredStages.forEach(stage => {
        if (!stages[stage]) {
            addError(`Criteria "${criteriaId}": Missing stage "${stage}"`);
        }
    });

    Object.keys(stages).forEach(stage => {
        if (!requiredStages.includes(stage)) {
            addWarning(`Criteria "${criteriaId}": Unexpected stage "${stage}"`);
        }

        const stageConfig = stages[stage];
        const prefix = `Criteria "${criteriaId}", stage ${stage}`;

        if (!stageConfig || typeof stageConfig !== 'object') {
            addError(`${prefix}: Stage configuration must be an object`);
            return;
        }

        if (Object.keys(stageConfig).length === 0) {
            addError(`${prefix}: Stage configuration cannot be empty`);
        }

        const validKeys = ['all', 'count', 'counts', 'count_less_than', 'must'];
        const providedKeys = Object.keys(stageConfig);
        
        providedKeys.forEach(key => {
            if (!validKeys.includes(key)) {
                addWarning(`${prefix}: Unknown key "${key}"`);
            }
        });

        if (stageConfig.all !== undefined) {
            if (typeof stageConfig.all !== 'boolean') {
                addError(`${prefix}: "all" must be a boolean`);
            }
            if (stageConfig.all === true && requirementsCount === 0) {
                addError(`${prefix}: Cannot require "all" when there are no requirements`);
            }
        }

        if (stageConfig.count !== undefined) {
            if (!Number.isInteger(stageConfig.count)) {
                addError(`${prefix}: "count" must be an integer`);
            } else if (stageConfig.count < 0) {
                addError(`${prefix}: "count" cannot be negative`);
            } else if (selection === 'multiple' && stageConfig.count > requirementsCount) {
                addError(`${prefix}: "count" (${stageConfig.count}) exceeds number of requirements (${requirementsCount})`);
            } else if (selection === 'single' && stageConfig.count > requirementsCount) {
                addError(`${prefix}: "count" (${stageConfig.count}) exceeds number of requirements (${requirementsCount})`);
            }
        }

        if (stageConfig.counts !== undefined) {
            if (!Array.isArray(stageConfig.counts)) {
                addError(`${prefix}: "counts" must be an array`);
            } else {
                stageConfig.counts.forEach((count, idx) => {
                    if (!Number.isInteger(count)) {
                        addError(`${prefix}: "counts[${idx}]" must be an integer`);
                    } else if (count < 0) {
                        addError(`${prefix}: "counts[${idx}]" cannot be negative`);
                    } else if (selection === 'multiple' && count > requirementsCount) {
                        addError(`${prefix}: "counts[${idx}]" (${count}) exceeds number of requirements (${requirementsCount})`);
                    }
                });
            }
        }

        if (stageConfig.count_less_than !== undefined) {
            if (!Number.isInteger(stageConfig.count_less_than)) {
                addError(`${prefix}: "count_less_than" must be an integer`);
            } else if (stageConfig.count_less_than < 0) {
                addError(`${prefix}: "count_less_than" cannot be negative`);
            }
        }

        if (stageConfig.must !== undefined) {
            if (!Number.isInteger(stageConfig.must)) {
                addError(`${prefix}: "must" must be an integer`);
            } else if (stageConfig.must < 1) {
                addError(`${prefix}: "must" must be at least 1`);
            } else if (selection === 'single' && stageConfig.must > requirementsCount) {
                addError(`${prefix}: "must" (${stageConfig.must}) exceeds number of requirements (${requirementsCount})`);
            }
        }
    });
}

function validateCriterias(data, categoryIds) {
    if (!data.criterias) {
        addError('Missing required key: "criterias"');
        return;
    }

    if (!Array.isArray(data.criterias)) {
        addError('"criterias" must be an array');
        return;
    }

    if (data.criterias.length === 0) {
        addError('"criterias" cannot be empty');
        return;
    }

    const criteriaIds = new Set();

    data.criterias.forEach((criteria, index) => {
        const prefix = `criterias[${index}]`;

        if (!criteria.id) {
            addError(`${prefix}: Missing required key "id"`);
        } else if (typeof criteria.id !== 'string') {
            addError(`${prefix}: "id" must be a string`);
        } else if (criteria.id.trim() === '') {
            addError(`${prefix}: "id" cannot be empty`);
        } else if (criteriaIds.has(criteria.id)) {
            addError(`${prefix}: Duplicate criteria ID "${criteria.id}"`);
        } else {
            criteriaIds.add(criteria.id);
        }

        if (!criteria.category) {
            addError(`${prefix}: Missing required key "category"`);
        } else if (typeof criteria.category !== 'string') {
            addError(`${prefix}: "category" must be a string`);
        } else if (!categoryIds.has(criteria.category)) {
            addError(`${prefix}: Unknown category "${criteria.category}"`);
        }

        if (!criteria.title) {
            addError(`${prefix}: Missing required key "title"`);
        } else if (typeof criteria.title !== 'string') {
            addError(`${prefix}: "title" must be a string`);
        } else if (criteria.title.trim() === '') {
            addError(`${prefix}: "title" cannot be empty`);
        }

        if (!criteria.subtitle) {
            addError(`${prefix}: Missing required key "subtitle"`);
        } else if (typeof criteria.subtitle !== 'string') {
            addError(`${prefix}: "subtitle" must be a string`);
        } else if (criteria.subtitle.trim() === '') {
            addError(`${prefix}: "subtitle" cannot be empty`);
        }

        if (!criteria.selection) {
            addError(`${prefix}: Missing required key "selection"`);
        } else if (typeof criteria.selection !== 'string') {
            addError(`${prefix}: "selection" must be a string`);
        } else if (!['multiple', 'single'].includes(criteria.selection)) {
            addError(`${prefix}: "selection" must be "multiple" or "single", got "${criteria.selection}"`);
        }

        if (!criteria.requirements) {
            addError(`${prefix}: Missing required key "requirements"`);
        } else if (!Array.isArray(criteria.requirements)) {
            addError(`${prefix}: "requirements" must be an array`);
        } else {
            if (criteria.requirements.length === 0) {
                addError(`${prefix}: "requirements" cannot be empty`);
            }

            criteria.requirements.forEach((req, reqIdx) => {
                if (typeof req !== 'string') {
                    addError(`${prefix}.requirements[${reqIdx}]: Must be a string`);
                } else if (req.trim() === '') {
                    addError(`${prefix}.requirements[${reqIdx}]: Cannot be empty`);
                }
            });
        }

        if (!criteria.stages) {
            addError(`${prefix}: Missing required key "stages"`);
        } else {
            const requirementsCount = criteria.requirements ? criteria.requirements.length : 0;
            validateStages(criteria.stages, criteria.id || `index-${index}`, requirementsCount, criteria.selection);
        }
    });
}

function main() {
    console.log('🔍 Validating criterias.json...\n');

    const data = validateJSON(CRITERIAS_PATH);
    if (!data) {
        console.log('\n❌ Validation failed: Cannot parse JSON file\n');
        process.exit(1);
    }

    const categoryIds = validateCategories(data);
    if (categoryIds) {
        validateCriterias(data, categoryIds);
    }

    console.log('═'.repeat(60));
    console.log('\n📊 VALIDATION RESULTS:\n');

    if (warnings.length > 0) {
        console.log('WARNINGS:');
        warnings.forEach(warning => console.log(warning));
        console.log('');
    }

    if (errors.length > 0) {
        console.log('ERRORS:');
        errors.forEach(error => console.log(error));
        console.log('');
        console.log(`❌ Validation failed with ${errors.length} error(s) and ${warnings.length} warning(s)\n`);
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.log(`⚠️  Validation passed with ${warnings.length} warning(s)\n`);
        process.exit(0);
    }

    console.log('✅ Validation passed successfully!\n');
    console.log(`   - ${data.categories_with_weigth.length} categories validated`);
    console.log(`   - ${data.criterias.length} criterias validated`);
    console.log('');
    process.exit(0);
}

main();
