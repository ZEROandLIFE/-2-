import Page from "../models/Page.js";
import Application from "../models/Application.js";

export const createPage = async (req, res) => {
  try {
    const { name, applicationId } = req.body;

    const app = await Application.findOne({
      _id: applicationId,
      owner: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        code: 404,
        message: "应用不存在",
        data: null,
      });
    }

    const page = new Page({
      name,
      applicationId,
      components: [],
    });

    await page.save();

    res.status(201).json({
      code: 200,
      message: "页面创建成功",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "创建页面失败",
      data: null,
    });
  }
};

export const getPages = async (req, res) => {
  try {
    const { applicationId } = req.query;

    if (!applicationId) {
      return res.status(400).json({
        code: 400,
        message: "缺少应用ID",
        data: null,
      });
    }

    const app = await Application.findOne({
      _id: applicationId,
      owner: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        code: 404,
        message: "应用不存在",
        data: null,
      });
    }

    const pages = await Page.find({ applicationId }).sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取页面列表失败",
      data: null,
    });
  }
};

export const getPage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        code: 404,
        message: "页面不存在",
        data: null,
      });
    }

    const app = await Application.findOne({
      _id: page.applicationId,
      owner: req.user._id,
    });

    if (!app) {
      return res.status(403).json({
        code: 403,
        message: "无权访问",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取页面失败",
      data: null,
    });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, components } = req.body;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        code: 404,
        message: "页面不存在",
        data: null,
      });
    }

    const app = await Application.findOne({
      _id: page.applicationId,
      owner: req.user._id,
    });

    if (!app) {
      return res.status(403).json({
        code: 403,
        message: "无权访问",
        data: null,
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (components !== undefined) updateData.components = components;

    const updatedPage = await Page.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({
      code: 200,
      message: "更新成功",
      data: updatedPage,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "更新页面失败",
      data: null,
    });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        code: 404,
        message: "页面不存在",
        data: null,
      });
    }

    const app = await Application.findOne({
      _id: page.applicationId,
      owner: req.user._id,
    });

    if (!app) {
      return res.status(403).json({
        code: 403,
        message: "无权访问",
        data: null,
      });
    }

    await Page.findByIdAndDelete(id);

    res.json({
      code: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "删除页面失败",
      data: null,
    });
  }
};

export default {
  createPage,
  getPages,
  getPage,
  updatePage,
  deletePage,
};
