import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table, Tag } from "antd";
import { ORDER_STATUSES } from "../../data/seed";

const statusColor: Record<string, string> = {
  待上傳: "default",
  待檢稿: "processing",
  待補件: "warning",
  確認可印製: "success",
  待付款: "default",
  已收款: "success",
  印製中: "processing",
  已出貨: "default",
};

export const OrderList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  return (
    <List title="訂單／檢稿" createButtonProps={{ children: "新增" }}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="orderNo" title="訂單編號" />
        <Table.Column dataIndex="memberName" title="會員" />
        <Table.Column dataIndex="productName" title="品項" />
        <Table.Column
          dataIndex="status"
          title="狀態"
          filters={ORDER_STATUSES.map((status) => ({
            text: status,
            value: status,
          }))}
          onFilter={(value, record) => record.status === value}
          render={(value: string) => <Tag color={statusColor[value]}>{value}</Tag>}
        />
        <Table.Column
          dataIndex="amount"
          title="金額"
          render={(value: number) => `NT$ ${Number(value).toLocaleString("zh-TW")}`}
        />
        <Table.Column dataIndex="updatedAt" title="更新時間" />
        <Table.Column
          title="操作"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
