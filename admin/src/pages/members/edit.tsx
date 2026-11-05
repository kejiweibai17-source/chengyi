import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const MemberEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit title="編輯" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="電話" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="狀態" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "啟用", value: "啟用" },
              { label: "停用", value: "停用" },
            ]}
          />
        </Form.Item>
        <Form.Item label="註冊日" name="createdAt" rules={[{ required: true }]}>
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
