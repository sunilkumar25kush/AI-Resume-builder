import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, default: "info" },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, default: "", maxlength: 500 },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, readAt: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
