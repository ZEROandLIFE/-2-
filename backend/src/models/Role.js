import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  permissions: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

roleSchema.index({ name: 1 })

export default mongoose.model('Role', roleSchema)
