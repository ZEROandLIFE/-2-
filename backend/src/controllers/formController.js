import Form from '../models/Form.js';
import FormData from '../models/FormData.js';

export const createForm = async (req, res) => {
  try {
    const { name, type = 'normal', applicationId, description } = req.body;
    
    const form = new Form({
      name,
      type,
      applicationId,
      description,
      fields: [],
    });
    
    await form.save();
    
    res.status(200).json({
      code: 200,
      message: '创建成功',
      data: form,
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({
      code: 500,
      message: '创建失败',
      data: null,
    });
  }
};

export const getForms = async (req, res) => {
  try {
    const { applicationId } = req.query;
    
    let query = {};
    if (applicationId) {
      query.applicationId = applicationId;
    }
    
    const forms = await Form.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      code: 200,
      message: '查询成功',
      data: forms,
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null,
    });
  }
};

export const getForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({
        code: 404,
        message: '表单不存在',
        data: null,
      });
    }
    
    res.status(200).json({
      code: 200,
      message: '查询成功',
      data: form,
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null,
    });
  }
};

export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, fields } = req.body;
    
    const form = await Form.findByIdAndUpdate(
      id,
      { name, description, fields },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({
        code: 404,
        message: '表单不存在',
        data: null,
      });
    }
    
    res.status(200).json({
      code: 200,
      message: '更新成功',
      data: form,
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败',
      data: null,
    });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await Form.findByIdAndDelete(id);
    
    if (!form) {
      return res.status(404).json({
        code: 404,
        message: '表单不存在',
        data: null,
      });
    }
    
    await FormData.deleteMany({ formId: id });
    
    res.status(200).json({
      code: 200,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      data: null,
    });
  }
};

export const createFormData = async (req, res) => {
  try {
    const { formId } = req.params;
    const data = req.body.data || req.body;
    const userId = req.user?._id;
    
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({
        code: 404,
        message: '表单不存在',
        data: null,
      });
    }
    
    const formData = new FormData({
      formId,
      applicationId: form.applicationId,
      data,
      submitter: userId || null,
      status: 'submitted',
    });
    
    await formData.save();
    
    res.status(200).json({
      code: 200,
      message: '提交成功',
      data: formData,
    });
  } catch (error) {
    console.error('Create form data error:', error);
    res.status(500).json({
      code: 500,
      message: '提交失败',
      data: null,
    });
  }
};

export const getFormDataList = async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({
        code: 404,
        message: '表单不存在',
        data: null,
      });
    }
    
    const skip = (page - 1) * limit;
    const formDataList = await FormData.find({ formId })
      .sort({ submitTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await FormData.countDocuments({ formId });
    
    res.status(200).json({
      code: 200,
      message: '查询成功',
      data: formDataList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get form data list error:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null,
    });
  }
};

export const getFormData = async (req, res) => {
  try {
    const { formId, dataId } = req.params;
    
    const formData = await FormData.findOne({ _id: dataId, formId });
    
    if (!formData) {
      return res.status(404).json({
        code: 404,
        message: '数据不存在',
        data: null,
      });
    }
    
    res.status(200).json({
      code: 200,
      message: '查询成功',
      data: formData,
    });
  } catch (error) {
    console.error('Get form data error:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      data: null,
    });
  }
};

export const updateFormData = async (req, res) => {
  try {
    const { formId, dataId } = req.params;
    const { data } = req.body;
    
    const formData = await FormData.findOneAndUpdate(
      { _id: dataId, formId },
      { data },
      { new: true }
    );
    
    if (!formData) {
      return res.status(404).json({
        code: 404,
        message: '数据不存在',
        data: null,
      });
    }
    
    res.status(200).json({
      code: 200,
      message: '更新成功',
      data: formData,
    });
  } catch (error) {
    console.error('Update form data error:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败',
      data: null,
    });
  }
};

export const deleteFormData = async (req, res) => {
  try {
    const { formId, dataId } = req.params;
    
    const formData = await FormData.findOneAndDelete({ _id: dataId, formId });
    
    if (!formData) {
      return res.status(404).json({
        code: 404,
        message: '数据不存在',
        data: null,
      });
    }
    
    res.status(200).json({
      code: 200,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    console.error('Delete form data error:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      data: null,
    });
  }
};