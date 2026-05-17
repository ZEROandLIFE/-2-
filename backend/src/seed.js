import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Widget from './models/Widget.js';
import WidgetCategory from './models/WidgetCategory.js';

dotenv.config();

const categories = [
  { name: '基础组件', icon: '📦', order: 1 },
  { name: '布局组件', icon: '📐', order: 2 },
  { name: '数据组件', icon: '📊', order: 3 },
  { name: '高级组件', icon: '✨', order: 4 },
];

const widgets = [
  {
    name: '文本框',
    category: '基础组件',
    icon: '📝',
    description: '单行文本输入框，用于收集用户输入的简短文本',
    props: {
      placeholder: '请输入文本',
      maxlength: 100,
      disabled: false,
    },
    defaultStyle: {
      width: '200px',
      height: '40px',
      fontSize: '14px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '多行文本',
    category: '基础组件',
    icon: '📄',
    description: '多行文本输入框，用于收集用户输入的长文本',
    props: {
      placeholder: '请输入文本',
      rows: 4,
      maxlength: 500,
      disabled: false,
    },
    defaultStyle: {
      width: '300px',
      height: '120px',
      fontSize: '14px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '按钮',
    category: '基础组件',
    icon: '🔘',
    description: '可点击的按钮，用于触发操作',
    props: {
      text: '按钮',
      type: 'primary',
      disabled: false,
    },
    defaultStyle: {
      width: '120px',
      height: '40px',
      fontSize: '14px',
      borderRadius: '8px',
      backgroundColor: '#769fcd',
      color: '#ffffff',
    },
    isSystem: true,
  },
  {
    name: '选择器',
    category: '基础组件',
    icon: '📋',
    description: '下拉选择框，用于从多个选项中选择',
    props: {
      placeholder: '请选择',
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
        { label: '选项三', value: '3' },
      ],
      disabled: false,
    },
    defaultStyle: {
      width: '200px',
      height: '40px',
      fontSize: '14px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '开关',
    category: '基础组件',
    icon: '🔃',
    description: '开关切换，用于开启或关闭某个功能',
    props: {
      checked: false,
      disabled: false,
    },
    defaultStyle: {
      width: '50px',
      height: '26px',
      borderRadius: '13px',
    },
    isSystem: true,
  },
  {
    name: '复选框',
    category: '基础组件',
    icon: '☑️',
    description: '复选框，用于多选',
    props: {
      checked: false,
      label: '同意协议',
      disabled: false,
    },
    defaultStyle: {
      fontSize: '14px',
    },
    isSystem: true,
  },
  {
    name: '单选框',
    category: '基础组件',
    icon: '⭕',
    description: '单选框，用于单选',
    props: {
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
      ],
      value: '1',
      disabled: false,
    },
    defaultStyle: {
      fontSize: '14px',
    },
    isSystem: true,
  },
  {
    name: '日期选择器',
    category: '基础组件',
    icon: '📅',
    description: '日期选择器，用于选择日期',
    props: {
      placeholder: '请选择日期',
      disabled: false,
    },
    defaultStyle: {
      width: '200px',
      height: '40px',
      fontSize: '14px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '容器',
    category: '布局组件',
    icon: '📦',
    description: '基础容器组件，用于包裹其他组件',
    props: {
      padding: 16,
    },
    defaultStyle: {
      width: '100%',
      minHeight: '100px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e8eef3',
    },
    isSystem: true,
  },
  {
    name: '卡片',
    category: '布局组件',
    icon: '🃏',
    description: '卡片组件，用于展示信息',
    props: {
      title: '卡片标题',
      content: '卡片内容',
    },
    defaultStyle: {
      width: '300px',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    isSystem: true,
  },
  {
    name: '分割线',
    category: '布局组件',
    icon: '➖',
    description: '水平分割线，用于分隔内容',
    props: {
      orientation: 'center',
      type: 'solid',
    },
    defaultStyle: {
      width: '100%',
      height: '1px',
      backgroundColor: '#e8eef3',
      margin: '16px 0',
    },
    isSystem: true,
  },
  {
    name: '栅格',
    category: '布局组件',
    icon: '🔲',
    description: '响应式栅格布局',
    props: {
      columns: 3,
      gap: 16,
    },
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
    },
    isSystem: true,
  },
  {
    name: 'Flex布局',
    category: '布局组件',
    icon: '🔳',
    description: '弹性盒布局',
    props: {
      direction: 'row',
      justify: 'flex-start',
      align: 'center',
      gap: 12,
    },
    defaultStyle: {
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
    },
    isSystem: true,
  },
  {
    name: 'Tabs标签页',
    category: '高级组件',
    icon: '📑',
    description: '标签页组件，用于切换内容',
    props: {
      tabs: [
        { title: '标签一', key: 'tab1' },
        { title: '标签二', key: 'tab2' },
        { title: '标签三', key: 'tab3' },
      ],
      activeTab: 'tab1',
    },
    defaultStyle: {
      width: '100%',
    },
    isSystem: true,
  },
  {
    name: '对话框',
    category: '高级组件',
    icon: '📬',
    description: '模态对话框，用于弹窗展示',
    props: {
      title: '对话框标题',
      content: '对话框内容',
      visible: false,
      width: '500px',
    },
    defaultStyle: {
      borderRadius: '12px',
    },
    isSystem: true,
  },
  {
    name: '时间线',
    category: '高级组件',
    icon: '⏱️',
    description: '时间线组件，用于展示时间节点',
    props: {
      items: [
        { time: '2024-01-01', content: '第一步' },
        { time: '2024-02-01', content: '第二步' },
        { time: '2024-03-01', content: '第三步' },
      ],
    },
    defaultStyle: {
      width: '100%',
    },
    isSystem: true,
  },
  {
    name: '警告提示',
    category: '高级组件',
    icon: '⚠️',
    description: '警告提示组件，用于展示重要信息',
    props: {
      type: 'info',
      message: '这是一条提示信息',
      closable: true,
    },
    defaultStyle: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '头像',
    category: '基础组件',
    icon: '👤',
    description: '用户头像展示',
    props: {
      src: '',
      size: 'medium',
      shape: 'circle',
    },
    defaultStyle: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
    },
    isSystem: true,
  },
  {
    name: '标签',
    category: '基础组件',
    icon: '🏷️',
    description: '标签组件，用于标记和分类',
    props: {
      text: '标签',
      color: '#769fcd',
      closable: false,
    },
    defaultStyle: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
    },
    isSystem: true,
  },
  {
    name: '进度条',
    category: '数据组件',
    icon: '📊',
    description: '进度展示组件',
    props: {
      percent: 50,
      showText: true,
      status: 'normal',
    },
    defaultStyle: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
    },
    isSystem: true,
  },
  {
    name: '图片',
    category: '基础组件',
    icon: '🖼️',
    description: '图片展示组件',
    props: {
      src: '',
      alt: '图片',
      fit: 'cover',
    },
    defaultStyle: {
      width: '200px',
      height: '150px',
      borderRadius: '8px',
    },
    isSystem: true,
  },
  {
    name: '链接',
    category: '基础组件',
    icon: '🔗',
    description: '超链接组件',
    props: {
      text: '链接文本',
      href: '#',
      target: '_blank',
    },
    defaultStyle: {
      color: '#769fcd',
      fontSize: '14px',
    },
    isSystem: true,
  },
  {
    name: '表格',
    category: '数据组件',
    icon: '📋',
    description: '数据表格组件',
    props: {
      columns: [
        { title: '姓名', dataIndex: 'name' },
        { title: '年龄', dataIndex: 'age' },
        { title: '地址', dataIndex: 'address' },
      ],
      dataSource: [
        { name: '张三', age: 25, address: '北京市' },
        { name: '李四', age: 30, address: '上海市' },
      ],
      bordered: true,
    },
    defaultStyle: {
      width: '100%',
    },
    isSystem: true,
  },
  {
    name: '列表',
    category: '数据组件',
    icon: '📝',
    description: '列表展示组件',
    props: {
      dataSource: [
        { title: '列表项一', description: '列表项描述' },
        { title: '列表项二', description: '列表项描述' },
      ],
      bordered: false,
    },
    defaultStyle: {
      width: '100%',
    },
    isSystem: true,
  },
  {
    name: '步骤条',
    category: '数据组件',
    icon: '📍',
    description: '步骤条组件，展示流程进度',
    props: {
      current: 1,
      items: [
        { title: '步骤一', description: '描述' },
        { title: '步骤二', description: '描述' },
        { title: '步骤三', description: '描述' },
      ],
    },
    defaultStyle: {
      width: '100%',
    },
    isSystem: true,
  },
];

async function seedWidgets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await WidgetCategory.deleteMany({});
    console.log('Cleared existing categories');

    await Widget.deleteMany({});
    console.log('Cleared existing widgets');

    const savedCategories = {};
    for (const cat of categories) {
      const category = new WidgetCategory(cat);
      await category.save();
      savedCategories[cat.name] = category._id;
      console.log(`Created category: ${cat.name}`);
    }

    for (const widget of widgets) {
      const widgetData = {
        ...widget,
        category: savedCategories[widget.category],
      };
      const newWidget = new Widget(widgetData);
      await newWidget.save();
      console.log(`Created widget: ${widget.name}`);
    }

    console.log('\nSeeding completed!');
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${widgets.length} widgets`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedWidgets();