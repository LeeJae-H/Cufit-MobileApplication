import { Request, Response } from 'express';
import { Status } from '../models/servserStatus.model';
import logger from '../config/logger';

export const getStatus = async (req: Request, res: Response) => {
  const currentStatus = await Status.findOne({})
  if (!currentStatus) {
    logger.error("Error get status")
    return res.status(500).json({
      statusCode: -1,
      message: "Error",
      result: {}
    });
  }
  res.status(200).json({
    statusCode: 0,
    message: "Success",
    result: currentStatus
  })
  logger.info("Successfully get status")
};