import mongoose from "mongoose";

const WidgetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("WidgetCategory", WidgetCategorySchema);
