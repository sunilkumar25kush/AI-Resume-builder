import { asyncHandler } from "../utils/asyncHandler.js";
import * as assistService from "../services/assist.service.js";

export const assist = asyncHandler(async (req, res) => {
  const { section, action, content } = req.validatedBody;
  const result = await assistService.assistSection({ section, action, content });
  res.json({ success: true, data: { result } });
});
