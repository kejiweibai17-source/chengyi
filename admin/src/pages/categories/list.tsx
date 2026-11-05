import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table } from "antd";

export const CategoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "sort", order: "asc" }] },
  });

  return (
    <List title="分類" createButtonProps={{ children: "新增" }}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="sort" title="排序" width={80} />
        <Table.Column dataIndex="name" title="分類名稱" />
        <Table.Column dataIndex="description" title="說明" />
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
