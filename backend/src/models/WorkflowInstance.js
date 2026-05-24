import mongoose from "mongoose";

const workflowInstanceSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    formDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormData",
      required: true,
    },
    currentNodeId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["running", "completed", "rejected"],
      default: "running",
    },
    history: [
      {
        nodeId: {
          type: String,
          required: true,
        },
        nodeTitle: {
          type: String,
          required: true,
        },
        action: {
          type: String,
          enum: ["submit", "approve", "reject"],
          required: true,
        },
        operator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

workflowInstanceSchema.index({ workflowId: 1 });
workflowInstanceSchema.index({ formDataId: 1 });
workflowInstanceSchema.index({ status: 1 });

export default mongoose.model("WorkflowInstance", workflowInstanceSchema);