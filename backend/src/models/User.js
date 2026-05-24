import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  nickname: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user']
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  roleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() })
  next()
})

export default mongoose.model('User', userSchema)
