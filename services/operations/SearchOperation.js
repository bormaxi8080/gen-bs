'use strict';

const OperationBase = require('./OperationBase');

class SearchOperation extends OperationBase {
    constructor(sessionId, method) {
        super(sessionId, method);
        this.setSendCloseToAppServer(true);
    }

    getType() {
        return OperationBase.operationTypes().SEARCH;
    }

    getLimit() {
        return this.limit;
    }

    setLimit(limit) {
        this.limit = limit;
    }

    getOffset() {
        return this.offset;
    }

    setOffset(offset) {
        this.offset = offset;
    }

    getSampleId() {
        return this.sampleId;
    }

    setSampleId(sampleId) {
        this.sampleId = sampleId;
    }

    getUserId() {
        return this.userId;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setRedisParams(redisParams) {
        this.redisParams = redisParams;
    }

    getRedisParams() {
        return this.redisParams;
    }
}

module.exports = SearchOperation;
