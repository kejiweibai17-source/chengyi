import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";

export const CategoryEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit title="編輯" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="分類名稱" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="排序" name="sort" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>
        <Form.Item label="說明" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
