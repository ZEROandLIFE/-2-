import mongoose from "mongoose";

const memberPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: ["submit", "view", "edit", "delete", "manage"],
      },
    ],
  },
  { _id: false },
);

const formPermissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
    unique: true,
  },
  publishType: {
    type: String,
    enum: ["member", "public", "both"],
    default: "member",
  },
  memberPermissions: [memberPermissionSchema],
  publicUrl: {
    type: String,
    unique: true,
    sparse: true,
  },
  publicEnabled: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

formPermissionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formPermissionSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model("FormPermission", formPermissionSchema);
