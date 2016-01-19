'use strict';

const _ = require('lodash');
const Uuid = require('node-uuid');

const ChangeCaseUtil = require('../utils/ChangeCaseUtil');

class MockModelBase {
    constructor(defaultData, mockUserId) {
        this.hash = {};
        if (typeof defaultData === 'function') {
            defaultData((error, data) => {
                if (error) {
                    throw new Error(error);
                }
                this._loadDataToHash(data, mockUserId);
            });
        } else {
            this._loadDataToHash(defaultData, mockUserId);
        }
    }

    _loadDataToHash(data, mockUserId) {
        _.forEach(data, item => {
            const convertedItem = ChangeCaseUtil.convertKeysToCamelCase(item);
            this.hash[item.id] = {
                userId: mockUserId,
                item: convertedItem
            };
        });
    }

    add(userId, item, callback) {
        item.id = Uuid.v4();

        this.hash[item.id] = {
            userId,
            item
        };

        callback(null, item);
    }

    update(userId, item, callback) {
        if (!this._checkUserIdSet(userId)) {
            return;
        }
        if (!this._checkItemIdSet(item, callback)) {
            return;
        }
        const existingItem = this.hash[item.id];
        if (!existingItem) {
            callback(new Error('Item is not found'));
        } else {
            this.hash[item.id] = {
                userId,
                item
            };
            callback(null, item);
        }
    }

    remove(userId, item, callback) {
        if (!this._checkUserIdSet(userId, callback)) {
            return;
        }
        if (!this._checkItemIdSet(item, callback)) {
            return;
        }
        const existingItem = this.hash[item.id];

        if (!existingItem) {
            callback(new Error('Item is not found'));
        }

        delete this.hash[item.id];
        callback(null, item);
    }

    find(userId, itemId, callback) {
        if (!this._checkUserIdSet(userId, callback)) {
            return;
        }

        const userItem = _.find(this.hash, descriptor => descriptor.userId === userId
            && descriptor.item.id === itemId);

        if (!userItem) {
            callback(new Error('Item not found by id ' + itemId));
        } else {
            callback(null, userItem.item);
        }
    }

    findMany(userId, itemIds, callback) {
        if (!this._checkItemIdSet(userId, callback)) {
            return;
        }

        if (!itemIds || itemIds.length === 0) {
            callback(null, []);
            return;
        }

        const userItems = _.filter(this.hash, descriptor => descriptor.userId === userId
            && _.find(itemIds, itemId => descriptor.item.id === itemId));
        if (userItems) {
            callback(null, userItems);
        } else {
            callback(new Error('No items found with specified ids: %s', itemIds));
        }
    }

    findAll(userId, callback) {
        if (!this._checkUserIdSet(userId, callback)) {
            return;
        }
        const userItems = _.filter(this.hash, descriptor => descriptor.userId === userId)
            .map(descriptor => descriptor.item);
        callback(null, userItems);
    }

    _checkItemIdSet(item, callback) {
        if (!item.id) {
            callback(new Error('Item id is not set'));
            return false;
        }
        return true;
    }

    _checkUserIdSet(userId, callback) {
        if (!userId) {
            callback(new Error('User id is undefined'));
            return false;
        }
        return true;
    }
}

module.exports = MockModelBase;
