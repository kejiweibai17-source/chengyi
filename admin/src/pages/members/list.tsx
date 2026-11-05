import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table, Tag } from "antd";

export const MemberList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "id", order: "asc" }] },
  });

  return (
    <List title="會員" createButtonProps={{ children: "新增" }}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="姓名" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="phone" title="電話" />
        <Table.Column
          dataIndex="status"
          title="狀態"
          render={(value: string) => (
            <Tag color={value === "啟用" ? "success" : "default"}>{value}</Tag>
          )}
        />
        <Table.Column dataIndex="createdAt" title="註冊日" />
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
