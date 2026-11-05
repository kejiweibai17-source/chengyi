import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";

export const ProductCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create title="新增" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="商品名稱" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="分類" name="categoryId" rules={[{ required: true }]}>
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item label="基本價" name="basePrice" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item label="單位" name="unit" rules={[{ required: true }]}>
          <Input placeholder="盒／100 張" />
        </Form.Item>
        <Form.Item
          label="狀態"
          name="status"
          initialValue="上架"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "上架", value: "上架" },
              { label: "下架", value: "下架" },
            ]}
          />
        </Form.Item>
        <Form.Item label="規格說明" name="specs">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Create>
  );
};
