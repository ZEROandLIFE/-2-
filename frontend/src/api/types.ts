export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export type FieldWidth = "1/4" | "1/3" | "1/2" | "2/3" | "3/4" | "full";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  type: string;
  title: string;
  fieldKey: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  required: boolean;
  unique: boolean;
  visible: boolean;
  editable: boolean;
  width: FieldWidth;
  options: FieldOption[];
  validation?: Record<string, unknown>;
  props?: Record<string, unknown>;
  sortOrder: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  maxFileSize?: number;
  acceptTypes?: string[];
  dateFormat?: string;
}

export interface Form {
  _id: string;
  name: string;
  type: "normal" | "workflow";
  applicationId: string;
  description?: string;
  fields: FieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  _id: string;
  formId: string;
  applicationId: string;
  data: Record<string, unknown>;
  submitter: string;
  submitTime: string;
  updateTime: string;
  status: "draft" | "submitted" | "approved" | "rejected";
}

export interface CreateFormRequest {
  name: string;
  type?: "normal" | "workflow";
  applicationId: string;
  description?: string;
}

export interface UpdateFormRequest {
  name?: string;
  description?: string;
  fields?: FieldConfig[];
}

export interface FieldType {
  name: string;
  type: string;
  icon: string;
  description: string;
}

export interface FieldCategory {
  category: string;
  types: FieldType[];
}
