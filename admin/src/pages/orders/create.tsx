import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import { ORDER_STATUSES } from "../../data/seed";

export const OrderCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create title="新增" saveButtonProps={{ ...saveButtonProps, children: "儲存" }}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="訂單編號" name="orderNo" rules={[{ required: true }]}>
          <Input placeholder="OY-20261029-010" />
        </Form.Item>
        <Form.Item label="會員" name="memberName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="品項" name="productName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="狀態"
          name="status"
          initialValue="待上傳"
          rules={[{ required: true }]}
        >
          <Select options={ORDER_STATUSES.map((value) => ({ label: value, value }))} />
        </Form.Item>
        <Form.Item label="金額" name="amount" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item label="更新時間" name="updatedAt" initialValue="2026-10-29 12:00">
          <Input />
        </Form.Item>
        <Form.Item label="備註" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Create>
  );
};
