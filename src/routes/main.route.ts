import express from 'express';
import { getTodayGuideline, getTodayPhotozone, getTagList, getPopularGuidelines, getPopularPhotozones, getTrendingPoseList } from '../controllers/main.controller';

const router = express.Router();

router.get("/tag-list", getTagList);
// 아래 컨트롤러 함수에서 코멘트 확인 후 요구사항 적용하기
router.get("/today/guideline", getTodayGuideline);
router.get("/today/photozone", getTodayPhotozone);

router.get("/trending/pose", getTrendingPoseList);
router.get("/popular/guidelines", getPopularGuidelines);
router.get("/popular/photozones", getPopularPhotozones);
export default router;
