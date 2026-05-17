import Widget from "../models/Widget.js";
import WidgetCategory from "../models/WidgetCategory.js";

export const getWidgets = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let query = {};
    if (categoryId) {
      query.category = categoryId;
    }

    const widgets = await Widget.find(query).populate("category");

    res.json({
      code: 200,
      message: "获取成功",
      data: widgets,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取组件列表失败",
      data: null,
    });
  }
};

export const searchWidgets = async (req, res) => {
  try {
    const { keyword, categoryId } = req.query;

    let query = {};

    if (categoryId) {
      query.category = categoryId;
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const widgets = await Widget.find(query).populate("category");

    res.json({
      code: 200,
      message: "搜索成功",
      data: widgets,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "搜索组件失败",
      data: null,
    });
  }
};

export const getWidget = async (req, res) => {
  try {
    const { id } = req.params;

    const widget = await Widget.findById(id).populate("category");

    if (!widget) {
      return res.status(404).json({
        code: 404,
        message: "组件不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: widget,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取组件失败",
      data: null,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await WidgetCategory.find().sort({ order: 1 });

    res.json({
      code: 200,
      message: "获取成功",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "获取分类失败",
      data: null,
    });
  }
};

export const createWidget = async (req, res) => {
  try {
    const { name, category, icon, description, props, defaultStyle, preview } =
      req.body;

    const widget = new Widget({
      name,
      category,
      icon,
      description,
      props: props || {},
      defaultStyle: defaultStyle || {},
      preview,
    });

    await widget.save();
    await widget.populate("category");

    res.status(201).json({
      code: 200,
      message: "组件创建成功",
      data: widget,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "创建组件失败",
      data: null,
    });
  }
};

export const updateWidget = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, icon, description, props, defaultStyle, preview } =
      req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (props !== undefined) updateData.props = props;
    if (defaultStyle !== undefined) updateData.defaultStyle = defaultStyle;
    if (preview !== undefined) updateData.preview = preview;

    const widget = await Widget.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("category");

    if (!widget) {
      return res.status(404).json({
        code: 404,
        message: "组件不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "更新成功",
      data: widget,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "更新组件失败",
      data: null,
    });
  }
};

export const deleteWidget = async (req, res) => {
  try {
    const { id } = req.params;

    const widget = await Widget.findByIdAndDelete(id);

    if (!widget) {
      return res.status(404).json({
        code: 404,
        message: "组件不存在",
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
      message: "删除组件失败",
      data: null,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, order } = req.body;

    const category = new WidgetCategory({
      name,
      icon,
      order: order || 0,
    });

    await category.save();

    res.status(201).json({
      code: 200,
      message: "分类创建成功",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "创建分类失败",
      data: null,
    });
  }
};

export const exportWidgets = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let query = {};
    if (categoryId) {
      query.category = categoryId;
    }

    const widgets = await Widget.find(query).populate("category");

    const exportData = {
      version: "1.0",
      exportTime: new Date().toISOString(),
      widgets: widgets.map((w) => ({
        name: w.name,
        category: w.category?.name,
        icon: w.icon,
        description: w.description,
        props: w.props,
        defaultStyle: w.defaultStyle,
        preview: w.preview,
        isSystem: w.isSystem,
      })),
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=widgets-${Date.now()}.json`,
    );
    res.json({
      code: 200,
      message: "导出成功",
      data: exportData,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "导出组件失败",
      data: null,
    });
  }
};

export const importWidgets = async (req, res) => {
  try {
    const { widgets } = req.body;

    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({
        code: 400,
        message: "无效的导入数据",
        data: null,
      });
    }

    const importedCount = 0;
    const skippedCount = 0;

    for (const widgetData of widgets) {
      const existingWidget = await Widget.findOne({ name: widgetData.name });

      if (existingWidget) {
        skippedCount++;
        continue;
      }

      let categoryId = null;
      if (widgetData.category) {
        let category = await WidgetCategory.findOne({
          name: widgetData.category,
        });
        if (!category) {
          category = new WidgetCategory({
            name: widgetData.category,
            icon: "📦",
          });
          await category.save();
        }
        categoryId = category._id;
      }

      const widget = new Widget({
        name: widgetData.name,
        category: categoryId,
        icon: widgetData.icon,
        description: widgetData.description,
        props: widgetData.props || {},
        defaultStyle: widgetData.defaultStyle || {},
        preview: widgetData.preview,
        isSystem: widgetData.isSystem || false,
      });

      await widget.save();
      importedCount++;
    }

    res.json({
      code: 200,
      message: `导入完成，成功导入 ${importedCount} 个组件，跳过 ${skippedCount} 个重复组件`,
      data: { importedCount, skippedCount },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "导入组件失败",
      data: null,
    });
  }
};

export default {
  getWidgets,
  getWidget,
  searchWidgets,
  getCategories,
  createWidget,
  updateWidget,
  deleteWidget,
  createCategory,
  exportWidgets,
  importWidgets,
};
