import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const MemberCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create title="新增" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
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
        <Form.Item
          label="狀態"
          name="status"
          initialValue="啟用"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "啟用", value: "啟用" },
              { label: "停用", value: "停用" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="註冊日"
          name="createdAt"
          initialValue="2026-10-29"
          rules={[{ required: true }]}
        >
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Create>
  );
};
