import mongoose from 'mongoose'

const departmentApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

departmentApplicationSchema.index({ userId: 1 })
departmentApplicationSchema.index({ departmentId: 1 })
departmentApplicationSchema.index({ status: 1 })

export default mongoose.model('DepartmentApplication', departmentApplicationSchema)
