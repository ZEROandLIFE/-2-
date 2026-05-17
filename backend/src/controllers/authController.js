import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js'

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null })
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户已存在', data: null })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      email,
      password: hashedPassword,
      nickname: username
    })

    await user.save()

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    return res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ code: 400, message: '请填写邮箱和密码', data: null })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误', data: null })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误', data: null })
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ code: 400, message: '缺少refreshToken', data: null })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在', data: null })
    }

    const newAccessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)

    return res.status(200).json({
      code: 200,
      message: '刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(401).json({ code: 401, message: 'Refresh token无效', data: null })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = req.user

    return res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('GetMe error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const logout = async (req, res) => {
  try {
    return res.status(200).json({ code: 200, message: '退出成功', data: null })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}
