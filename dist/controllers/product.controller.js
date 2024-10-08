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
exports.getReview = exports.getDetail = void 0;
const user_model_1 = require("../models/user.model");
const guideline_model_1 = require("../models/guideline.model");
const filter_model_1 = require("../models/filter.model");
const review_model_1 = require("../models/review.model");
const like_model_1 = require("../models/like.model");
const wish_model_1 = require("../models/wish.model");
const follow_model_1 = require("../models/follow.model");
const order_model_1 = require("../models/order.model");
const logger_1 = __importDefault(require("../config/logger"));
const viewCount_model_1 = require("../models/viewCount.model");
const getDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = `${req.query.uid}`;
    const cid = `${req.query.cid}`;
    const type = `${req.query.type}`;
    const productId = req.params.productId;
    let avgRating = 0;
    let reviewCount = 0;
    let latestReviews = [];
    if (!productId || !type) {
        logger_1.default.error("Lack of essential data");
        return res.status(400).json({
            statusCode: -1,
            message: "Lack of essential data",
            result: {}
        });
    }
    try {
        let user;
        try {
            const tUser = yield user_model_1.User.getFromUid(cid);
            const salingFilters = yield filter_model_1.Filter.getListFromCreatorUid(tUser.uid);
            const salingGuidelines = yield guideline_model_1.Guideline.getListFromCreatorUid(tUser.uid);
            const reviews = yield review_model_1.Review.find({ productId: productId }).populate('user');
            let totalRating = 0;
            reviews.forEach(review => totalRating = totalRating + review.stars);
            if (reviews.length > 0) {
                avgRating = totalRating / reviews.length;
            }
            reviewCount = reviews.length;
            latestReviews = reviews.splice(0, 5);
            user = tUser;
            user.salingFilters = salingFilters;
            user.salingGuidelines = salingGuidelines;
        }
        catch (error) {
            throw new Error("error while find creator info");
        }
        const view = new viewCount_model_1.ViewCount({
            productId: productId,
            productType: type,
            uid: uid,
            createdAt: Date.now()
        });
        view.save(); // 저장보다 정보를 가져오는게 더중요하고 저장이 안되어도 크게 문제가 되지 않기 때문에 결과를 보지 않고 다음 블록을 진행하도록 await 제거
        if (!uid || uid === "") {
            return res.status(200).json({
                statusCode: 0,
                message: "Success",
                result: {
                    creator: user,
                    isFollowed: false,
                    isLiked: false,
                    isWished: false,
                    isPurchased: false,
                    rating: avgRating,
                    reviewCount,
                    latestReviews: latestReviews
                }
            });
        }
        let isFollowed = yield follow_model_1.Follow.isFollowed(uid, cid);
        let isLiked = yield like_model_1.Like.isExist(productId, uid, type);
        let isWished = yield wish_model_1.Wish.isExist(productId, uid, type);
        let isPurchased = yield order_model_1.Order.isExist(productId, uid, type);
        let review = yield review_model_1.Review.findOne({ uid, productId });
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: {
                creator: user,
                isFollowed,
                isLiked,
                isWished,
                isPurchased,
                review,
                rating: avgRating,
                reviewCount,
                latestReviews: latestReviews
            }
        });
        logger_1.default.info("Successfully get detail");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get detail: ${error}`);
    }
});
exports.getDetail = getDetail;
const getReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    try {
        const reviews = yield review_model_1.Review.find({ productId }).populate('user');
        res.status(200).json({
            statusCode: 0,
            message: "Success",
            result: reviews
        });
        logger_1.default.info("Successfully get review");
    }
    catch (error) {
        res.status(500).json({
            statusCode: -1,
            message: error,
            result: {}
        });
        logger_1.default.error(`Error get review: ${error}`);
    }
});
exports.getReview = getReview;
