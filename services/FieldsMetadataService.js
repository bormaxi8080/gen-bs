'use strict';

const ServiceBase = require('./ServiceBase');

const FIELDS_METADATA = require('../test_data/fields_metadata.json');

class FieldsMetadataService extends ServiceBase {
    constructor(services) {
        super(services);
    }

    findForUserBySampleId(user, sampleId, callback) {
        if (user) {
            callback(null, FIELDS_METADATA);
        } else {
            callback(new Error('User is undefined'));
        }

    }
}

module.exports = FieldsMetadataService;