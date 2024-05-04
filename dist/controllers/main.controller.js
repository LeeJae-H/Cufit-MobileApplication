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
exports.getPopularGuidelines = exports.getTagList = exports.getTodayPhotozone = exports.getTodayGuideline = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const popularTag_model_1 = require("../models/popularTag.model");
const todayPhotoZone_model_1 = require("../models/todayPhotoZone.model");
const todayGuideline_model_1 = require("../models/todayGuideline.model");
const getTodayGuideline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guideline = yield todayGuideline_model_1.TodayGuideline.find(); // 가장 최근에 등록된 가이드라인 하나를 가져와야함
        // 또한 그 결과에는 가이드라인 정보가 포함되어있어야함
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: guideline
        });
        logger_1.default.info("Successfully get guidelines");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get guidelines: ${error}`);
    }
});
exports.getTodayGuideline = getTodayGuideline;
const getTodayPhotozone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photozone = yield todayPhotoZone_model_1.TodayPhotoZone.find();
        // 마찬가지로 포토존 정보가 포함되어있어야함.
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: photozone
        });
        logger_1.default.info("Successfully get today's photozone");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get today's photozone: ${error}`);
    }
});
exports.getTodayPhotozone = getTodayPhotozone;
const getTagList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield popularTag_model_1.PopularTag.find();
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: tags
        });
        logger_1.default.info("Successfully get tags");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get tags: ${error}`);
    }
});
exports.getTagList = getTagList;
const getPopularGuidelines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 추후에 추가합시다.
});
exports.getPopularGuidelines = getPopularGuidelines;
