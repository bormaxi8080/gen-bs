'use strict';

const _ = require('lodash');
const Uuid = require('node-uuid');

const ServiceBase = require('./ServiceBase');

const SYSTEM_USER_ID = '9c952e80-c2db-4a09-a0b0-6ea667d254a1';

const OPERATION_TYPES = {
    SYSTEM: 'system',
    SEARCH: 'search',
    UPLOAD: 'upload'
};

class SessionService extends ServiceBase {
    constructor(services) {
        super(services);

        this.sessions = {};
    }

    systemUserId() {
        return SYSTEM_USER_ID;
    }

    operationTypes() {
        return OPERATION_TYPES;
    }

    /**
     * Creates a new session for the specified user with token.
     * Currently, also destroys existing sessions of the same user, if any.
     * */
    startForUser(userName, password, callback) {
        this.sessions.tokens.login(userName, password, (error, tokenDescriptor) => {
            if (error) {
                callback(error);
            } else {
                const token = tokenDescriptor.token;
                const userId = tokenDescriptor.userId;

                // Check and remove existing user session.
                let existingSessionId = _.findKey(this.sessions, {'userId': userId});
                if (existingSessionId) {
                    this._destroySession(existingSessionId, (error) => {
                        if (error) {
                            console.error('Error destroying existing session: %s', error);
                        }
                    });
                }

                this._createSession(userId, token, callback);
            }
        });
    }

    /**
     * Starts demo user session.
     * There should be only few active demo sessions at one time.
     * */
    startDemo(callback) {
        this.services.users.findDemoUser((error, demoUser) => {
            if (error) {
                callback(error);
            } else {
                this._createSession(null, demoUser.id, (error, session) => {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, session.id);
                    }
                });
            }
        });
    }

    findById(sessionId, callback) {
        // TODO: Do dead sessions cleanup here.
        const session = this.sessions[sessionId];
        if (session) {
            callback(null, session.id);
        } else {
            callback(new Error('Session is not found.'));
        }
    }

    findSessionUserId(sessionId, callback) {
        this.findById(sessionId, (error, sessionId) => {
            if (error) {
                callback(error);
            } else {
                const session = this.sessions[sessionId];
                callback(null, session.userId);
            }
        })
    }

    /**
     * Starts search operation for the specified session.
     * Also, destroys existing search operation in this session, if any.
     * */
    startSearchOperation(sessionId, callback) {
        this.findById(sessionId, (error, session) => {
            if (error) {
                callback(error);
            } else {
                this._deleteSearchOperationIfAny(session, (error) => {
                    if (error) {
                        console.error('Error ending previous search operation: %s', error);
                    }

                    // Try to continue anyway.
                    this._createSessionOperation(session, OPERATION_TYPES.SEARCH, (error, operation) => {
                        if (error) {
                            callback(error);
                        } else {
                            callback(null, operation.id);
                        }
                    });
                });
            }
        });
    }

    checkOperationType(sessionId, operationId, operationType, callback) {
        this.findById(sessionId, (error, session) => {
            if (error) {
                callback(error);
            } else {
                const operation = session.operations[operationId];
                if (operation.type !== operationType) {
                    callback(new Error('The specified operation id is not of the specified type. Operation type: ' + operation.type + ', desired: ' + operationType));
                } else {
                    callback(null);
                }
            }
        });
    }

    destroySession(sessionId, callback) {
        const sessionDescriptor = this.sessions[sessionId];
        if (!sessionDescriptor) {
            callback(new Error('Session is not found'));
        } else {
            // Destroy the local session information.
            delete this.sessions[sessionId];

            if (sessionDescriptor.token) {
                // Destroy the associated user token without processing errors.
                this.services.tokens.logout(sessionDescriptor.token, callback);
            }
        }
    }

    /**
     * Returns all session ids.
     * */
    findAll(callback) {
        const sessionIds = _.keys(this.sessions);
        callback(null, sessionIds);
    }

    findOperationIds(sessionId, callback) {
       this.findById(sessionId, (error, sessionId) => {
           if (error) {
               callback(error);
           } else {
               const session = this.sessions[sessionId];
               const operationIds = _.keys(session.operations);
               callback(null, operationIds);
           }
       });
    }

    _deleteSearchOperationIfAny(session, callback) {
        const operationId = _.findKey(session.operations, {type: OPERATION_TYPES.SEARCH});
        if (operationId) {
            delete session.operations[operationId];

            this.services.applicationServer.requestCloseSession(operationId, (error) => {
                if (error) {
                   callback(error);
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    }

    _createSessionOperation(session, operationType, callback) {
        const operationId = Uuid.v4();
        const operation = {
            id: operationId,
            type: operationType
        };
        session.operations[operationId] = operation;
        callback(null, operation);
    }

    _createSession(token, userId, callback) {
        const sessionId = Uuid.v4();
        const session = {
            id: sessionId,
            userId: userId,
            token: token,
            lastActivity: Date.now(),
            operations: {}
        };

        this.sessions[sessionId] = session;
        callback(null, session);
    }
}

module.exports = SessionService;