import mongoose from "mongoose";

const WidgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "WidgetCategory" },
  icon: { type: String },
  description: { type: String },
  props: { type: Object, default: {} },
  defaultStyle: { type: Object, default: {} },
  preview: { type: String },
  isSystem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Widget", WidgetSchema);
