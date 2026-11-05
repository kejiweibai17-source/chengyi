import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { FAQ_CATEGORIES } from "../../data/seed";

export const FaqCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create title="新增" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="分類"
          name="category"
          initialValue={FAQ_CATEGORIES[0]}
          rules={[{ required: true }]}
        >
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
        <Form.Item label="排序" name="sort" initialValue={1} rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>
      </Form>
    </Create>
  );
};
