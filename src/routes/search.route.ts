import express from 'express';
import { getSomethingByKeyword } from '../controllers/search.controller';

const router = express.Router();

router.get("/:keyword", getSomethingByKeyword) // 키워드로 사용자, 가이드라인, 필터 조회

export default router;