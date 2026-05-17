import Application from "../models/Application.js";

export const createApplication = async (req, res) => {
  try {
    const { name, description, templateId } = req.body;
    const application = new Application({
      name,
      description,
      owner: req.user._id,
      templateId,
    });
    await application.save();
    res.status(201).json({
      code: 200,
      message: "应用创建成功",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "创建应用失败",
      data: null,
    });
  }
};

export const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const applications = await Application.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments({ owner: req.user._id });

    res.json({
      code: 200,
      message: "获取成功",
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取应用列表失败",
      data: null,
    });
  }
};

export const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        code: 404,
        message: "应用不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取应用失败",
      data: null,
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { name, description, status, templateId } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, description, status, templateId },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({
        code: 404,
        message: "应用不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "更新成功",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "更新应用失败",
      data: null,
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        code: 404,
        message: "应用不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "删除应用失败",
      data: null,
    });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      draft: 0,
      published: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.json({
      code: 200,
      message: "获取成功",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取统计数据失败",
      data: null,
    });
  }
};

export default {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
};
