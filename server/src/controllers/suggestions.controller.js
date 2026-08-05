import { asyncHandler } from "../utils/asyncHandler.js";
import { suggestAdditions } from "../services/suggestions.service.js";

export const getSuggestions = asyncHandler(async (req, res) => {
  const { resumeId, jdId, jdText } = req.validatedBody;
  const result = await suggestAdditions({
    userId: req.user.id,
    resumeId,
    jdId,
    jdText,
  });
  res.json({ success: true, data: result });
});
