import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    nodes: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["start", "approval", "condition", "branch", "end"],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        assignees: [
          {
            type: String,
          },
        ],
        assigneeType: {
          type: String,
          enum: ["user", "role", "department", "leader"],
          default: "user",
        },
        config: {
          type: Object,
          default: {},
        },
        nextNodes: [
          {
            type: String,
          },
        ],
        x: {
          type: Number,
          default: 50,
        },
        y: {
          type: Number,
          default: 50,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

workflowSchema.index({ formId: 1 });

export default mongoose.model("Workflow", workflowSchema);
