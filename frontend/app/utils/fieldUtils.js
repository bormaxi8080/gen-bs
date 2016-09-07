import _ from 'lodash';

export default class FieldUtils {
    static find(fieldId, fields) {
        return fields.totalFieldsHashedArray.hash[fieldId];
    }

    /**
     * Make field structure usable for filters dialog purposes
     * @param {{id: string, label: string, sourceName: string, valueType: string}} f
     * @param {string=} sourceName
     * @returns {{id: string, label: string, type: string}}
     */
    static makeFieldSelectItemValue(f, sourceName) {
        return {
            id: f.id,
            label: `${f.label} -- ${(sourceName == null ? f.sourceName : sourceName)}`,
            type: f.valueType === 'float' ? 'double' : f.valueType
        };
    }

    /**
     * Return default field id for adding new rule item or smth
     * @param {{id: string, label: string, type: string}[]} fields
     * @returns {string}
     */
    static getDefaultId(fields) {
        return fields[0].id;
    }

    /**
     * Get JS type for the field value or undefined
     * @param {{id: string, label: string, type: string}} field
     * @returns {string|undefined}
     */
    static getFieldJSType(field) {
        const fieldType = field.type;
        const jsType = {
            'char': 'string',
            'string': 'string',
            'integer': 'number',
            'float': 'number',
            'double': 'number',
            'boolean': 'boolean'
        }[fieldType];
        return jsType;
    }

    /**
     * Get validation regex for the field value or undefined
     * @param {{id: string, label: string, type: string}} field
     * @returns {string|undefined}
     */
    static getFieldInputValidationRegex(field){
        const fieldType = field.type;
        const jsType = {
            'char': '^((?!,).)*$',
            'string': '^((?!,).)*$',
            'integer': null,
            'float': null,
            'double': null,
            'boolean': null
        }[fieldType];
        return jsType;
    }
    /**
     * Return field for id
     * @param {{id: string, label: string, type: string}[]} fields
     * @param {string} id
     * @returns {{id: string, label: string, type: string}|null}
     */
    static getFieldById(fields, id) {
        var i;
        for (i = 0; i < fields.length; i++) {
            if (id == fields[i].id) {
                return fields[i];
            }
        }
        return null;
    }

    static getSampleFields(sample, totalFieldsHash) {
        const sampleValues = sample.values;
        const sampleFields = sampleValues.map(({fieldId}) => totalFieldsHash[fieldId]);
        return sampleFields;
    }

    static sortAndAddLabels(fields) {
        // Patch field label because it may not exist
        function updateFieldLabelIfNeeded(field) {
            return Object.assign({}, field, {
                label: field.label ? field.label : field.name
            });
        }

        return fields.map(updateFieldLabelIfNeeded)
            .sort((a, b) => {
                if (a.label > b.label) {return 1;}
                if (a.label < b.label) {return -1;}
                return 0;
            });
    }

    static makeAllowedFields(samples, totalFieldsHash, sourceFieldsList) {
        const samplesFields = samples.map((sample) => FieldUtils.getSampleFields(sample, totalFieldsHash));
        const allSamplesFields = _.unionBy.apply(_, [...samplesFields, ...[(sample) => sample.id]]);
        const sortedLabelledFields = FieldUtils.sortAndAddLabels(allSamplesFields);
        return [
            ..._.filter(sortedLabelledFields, ['isEditable', false]),
            ...sourceFieldsList
        ];
    }
}