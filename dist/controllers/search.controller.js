"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByAddress = exports.getPhotozoneInArea = exports.getGuidelineInArea = exports.getAnything = exports.searchFilters = exports.searchGuidelines = exports.searchCreators = void 0;
const user_model_1 = require("../models/user.model");
const filter_model_1 = require("../models/filter.model");
const guideline_model_1 = require("../models/guideline.model");
const photoZone_model_1 = require("../models/photoZone.model");
const logger_1 = __importDefault(require("../config/logger"));
const searchedKeyword_model_1 = require("../models/searchedKeyword.model");
const searchCreators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    try {
        const creators = yield user_model_1.User.search(keyword); // 대소문자 구분 x, 한글 검색 가능, 한글자부터 검색 가능
        // User.search에서, bio 제거?
        res.status(200).json({
            statusCode: 0,
            message: "Success search creators",
            result: {
                creators: creators
            }
        });
        logger_1.default.info("Successfully search creators");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error search creators: ${error}`);
    }
});
exports.searchCreators = searchCreators;
const searchGuidelines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    const authCode = req.query.code;
    try {
        const guidelines = yield guideline_model_1.Guideline.searchbyTitleOrTag(keyword, authCode);
        res.status(200).json({
            statusCode: 0,
            message: "Success search guidelines",
            result: {
                guidelines: guidelines
            }
        });
        logger_1.default.info("Successfully search guidelines");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error search guidelines: ${error}`);
    }
});
exports.searchGuidelines = searchGuidelines;
const searchFilters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    try {
        const filters = yield filter_model_1.Filter.searchbyTitleOrTag(keyword);
        res.status(200).json({
            statusCode: 0,
            message: "Success search filters",
            result: {
                filters: filters
            }
        });
        logger_1.default.info("Successfully search filters");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error search filters: ${error}`);
    }
});
exports.searchFilters = searchFilters;
const getAnything = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.params.keyword;
    const authCode = req.query.code;
    const uid = req.query.uid;
    try {
        // creator, guideline, filter, photoZone
        if (keyword === "") {
            throw new Error("Empty keyword");
        }
        const searched = new searchedKeyword_model_1.SearchedKeyword({
            keyword: keyword,
            createdAt: Date.now(),
            uid: uid
        });
        yield searched.save();
        const creator = yield user_model_1.User.search(keyword);
        const guideline = yield guideline_model_1.Guideline.newSearch(keyword, authCode);
        const filter = yield filter_model_1.Filter.newSearch(keyword);
        const photoZone = yield photoZone_model_1.PhotoZone.searchByKeyword(keyword);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                creator: creator,
                guideline: guideline,
                filter: filter,
                photoZone: photoZone
            }
        });
        logger_1.default.info("Successfully get anything");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get anything: ${error}`);
    }
});
exports.getAnything = getAnything;
// req.body.coordinates 예시
// {
//   "coordinates": [
//     {"lng": -1, "lat": -1},
//     {"lng": 1, "lat": -1},
//     {"lng": 1, "lat": 1},
//     {"lng": -1, "lat": 1},
//     {"lng": -1, "lat": -1}
//   ]
// }
// 
// => 점들이 순서대로 가야하고, 첫 점과 끝 점이 같아야 함
const getGuidelineInArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authCode = req.query.code;
    if (!req.body.coordinates) {
        logger_1.default.error("Lack of essential data");
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        let coordinates = [];
        req.body.coordinates.forEach((coord) => {
            const count = coord.lat.length;
            for (var i = 0; i < count; i++) {
                coordinates.push([parseFloat(coord.lng[i]), parseFloat(coord.lat[i])]);
            }
        });
        if (coordinates.length < 3) {
            logger_1.default.error("Lack of essential data");
            return res.status(400).json({
                statusCode: -1,
                message: "Lack of essential data",
                result: {}
            });
        }
        const result = yield guideline_model_1.Guideline.findByArea(coordinates, authCode);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: result
        });
        logger_1.default.info("Successfully get guideline in area");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get guideline in area: ${error}`);
    }
});
exports.getGuidelineInArea = getGuidelineInArea;
const getPhotozoneInArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authCode = req.query.code;
    if (!req.body.coordinates) {
        logger_1.default.error("Lack of essential data");
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        let coordinates = [];
        req.body.coordinates.forEach((coord) => {
            const count = coord.lat.length;
            for (var i = 0; i < count; i++) {
                coordinates.push([parseFloat(coord.lng[i]), parseFloat(coord.lat[i])]);
            }
        });
        if (coordinates.length < 3) {
            logger_1.default.error("Lack of essential data");
            return res.status(400).json({
                statusCode: -1,
                message: "Lack of essential data",
                result: {}
            });
        }
        const result = yield photoZone_model_1.PhotoZone.findByArea(coordinates, authCode);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: result
        });
        logger_1.default.info("Successfully get photozone in area");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get photozone in area: ${error}`);
    }
});
exports.getPhotozoneInArea = getPhotozoneInArea;
const getByAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = `${req.query.address}`;
    if (!address || address === "") {
        logger_1.default.error("Lack of essential data");
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        let guidelines = yield guideline_model_1.Guideline.searchByAddress(address);
        let photozones = yield photoZone_model_1.PhotoZone.searchByAddress(address);
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                guidelines,
                photozones
            }
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error while searching with address: ${error}`);
    }
});
exports.getByAddress = getByAddress;
