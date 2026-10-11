import { asyncHandler } from '../utils/asyncHandler';
import * as requestService from '../services/requestService';

export const stats = asyncHandler(async (_req, res) => {
  const data = await requestService.getAdminStats();
  res.status(200).json({
    success: true,
    message: 'Statistics fetched',
    data,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const request = await requestService.updateRequestStatus(String(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: 'Request status updated',
    data: request,
  });
});
