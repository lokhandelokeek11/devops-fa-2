import { asyncHandler } from '../utils/asyncHandler';
import * as requestService from '../services/requestService';
import type { ListQuery } from '../utils/validators';

export const create = asyncHandler(async (req, res) => {
  const request = await requestService.createRequest(req.body);
  res.status(201).json({
    success: true,
    message: 'Request created',
    data: request,
  });
});

export const list = asyncHandler(async (_req, res) => {
  const result = await requestService.listRequests(res.locals.query as ListQuery);
  res.status(200).json({
    success: true,
    message: 'Requests fetched',
    data: result,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const request = await requestService.getRequestById(String(req.params.id));
  res.status(200).json({
    success: true,
    message: 'Request fetched',
    data: request,
  });
});

export const update = asyncHandler(async (req, res) => {
  const request = await requestService.updateRequest(String(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: 'Request updated',
    data: request,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await requestService.deleteRequest(String(req.params.id));
  res.status(200).json({
    success: true,
    message: 'Request deleted',
    data: null,
  });
});
