import mongoose from 'mongoose';

const FieldConfigSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  fieldKey: { type: String, required: true },
  description: { type: String },
  placeholder: { type: String },
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  editable: { type: Boolean, default: true },
  width: { type: String, default: 'full', enum: ['1/4', '1/3', '1/2', '2/3', '3/4', 'full'] },
  options: [{
    label: { type: String },
    value: { type: String },
  }],
  validation: { type: Object },
  props: { type: Object },
  sortOrder: { type: Number, default: 0 },
});

const FormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'normal', enum: ['normal', 'workflow'] },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  description: { type: String },
  fields: [FieldConfigSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Form', FormSchema);