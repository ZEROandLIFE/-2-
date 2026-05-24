import mongoose from 'mongoose'

const departmentMemberSchema = new mongoose.Schema({
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
  isPrimary: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

departmentMemberSchema.index({ userId: 1, departmentId: 1 }, { unique: true })
departmentMemberSchema.index({ departmentId: 1 })
departmentMemberSchema.index({ userId: 1 })

export default mongoose.model('DepartmentMember', departmentMemberSchema)
