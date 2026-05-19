import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { pageApi, type Page, type PageComponent } from "@/api/page";
import { widgetApi, type Widget } from "@/api/widget";
import { formApi } from "@/api/form";
import type { Form, FieldConfig, FieldWidth, ApiResponse } from "@/api/types";

export const useEditorStore = defineStore("editor", () => {
  const currentPage = ref<Page | null>(null);
  const currentForm = ref<Form | null>(null);
  const pages = ref<Page[]>([]);
  const forms = ref<Form[]>([]);
  const selectedComponentId = ref<string | null>(null);
  const selectedFieldId = ref<string | null>(null);
  const widgets = ref<Widget[]>([]);
  const isLoading = ref(false);

  const selectedComponent = computed(() => {
    if (!currentPage.value || !selectedComponentId.value) return null;
    return findComponentById(
      currentPage.value.components,
      selectedComponentId.value,
    );
  });

  const selectedField = computed(() => {
    if (!currentForm.value || !selectedFieldId.value) return null;
    return (
      currentForm.value.fields.find((f) => f.id === selectedFieldId.value) ||
      null
    );
  });

  const fieldWidthOptions: {
    value: FieldWidth;
    label: string;
    width: string;
  }[] = [
    { value: "1/4", label: "1/4", width: "25%" },
    { value: "1/3", label: "1/3", width: "33.33%" },
    { value: "1/2", label: "1/2", width: "50%" },
    { value: "2/3", label: "2/3", width: "66.66%" },
    { value: "3/4", label: "3/4", width: "75%" },
    { value: "full", label: "整行", width: "100%" },
  ];

  const fieldTypes = [
    {
      category: "常用",
      types: [
        {
          name: "单行文本",
          type: "text",
          icon: "📝",
          description: "普通文本输入",
        },
        {
          name: "多行文本",
          type: "textarea",
          icon: "📄",
          description: "长文本输入",
        },
        { name: "数字", type: "number", icon: "🔢", description: "数值输入" },
        {
          name: "日期时间",
          type: "datetime",
          icon: "📅",
          description: "日期时间选择",
        },
        {
          name: "单选按钮组",
          type: "radio",
          icon: "⚪",
          description: "单项选择",
        },
        {
          name: "复选框组",
          type: "checkbox",
          icon: "☑️",
          description: "多项选择",
        },
        { name: "下拉框", type: "select", icon: "📋", description: "下拉选择" },
        {
          name: "下拉复选框",
          type: "multiselect",
          icon: "📌",
          description: "多选下拉",
        },
      ],
    },
    {
      category: "高级",
      types: [
        { name: "图片", type: "image", icon: "🖼️", description: "图片上传" },
        { name: "文件", type: "file", icon: "📎", description: "文件上传" },
        { name: "地址", type: "address", icon: "📍", description: "地址选择" },
        { name: "定位", type: "location", icon: "🌍", description: "GPS定位" },
        {
          name: "子表单",
          type: "subform",
          icon: "📊",
          description: "嵌套表单",
        },
        {
          name: "选择数据",
          type: "lookup",
          icon: "🔍",
          description: "关联其他表单数据",
        },
        { name: "流水号", type: "serial", icon: "🔢", description: "自动编号" },
      ],
    },
  ];

  function findComponentById(
    components: PageComponent[],
    id: string,
  ): PageComponent | null {
    for (const component of components) {
      if (component.id === id) return component;
      if (component.children.length > 0) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const loadWidgets = async () => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.list()) as ApiResponse<Widget[]>;
      if (response.code === 200) {
        widgets.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadPage = async (pageId: string) => {
    isLoading.value = true;
    try {
      const response = (await pageApi.get(pageId)) as ApiResponse<Page>;
      if (response.code === 200) {
        currentPage.value = response.data;
        selectedComponentId.value = null;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadPagesByApp = async (appId: string) => {
    isLoading.value = true;
    try {
      const response = (await pageApi.list(appId)) as ApiResponse<Page[]>;
      if (response.code === 200) {
        pages.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createDefaultPage = async (appId: string) => {
    isLoading.value = true;
    try {
      const response = (await pageApi.create({
        name: "首页",
        applicationId: appId,
      })) as ApiResponse<Page>;
      if (response.code === 200) {
        currentPage.value = response.data;
        pages.value = [response.data];
        selectedComponentId.value = null;
        return response.data;
      }
      throw new Error(response.message || "创建失败");
    } finally {
      isLoading.value = false;
    }
  };

  const createPage = async (data: { name: string; applicationId: string }) => {
    isLoading.value = true;
    try {
      const response = (await pageApi.create(data)) as ApiResponse<Page>;
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || "创建失败");
    } finally {
      isLoading.value = false;
    }
  };

  const savePage = async () => {
    if (!currentPage.value) return;

    isLoading.value = true;
    try {
      const response = (await pageApi.update(currentPage.value._id, {
        name: currentPage.value.name,
        components: currentPage.value.components,
      })) as ApiResponse<Page>;
      if (response.code === 200) {
        currentPage.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const addComponent = (widget: Widget) => {
    if (!currentPage.value) return;

    const newComponent: PageComponent = {
      id: `component-${Date.now()}`,
      type: widget.name,
      props: { ...widget.props },
      style: {
        ...widget.defaultStyle,
        width: "100%",
      },
      children: [],
      position: { x: 100, y: 100 },
    };

    currentPage.value.components.push(newComponent);
    selectedComponentId.value = newComponent.id;
  };

  const updateComponent = (id: string, updates: Partial<PageComponent>) => {
    if (!currentPage.value) return;

    const component = findComponentById(currentPage.value.components, id);
    if (component) {
      Object.assign(component, updates);
    }
  };

  const deleteComponent = (id: string) => {
    if (!currentPage.value) return;

    const index = currentPage.value.components.findIndex((c) => c.id === id);
    if (index !== -1) {
      currentPage.value.components.splice(index, 1);
      if (selectedComponentId.value === id) {
        selectedComponentId.value = null;
      }
    }
  };

  const selectComponent = (id: string | null) => {
    selectedComponentId.value = id;
    selectedFieldId.value = null;
  };

  const clearSelection = () => {
    selectedComponentId.value = null;
    selectedFieldId.value = null;
  };

  const loadForm = async (formId: string) => {
    isLoading.value = true;
    try {
      const response = (await formApi.get(formId)) as ApiResponse<Form>;
      if (response.code === 200) {
        currentForm.value = response.data;
        selectedFieldId.value = null;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadFormsByApp = async (appId: string) => {
    isLoading.value = true;
    try {
      const response = (await formApi.list(appId)) as ApiResponse<Form[]>;
      if (response.code === 200) {
        forms.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createForm = async (data: { name: string; applicationId: string }) => {
    isLoading.value = true;
    try {
      const response = (await formApi.create({
        name: data.name,
        applicationId: data.applicationId,
        type: "normal",
      })) as ApiResponse<Form>;
      if (response.code === 200) {
        currentForm.value = response.data;
        return response.data;
      }
      throw new Error(response.message || "创建失败");
    } finally {
      isLoading.value = false;
    }
  };

  const saveForm = async () => {
    if (!currentForm.value) return;

    isLoading.value = true;
    try {
      const response = (await formApi.update(currentForm.value._id, {
        name: currentForm.value.name,
        description: currentForm.value.description,
        fields: currentForm.value.fields,
      })) as ApiResponse<Form>;
      if (response.code === 200) {
        currentForm.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const addField = (fieldType: string) => {
    if (!currentForm.value) return;

    const fieldInfo = fieldTypes
      .flatMap((cat) => cat.types)
      .find((t) => t.type === fieldType);
    const newField: FieldConfig = {
      id: `field-${Date.now()}`,
      type: fieldType,
      title: fieldInfo?.name || "未命名字段",
      fieldKey: `field_${Date.now()}`,
      description: "",
      placeholder: "",
      defaultValue: undefined,
      required: false,
      unique: false,
      visible: true,
      editable: true,
      width: "full",
      options: [],
      sortOrder: currentForm.value.fields.length,
    };

    currentForm.value.fields.push(newField);
    selectedFieldId.value = newField.id;
    return newField;
  };

  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    if (!currentForm.value) return;

    const field = currentForm.value.fields.find((f) => f.id === id);
    if (field) {
      Object.assign(field, updates);
    }
  };

  const deleteField = (id: string) => {
    if (!currentForm.value) return;

    const index = currentForm.value.fields.findIndex((f) => f.id === id);
    if (index !== -1) {
      currentForm.value.fields.splice(index, 1);
      currentForm.value.fields.forEach((f, i) => {
        f.sortOrder = i;
      });
      if (selectedFieldId.value === id) {
        selectedFieldId.value = null;
      }
    }
  };

  const selectField = (id: string | null) => {
    selectedFieldId.value = id;
    selectedComponentId.value = null;
  };

  const updateFieldWidth = (id: string, width: FieldWidth) => {
    updateField(id, { width });
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    if (!currentForm.value) return;

    const [removed] = currentForm.value.fields.splice(fromIndex, 1);
    currentForm.value.fields.splice(toIndex, 0, removed);
    currentForm.value.fields.forEach((f, i) => {
      f.sortOrder = i;
    });
  };

  return {
    currentPage,
    currentForm,
    pages,
    forms,
    selectedComponentId,
    selectedComponent,
    selectedFieldId,
    selectedField,
    widgets,
    isLoading,
    fieldWidthOptions,
    fieldTypes,
    loadWidgets,
    loadPage,
    loadPagesByApp,
    createDefaultPage,
    createPage,
    savePage,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    clearSelection,
    loadForm,
    loadFormsByApp,
    createForm,
    saveForm,
    addField,
    updateField,
    deleteField,
    selectField,
    updateFieldWidth,
    moveField,
  };
});
