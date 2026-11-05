import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table, Tag } from "antd";
import { FAQ_CATEGORIES } from "../../data/seed";

export const FaqList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        { field: "category", order: "asc" },
        { field: "sort", order: "asc" },
      ],
    },
  });

  return (
    <List title="FAQ" createButtonProps={{ children: "新增" }}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="category"
          title="分類"
          filters={FAQ_CATEGORIES.map((category) => ({
            text: category,
            value: category,
          }))}
          onFilter={(value, record) => record.category === value}
          render={(value: string) => <Tag>{value}</Tag>}
        />
        <Table.Column dataIndex="question" title="問題" />
        <Table.Column dataIndex="sort" title="排序" width={80} />
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
