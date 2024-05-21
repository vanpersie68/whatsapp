const createHttpError = require("http-errors");
const logger = require("../configs/logger.config");
const { searchUsers } = require("../services/user.service");

exports.searchUsers = async(req, res, next) => {
    try{
        const keyword = req.query.search;
        if(!keyword) {
            logger.error("Please add a search query first");
            throw createHttpError.BadRequest("Oops...Something went wrong !");
        }

        const users = await searchUsers(keyword, req.user.userId);
        res.status(200).json(users);
    } catch(error) {
        next(error);
    }
};