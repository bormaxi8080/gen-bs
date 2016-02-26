'use strict';

const async = require('async');

const ServiceBase = require('./ServiceBase');

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const SYSTEM_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "System",
    "last_name": "Super",
    "email": "system@genomix.com",
    "speciality": "system",
    "language": "en",
    "number_paid_samples": 0
};

class UserService extends ServiceBase {
    constructor(services, models) {
        super(services, models);

        this.models.user.find(DEMO_USER_ID, (error, user) => {
            if (error) {
                throw new Error('Cannot find demo user: ' + error);
            } else {
                this.demoUser = user;
            }
        });
    }

    /**
     * Adds a new user with specified params.
     * @param defaultLanguId User's default language.
     * @param name First name.
     * @param lastName Last name.
     * @param speciality User's job position name.
     * @param numberPaidSamples Number of times user is allowed to analyze a new sample.
     * @param email User email.
     * @param callback (error, userId)
     * */
    add(defaultLanguId, name, lastName, email, speciality, numberPaidSamples, callback) {
        const user = {
            name,
            lastName,
            email,
            speciality,
            language: defaultLanguId,
            numberPaidSamples
        };

        this.models.user.add(user, defaultLanguId, callback);
    }

    /**
     * Returns true if the specified user id is id of the demo user.
     * */
    isDemoUserId(userId) {
        return userId === DEMO_USER_ID;
    }

    findDemoUser(callback) {
        callback(null, this.demoUser);
    }

    findSystemUser(callback) {
        callback(null, SYSTEM_USER);
    }

    findIdByEmail(email, callback) {
        this.models.user.findIdByEmail(email, callback);
    }

    find(userId, callback) {
        async.waterfall([
            (callback) => {
                if (userId === DEMO_USER_ID) {
                    callback(null, this.demoUser);
                } else if (userId === SYSTEM_USER.id) {
                    callback(null, SYSTEM_USER);
                } else {
                    this.models.user.find(userId, callback);
                }
            },
            (user, callback) => {
                if (user.isDeleted) {
                    callback(new Error('User not found.'));
                } else {
                    callback(null, user);
                }
            }
        ], callback);
    }
}

module.exports = UserService;
