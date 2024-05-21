const jwt = require("jsonwebtoken");
const logger = require("../configs/logger.config.js")

exports.sign = async(payload, expiresIn, secret) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, {
            expiresIn: expiresIn,
        }, (error, token) => {
            if(error){
                logger.error(error);
                reject(error);
            } else {
                resolve(token);
            }
        });
    });
};

exports.verify = async (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, payload) => {
            if (error) {
                logger.error(error);
                resolve(null);
            } else {
                resolve(payload);
            }
        });
    });
};
