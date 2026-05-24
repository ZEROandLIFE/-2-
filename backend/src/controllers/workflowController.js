import Workflow from "../models/Workflow.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
import Form from "../models/Form.js";
import FormData from "../models/FormData.js";
import DepartmentMember from "../models/DepartmentMember.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

// ============ 流程定义操作 ============

// 创建流程
export const createWorkflow = async (req, res) => {
  try {
    const { formId, name, description, nodes } = req.body;

    const workflow = await Workflow.create({
      formId,
      name,
      description: description || "",
      nodes: nodes || [],
    });

    res.status(201).json({
      code: 200,
      message: "流程创建成功",
      data: workflow,
    });
  } catch (error) {
    console.error("Create workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取流程列表
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find().populate("formId", "name").sort({
      createdAt: -1,
    });

    res.json({
      code: 200,
      message: "获取成功",
      data: workflows,
    });
  } catch (error) {
    console.error("Get workflows error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取单个流程
export const getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).populate(
      "formId",
      "name"
    );

    if (!workflow) {
      return res.status(404).json({
        code: 404,
        message: "流程不存在",
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: workflow,
    });
  } catch (error) {
    console.error("Get workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 更新流程
export const updateWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!workflow) {
      return res.status(404).json({
        code: 404,
        message: "流程不存在",
      });
    }

    res.json({
      code: 200,
      message: "更新成功",
      data: workflow,
    });
  } catch (error) {
    console.error("Update workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 删除流程
export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        code: 404,
        message: "流程不存在",
      });
    }

    await WorkflowInstance.deleteMany({ workflowId: req.params.id });

    res.json({
      code: 200,
      message: "删除成功",
    });
  } catch (error) {
    console.error("Delete workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// ============ 流程实例操作 ============

// 启动流程实例
export const startWorkflow = async (req, res) => {
  try {
    const { workflowId, formDataId, operatorId } = req.body;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({
        code: 404,
        message: "流程不存在",
      });
    }

    const startNode = workflow.nodes.find((node) => node.type === "start");
    if (!startNode) {
      return res.status(400).json({
        code: 400,
        message: "流程未配置开始节点",
      });
    }

    const instance = await WorkflowInstance.create({
      workflowId,
      formDataId,
      currentNodeId: startNode.id,
      status: "running",
      history: [
        {
          nodeId: startNode.id,
          nodeTitle: startNode.title,
          action: "submit",
          operator: operatorId,
          comment: "流程已提交",
          timestamp: Date.now(),
        },
      ],
    });

    await proceedToNextNode(instance._id, startNode);

    res.status(201).json({
      code: 200,
      message: "流程已启动",
      data: instance,
    });
  } catch (error) {
    console.error("Start workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 流程流转到下一节点
const proceedToNextNode = async (instanceId, currentNode) => {
  try {
    if (!currentNode.nextNodes || currentNode.nextNodes.length === 0) {
      await WorkflowInstance.findByIdAndUpdate(instanceId, {
        status: "completed",
      });
      return;
    }

    await WorkflowInstance.findByIdAndUpdate(instanceId, {
      currentNodeId: currentNode.nextNodes[0],
    });
  } catch (error) {
    console.error("Proceed to next node error:", error);
    throw error;
  }
};

// 审批操作
export const approveWorkflow = async (req, res) => {
  try {
    const { instanceId, comment, action } = req.body;
    const operatorId = req.user._id;

    const instance = await WorkflowInstance.findById(instanceId).populate(
      "workflowId"
    );

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "流程实例不存在",
      });
    }

    if (instance.status !== "running") {
      return res.status(400).json({
        code: 400,
        message: "流程已结束",
      });
    }

    const workflow = instance.workflowId;
    const currentNode = workflow.nodes.find(
      (node) => node.id === instance.currentNodeId
    );

    if (!currentNode) {
      return res.status(400).json({
        code: 400,
        message: "当前节点不存在",
      });
    }

    let newStatus = instance.status;
    let nextNodeId = instance.currentNodeId;

    if (action === "reject") {
      newStatus = "rejected";
    } else {
      if (currentNode.type === "end") {
        newStatus = "completed";
      } else if (currentNode.nextNodes && currentNode.nextNodes.length > 0) {
        nextNodeId = currentNode.nextNodes[0];
      } else {
        newStatus = "completed";
      }
    }

    const historyItem = {
      nodeId: currentNode.id,
      nodeTitle: currentNode.title,
      action,
      operator: operatorId,
      comment: comment || "",
      timestamp: Date.now(),
    };

    await WorkflowInstance.findByIdAndUpdate(instanceId, {
      status: newStatus,
      currentNodeId: nextNodeId,
      $push: { history: historyItem },
    });

    res.json({
      code: 200,
      message: action === "approve" ? "审批通过" : "已拒绝",
      data: { status: newStatus },
    });
  } catch (error) {
    console.error("Approve workflow error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取流程实例列表
export const getWorkflowInstances = async (req, res) => {
  try {
    const { status, workflowId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (workflowId) query.workflowId = workflowId;

    const instances = await WorkflowInstance.find(query)
      .populate("workflowId", "name")
      .populate("formDataId", "createdAt")
      .populate("history.operator", "username nickname")
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: instances,
    });
  } catch (error) {
    console.error("Get workflow instances error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 获取用户待审批列表
export const getMyApprovalList = async (req, res) => {
  try {
    const userId = req.user._id;

    const instances = await WorkflowInstance.find({
      status: "running",
    })
      .populate("workflowId")
      .populate("formDataId");

    const myApprovals = [];

    for (const instance of instances) {
      const workflow = instance.workflowId;
      const currentNode = workflow.nodes.find(
        (node) => node.id === instance.currentNodeId
      );

      if (!currentNode || currentNode.type !== "approval") continue;

      const canApprove = await checkUserCanApprove(userId, currentNode);
      if (canApprove) {
        myApprovals.push(instance);
      }
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: myApprovals,
    });
  } catch (error) {
    console.error("Get my approval list error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};

// 检查用户是否可以审批
const checkUserCanApprove = async (userId, node) => {
  try {
    const userIdStr = String(userId);

    if (node.assigneeType === "user") {
      return node.assignees.includes(userIdStr);
    }

    if (node.assigneeType === "role") {
      for (const roleId of node.assignees) {
        const role = await Role.findById(roleId).populate("users");
        if (role && role.users.some((user) => String(user._id) === userIdStr)) {
          return true;
        }
      }
    }

    if (node.assigneeType === "department") {
      for (const deptId of node.assignees) {
        const member = await DepartmentMember.findOne({
          departmentId: deptId,
          userId,
        });
        if (member) return true;
      }
    }

    if (node.assigneeType === "leader") {
      const member = await DepartmentMember.findOne({ userId });
      if (member) {
        const dept = await Form.findById(member.departmentId);
        if (dept && String(dept.leaderId) === userIdStr) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Check user can approve error:", error);
    return false;
  }
};

// 获取流程实例详情
export const getWorkflowInstance = async (req, res) => {
  try {
    const instance = await WorkflowInstance.findById(req.params.id)
      .populate("workflowId")
      .populate("formDataId")
      .populate("history.operator", "username nickname");

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "流程实例不存在",
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: instance,
    });
  } catch (error) {
    console.error("Get workflow instance error:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
      error: error.message,
    });
  }
};