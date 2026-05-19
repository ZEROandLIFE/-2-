import FormPermission from '../models/FormPermission.js'
import Form from '../models/Form.js'

const generatePublicUrl = () => {
  return 'form_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8)
}

export const getFormPermission = async (req, res) => {
  try {
    const { formId } = req.params

    let permission = await FormPermission.findOne({ formId })

    if (!permission) {
      permission = new FormPermission({
        formId,
        publishType: 'member',
        memberPermissions: [],
        publicEnabled: false
      })
      await permission.save()
    }

    return res.status(200).json({
      code: 200,
      message: '获取成功',
      data: permission
    })
  } catch (error) {
    console.error('Get permission error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const updateFormPermission = async (req, res) => {
  try {
    const { formId } = req.params
    const { publishType, publicEnabled } = req.body

    let permission = await FormPermission.findOne({ formId })

    if (!permission) {
      permission = new FormPermission({ formId })
    }

    if (publishType) permission.publishType = publishType
    if (typeof publicEnabled === 'boolean') {
      permission.publicEnabled = publicEnabled
      if (publicEnabled && !permission.publicUrl) {
        permission.publicUrl = generatePublicUrl()
        permission.publishedAt = new Date()
      }
    }

    await permission.save()

    return res.status(200).json({
      code: 200,
      message: '更新成功',
      data: permission
    })
  } catch (error) {
    console.error('Update permission error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const publishForm = async (req, res) => {
  try {
    const { formId } = req.params

    let permission = await FormPermission.findOne({ formId })

    if (!permission) {
      permission = new FormPermission({
        formId,
        publicEnabled: true,
        publicUrl: generatePublicUrl(),
        publishedAt: new Date()
      })
    } else {
      permission.publicEnabled = true
      if (!permission.publicUrl) {
        permission.publicUrl = generatePublicUrl()
      }
      permission.publishedAt = new Date()
    }

    await permission.save()

    return res.status(200).json({
      code: 200,
      message: '发布成功',
      data: {
        publicUrl: permission.publicUrl,
        publicEnabled: permission.publicEnabled
      }
    })
  } catch (error) {
    console.error('Publish error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const unpublishForm = async (req, res) => {
  try {
    const { formId } = req.params

    const permission = await FormPermission.findOne({ formId })

    if (!permission) {
      return res.status(404).json({ code: 404, message: '发布记录不存在', data: null })
    }

    permission.publicEnabled = false
    await permission.save()

    return res.status(200).json({
      code: 200,
      message: '取消发布成功',
      data: { publicEnabled: false }
    })
  } catch (error) {
    console.error('Unpublish error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const getPublicForm = async (req, res) => {
  try {
    const { publicUrl } = req.params

    const permission = await FormPermission.findOne({ publicUrl })

    if (!permission || !permission.publicEnabled) {
      return res.status(404).json({ code: 404, message: '表单不存在或未发布', data: null })
    }

    const form = await Form.findById(permission.formId).populate('creator', 'username nickname')

    if (!form) {
      return res.status(404).json({ code: 404, message: '表单不存在', data: null })
    }

    return res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        form,
        permission: {
          publishType: permission.publishType,
          publicEnabled: permission.publicEnabled
        }
      }
    })
  } catch (error) {
    console.error('Get public form error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const addMemberPermission = async (req, res) => {
  try {
    const { formId } = req.params
    const { userId, permissions } = req.body

    if (!userId || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null })
    }

    let permission = await FormPermission.findOne({ formId })

    if (!permission) {
      permission = new FormPermission({ formId })
    }

    const existingIndex = permission.memberPermissions.findIndex(
      mp => mp.userId.toString() === userId
    )

    if (existingIndex >= 0) {
      permission.memberPermissions[existingIndex].permissions = permissions
    } else {
      permission.memberPermissions.push({ userId, permissions })
    }

    await permission.save()

    return res.status(200).json({
      code: 200,
      message: '添加成功',
      data: permission
    })
  } catch (error) {
    console.error('Add member permission error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}

export const removeMemberPermission = async (req, res) => {
  try {
    const { formId, userId } = req.params

    const permission = await FormPermission.findOne({ formId })

    if (!permission) {
      return res.status(404).json({ code: 404, message: '权限记录不存在', data: null })
    }

    permission.memberPermissions = permission.memberPermissions.filter(
      mp => mp.userId.toString() !== userId
    )

    await permission.save()

    return res.status(200).json({
      code: 200,
      message: '移除成功',
      data: permission
    })
  } catch (error) {
    console.error('Remove member permission error:', error)
    return res.status(500).json({ code: 500, message: '服务器错误', data: null })
  }
}
