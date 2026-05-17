import mongoose from "mongoose";

const PageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  components: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      props: { type: Object, default: {} },
      style: { type: Object, default: {} },
      children: { type: Array, default: [] },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Page", PageSchema);
