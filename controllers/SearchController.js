'use strict';

const Express = require('express');
const async = require('async');

const ControllerBase = require('./ControllerBase');
const ChangeCaseUtil = require('../utils/ChangeCaseUtil');

class SearchController extends ControllerBase {
    constructor(services) {
        super(services);

        this.analyze = this.analyze.bind(this);
        this.searchInResults = this.searchInResults.bind(this);
        this.getResultsPage = this.getResultsPage.bind(this);
    }

    analyze(request, response) {
        async.waterfall([
            (callback) => this.checkUserIsDefined(request, callback),
            (callback) => this.getRequestBody(request, callback),
            (body, callback) => {
                const user = request.user;
                const sessionId = request.sessionId;
                const languId = request.languId;

                const sampleId = body.sampleId;
                const viewId = body.viewId;
                const filterId = body.filterId;
                const limit = body.limit;
                const offset = body.offset;

                this.services.search
                    .sendSearchRequest(user, sessionId, languId,
                        sampleId, viewId, filterId, limit, offset, callback);
            }
        ], (error, operationId) => {
            this.sendErrorOrJson(response, error, {operationId});
        });
    }

    searchInResults(request, response) {
        async.waterfall([
            (callback) => this.checkUserIsDefined(request, callback),
            (callback) => this.getRequestBody(request, callback),
            (body, callback) => {
                const user = request.user;
                const operationId = request.params.operationId;
                const sessionId = request.sessionId;
                const globalSearchValue = body.topSearch;
                const fieldSearchValues = body.search;
                const sortValues = body.sort;
                const limit = body.limit;
                const offset = body.offset;
                if (isNaN(limit) || isNaN(offset)) {
                    callback(new Error('Offset or limit are not specified.'));
                } else {
                    this.services.search.searchInResults(user, sessionId, operationId,
                        globalSearchValue, fieldSearchValues, sortValues, limit, offset, callback);
                }
            }
        ], (error, operationId) => {
            this.sendErrorOrJson(response, error, {operationId});
        });
    }

    getResultsPage(request, response) {
        async.waterfall([
            (callback) => this.checkUserIsDefined(request, callback),
            (callback) => {
                const user = request.user;
                const operationId = request.params.operationId;
                const sessionId = request.sessionId;
                const limit = request.query.limit;
                const offset = request.query.offset;

                if (!limit || !offset || isNaN(limit) || isNaN(offset)) {
                    callback(new Error('Please set "limit" and "offset" query parameters to valid numbers.'));
                } else {
                    this.services.search.loadResultsPage(user, sessionId, operationId,
                        parseInt(limit), parseInt(offset), (error) => callback(error, operationId));
                }
            }
        ], (error, operationId) => {
            this.sendErrorOrJson(response, error, {operationId});
        });
    }

    createRouter() {
        const router = new Express();

        router.post('/', this.analyze);
        router.post('/:operationId', this.searchInResults);
        router.get('/:operationId', this.getResultsPage);

        return router;
    }
}

module.exports = SearchController;
