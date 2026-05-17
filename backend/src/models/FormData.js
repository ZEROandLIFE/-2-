import mongoose from 'mongoose';

const FormDataSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  data: { type: Object, required: true },
  submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  submitTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
  status: { type: String, default: 'draft', enum: ['draft', 'submitted', 'approved', 'rejected'] },
});

FormDataSchema.pre('save', function(next) {
  this.updateTime = Date.now();
  next();
});

export default mongoose.model('FormData', FormDataSchema);