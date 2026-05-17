const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Widget = require('../models/Widget');
const WidgetCategory = require('../models/WidgetCategory');

dotenv.config();

const categories = [
  { name: '基础组件', icon: '📦', order: 1 },
  { name: '布局组件', icon: '📐', order: 2 },
  { name: '数据组件', icon: '📊', order: 3 },
  { name: '高级组件', icon: '⚡', order: 4 }
];

const widgets = [
  {
    name: '文本',
    icon: '📝',
    description: '显示文本内容',
    props: {
      text: '这是一段文本',
      fontSize: '14px',
      color: '#333'
    },
    defaultStyle: {
      padding: '8px',
      borderRadius: '4px'
    },
    isSystem: true
  },
  {
    name: '按钮',
    icon: '🔘',
    description: '交互按钮',
    props: {
      label: '按钮',
      type: 'primary',
      size: 'medium'
    },
    defaultStyle: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer'
    },
    isSystem: true
  },
  {
    name: '输入框',
    icon: '✏️',
    description: '文本输入框',
    props: {
      placeholder: '请输入...',
      type: 'text'
    },
    defaultStyle: {
      padding: '10px 14px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      width: '200px'
    },
    isSystem: true
  },
  {
    name: '选择器',
    icon: '📋',
    description: '下拉选择框',
    props: {
      options: [],
      value: ''
    },
    defaultStyle: {
      padding: '10px 14px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      width: '200px'
    },
    isSystem: true
  },
  {
    name: '开关',
    icon: '🔌',
    description: '开关切换组件',
    props: {
      checked: false
    },
    defaultStyle: {
      width: '48px',
      height: '28px'
    },
    isSystem: true
  },
  {
    name: '容器',
    icon: '📦',
    description: '布局容器',
    props: {},
    defaultStyle: {
      padding: '20px',
      border: '1px dashed #ccc',
      borderRadius: '8px',
      minHeight: '100px'
    },
    isSystem: true
  },
  {
    name: '栅格',
    icon: '🧩',
    description: '网格布局',
    props: {
      columns: 12,
      gutter: 16
    },
    defaultStyle: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    isSystem: true
  },
  {
    name: '卡片',
    icon: '🃏',
    description: '卡片容器',
    props: {
      title: '',
      subtitle: ''
    },
    defaultStyle: {
      padding: '16px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    isSystem: true
  },
  {
    name: '分割线',
    icon: '➖',
    description: '水平分割线',
    props: {},
    defaultStyle: {
      height: '1px',
      backgroundColor: '#e8eef3',
      margin: '16px 0'
    },
    isSystem: true
  },
  {
    name: '表格',
    icon: '📊',
    description: '数据表格',
    props: {
      columns: [],
      data: []
    },
    defaultStyle: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    isSystem: true
  },
  {
    name: '列表',
    icon: '📝',
    description: '数据列表',
    props: {
      items: []
    },
    defaultStyle: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    isSystem: true
  },
  {
    name: '图表',
    icon: '📈',
    description: '数据图表',
    props: {
      type: 'bar',
      data: []
    },
    defaultStyle: {
      width: '100%',
      height: '300px'
    },
    isSystem: true
  },
  {
    name: '表单',
    icon: '📋',
    description: '表单容器',
    props: {
      fields: [],
      model: {}
    },
    defaultStyle: {
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px'
    },
    isSystem: true
  },
  {
    name: '弹窗',
    icon: '💬',
    description: '模态弹窗',
    props: {
      title: '',
      visible: false
    },
    defaultStyle: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      zIndex: '1000'
    },
    isSystem: true
  },
  {
    name: '标签页',
    icon: '📑',
    description: '标签切换',
    props: {
      tabs: [],
      activeTab: 0
    },
    defaultStyle: {},
    isSystem: true
  },
  {
    name: '时间线',
    icon: '⏱️',
    description: '时间线展示',
    props: {
      items: []
    },
    defaultStyle: {},
    isSystem: true
  }
];

async function init() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await WidgetCategory.deleteMany({});
    await Widget.deleteMany({});

    const categoryDocs = await WidgetCategory.insertMany(categories);
    
    const categoryMap = new Map(categoryDocs.map(c => [c.name, c._id]));
    
    const widgetsWithCategory = widgets.map((widget, index) => {
      let categoryName = '基础组件';
      if (index >= 0 && index <= 4) categoryName = '基础组件';
      else if (index >= 5 && index <= 8) categoryName = '布局组件';
      else if (index >= 9 && index <= 11) categoryName = '数据组件';
      else categoryName = '高级组件';
      
      return {
        ...widget,
        category: categoryMap.get(categoryName)
      };
    });

    await Widget.insertMany(widgetsWithCategory);
    console.log('Widgets initialized successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing widgets:', error);
    process.exit(1);
  }
}

init();