import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  status: { type: String, default: "draft", enum: ["draft", "published"] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ApplicationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Application", ApplicationSchema);
