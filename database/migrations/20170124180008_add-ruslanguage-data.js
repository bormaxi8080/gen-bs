const BluebirdPromise = require('bluebird');
const _ = require('lodash');

const {rusFilters} = require('./20170124180008_add-ruslanguage-data/filters');
const {rusViews} = require('./20170124180008_add-ruslanguage-data/views');
const {rusModels} = require('./20170124180008_add-ruslanguage-data/models');
const {rusSamples} = require('./20170124180008_add-ruslanguage-data/samples');

exports.up = function (knex) {
    console.log('=> Add rus table data ...');
    return addRusLanguage(knex)
        .then(() => {
            return BluebirdPromise.mapSeries(rusFilters, filter => addFilter(filter, knex))
        })
        .then(() => {
            return BluebirdPromise.mapSeries(rusViews, view => addView(view, knex))
        })
        .then(() => {
            return BluebirdPromise.mapSeries(rusModels, model => addModel(model, knex))
        })
        .then(() => {
            return BluebirdPromise.mapSeries(rusSamples, sample => addSampleText(sample, knex))
        });
};

exports.down = function () {
    throw new Error('Not implemented');
};

function createSampleName(fileName, genotype) {
    const name = genotype ? `${fileName}:${genotype}` : fileName;
    return name.substr(-50, 50);
}

function addSampleText(sample, knex) {
    return knex('vcf_file')
        .select('id')
        .where('file_name', sample.fileName)
        .then((results) => _.first(results)['id'])
        .then((vcfFileId) => {
            return knex('sample')
                .select(['id', 'genotype_name'])
                .where('vcf_file_id', vcfFileId)
                .then((results) => {
                    return BluebirdPromise.mapSeries(results, result => {
                        return knex('sample_text')
                            .insert({
                                sample_id: result['id'],
                                language_id: 'ru',
                                name: createSampleName(sample.ruName, result['genotype_name']),
                                description: ''
                            });
                    })
                })
        });
}

function addModel(model, knex) {
    return knex('model_text')
        .select('model_id')
        .where('name', model.enName)
        .then((results) => _.first(results)['model_id'])
        .then((modelId) => {
            return knex('model_text')
                .insert({
                    model_id: modelId,
                    language_id: 'ru',
                    description: model.ruDescription,
                    name: model.ruName
                })
        });
}

function addView(view, knex) {
    return knex('view_text')
        .select('view_id')
        .where('name', view.enName)
        .then((results) => _.first(results)['view_id'])
        .then((viewId) => {
            return knex('view_text')
                .insert({
                    view_id: viewId,
                    language_id: 'ru',
                    description: view.ruDescription,
                    name: view.ruName
                });
        });
}

function addFilter(filter, knex) {
    return knex('filter_text')
        .select('filter_id')
        .where('name', filter.enName)
        .then((results) => _.first(results)['filter_id'])
        .then((filterId) => {
            return knex('filter_text')
                .insert({
                    filter_id: filterId,
                    language_id: 'ru',
                    description: filter.ruDescription,
                    name: filter.ruName
                });
        });
}

function addRusLanguage(knex) {
    return knex('language')
        .insert({
            id: 'ru',
            description: 'Russian'
        });
}