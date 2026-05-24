import Department from "../models/Department.js";
import Role from "../models/Role.js";
import DepartmentMember from "../models/DepartmentMember.js";
import DepartmentApplication from "../models/DepartmentApplication.js";
import User from "../models/User.js";

// ============ 部门管理 ============

// 创建部门
export const createDepartment = async (req, res) => {
  try {
    const { name, parentId, leaderId, description, order } = req.body;

    const department = await Department.create({
      name,
      parentId: parentId || null,
      leaderId: leaderId || null,
      description: description || "",
      order: order || 0,
    });

    res.status(201).json({
      code: 200,
      message: "部门创建成功",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取部门列表（树形结构）
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({
      order: 1,
      createdAt: 1,
    });

    // 构建树形结构
    const buildTree = (items, parentId = null) => {
      return items
        .filter((item) => {
          const itemParentId =
            item.parentId == null ? null : String(item.parentId);
          const targetParentId = parentId == null ? null : String(parentId);
          return itemParentId === targetParentId;
        })
        .map((item) => ({
          ...item.toObject(),
          children: buildTree(items, item._id),
        }));
    };

    const tree = buildTree(departments);

    res.json({
      code: 200,
      message: "获取成功",
      data: tree,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取单个部门
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("leaderId", "username nickname email")
      .populate("parentId", "name");

    if (!department) {
      return res.status(404).json({
        code: 404,
        message: "部门不存在",
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 更新部门
export const updateDepartment = async (req, res) => {
  try {
    const { name, parentId, leaderId, description, order } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (leaderId !== undefined) updateData.leaderId = leaderId || null;
    if (description !== undefined) updateData.description = description || "";
    if (order !== undefined) updateData.order = order || 0;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!department) {
      return res.status(404).json({
        code: 404,
        message: "部门不存在",
      });
    }

    res.json({
      code: 200,
      message: "更新成功",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 删除部门
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // 检查是否有子部门
    const hasChildren = await Department.findOne({ parentId: departmentId });
    if (hasChildren) {
      return res.status(400).json({
        code: 400,
        message: "请先删除子部门",
      });
    }

    // 检查是否有成员
    const hasMembers = await DepartmentMember.findOne({ departmentId });
    if (hasMembers) {
      return res.status(400).json({
        code: 400,
        message: "请先移除部门成员",
      });
    }

    await Department.findByIdAndDelete(departmentId);

    res.json({
      code: 200,
      message: "删除成功",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// ============ 角色管理 ============

// 创建角色
export const createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;

    const role = await Role.create({
      name,
      permissions: permissions || [],
      description: description || "",
    });

    res.status(201).json({
      code: 200,
      message: "角色创建成功",
      data: role,
    });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取角色列表
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取单个角色
export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "角色不存在",
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: role,
    });
  } catch (error) {
    console.error("Get role error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 更新角色
export const updateRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        permissions: permissions || [],
        description: description || "",
      },
      { new: true },
    );

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "角色不存在",
      });
    }

    res.json({
      code: 200,
      message: "更新成功",
      data: role,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 删除角色
export const deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);

    res.json({
      code: 200,
      message: "删除成功",
    });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// ============ 部门成员管理 ============

// 添加部门成员
export const addDepartmentMember = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { userId, isPrimary } = req.body;

    // 检查是否已是成员
    const existing = await DepartmentMember.findOne({ departmentId, userId });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: "该用户已是部门成员",
      });
    }

    const member = await DepartmentMember.create({
      departmentId,
      userId,
      isPrimary: isPrimary || false,
    });

    // 如果是主部门，更新用户的主部门
    if (isPrimary) {
      await User.findByIdAndUpdate(userId, { departmentId });
    }

    res.status(201).json({
      code: 200,
      message: "添加成功",
      data: member,
    });
  } catch (error) {
    console.error("Add department member error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取部门成员列表
export const getDepartmentMembers = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const members = await DepartmentMember.find({ departmentId })
      .populate("userId", "username nickname email avatar")
      .sort({ isPrimary: -1, joinedAt: 1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: members,
    });
  } catch (error) {
    console.error("Get department members error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 移除部门成员
export const removeDepartmentMember = async (req, res) => {
  try {
    const { departmentId, userId } = req.params;

    const member = await DepartmentMember.findOneAndDelete({
      departmentId,
      userId,
    });
    if (!member) {
      return res.status(404).json({
        code: 404,
        message: "成员不存在",
      });
    }

    // 如果是主部门，清除用户的主部门
    if (member.isPrimary) {
      await User.findByIdAndUpdate(userId, { departmentId: null });
    }

    res.json({
      code: 200,
      message: "移除成功",
    });
  } catch (error) {
    console.error("Remove department member error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取用户所属部门列表
export const getUserDepartments = async (req, res) => {
  try {
    const { userId } = req.params;

    const memberships = await DepartmentMember.find({ userId })
      .populate("departmentId")
      .sort({ isPrimary: -1 });

    const departments = memberships
      .filter((m) => m.departmentId)
      .map((m) => ({
        ...m.departmentId.toObject(),
        isPrimary: m.isPrimary,
        joinedAt: m.joinedAt,
      }));

    res.json({
      code: 200,
      message: "获取成功",
      data: departments,
    });
  } catch (error) {
    console.error("Get user departments error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// ============ 申请加入部门 ============

// 申请加入部门
export const applyToJoinDepartment = async (req, res) => {
  try {
    const { departmentId, reason } = req.body;
    const userId = req.user._id;

    // 检查是否已是成员
    const existing = await DepartmentMember.findOne({ departmentId, userId });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: "您已是部门成员",
      });
    }

    // 检查是否有待处理的申请
    const pending = await DepartmentApplication.findOne({
      userId,
      departmentId,
      status: "pending",
    });
    if (pending) {
      return res.status(400).json({
        code: 400,
        message: "您已有待处理的申请",
      });
    }

    const application = await DepartmentApplication.create({
      userId,
      departmentId,
      reason: reason || "",
    });

    res.status(201).json({
      code: 200,
      message: "申请已提交",
      data: application,
    });
  } catch (error) {
    console.error("Apply to join department error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取用户的申请列表
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await DepartmentApplication.find({ userId })
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取部门的待审批申请（部门负责人或管理员）
export const getDepartmentApplications = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const applications = await DepartmentApplication.find({
      departmentId,
      status: "pending",
    })
      .populate("userId", "username nickname email")
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: applications,
    });
  } catch (error) {
    console.error("Get department applications error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 审批加入申请
export const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approved' 或 'rejected'
    const reviewerId = req.user._id;

    const application = await DepartmentApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: "申请不存在",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        code: 400,
        message: "该申请已被处理",
      });
    }

    application.status = action;
    application.reviewerId = reviewerId;
    application.reviewedAt = new Date();
    await application.save();

    // 如果批准，自动添加为部门成员
    if (action === "approved") {
      await DepartmentMember.create({
        userId: application.userId,
        departmentId: application.departmentId,
        isPrimary: false,
      });
    }

    res.json({
      code: 200,
      message: action === "approved" ? "已批准" : "已拒绝",
    });
  } catch (error) {
    console.error("Review application error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// ============ 获取所有用户（用于选择）============

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("username nickname email avatar")
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};
