import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { FAQ_CATEGORIES } from "../../data/seed";

export const FaqEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit title="編輯" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="分類" name="category" rules={[{ required: true }]}>
          <Select
            options={FAQ_CATEGORIES.map((value) => ({ label: value, value }))}
          />
        </Form.Item>
        <Form.Item label="問題" name="question" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="回答" name="answer" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="排序" name="sort" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
