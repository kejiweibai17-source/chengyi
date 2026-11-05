import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useMany } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const ProductList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "id", order: "asc" }] },
  });

  const categoryIds =
    tableProps.dataSource?.map((item) => item.categoryId).filter(Boolean) ?? [];

  const { result: categoriesData } = useMany({
    resource: "categories",
    ids: categoryIds,
    queryOptions: { enabled: categoryIds.length > 0 },
  });

  return (
    <List title="商品／價目" createButtonProps={{ children: "新增" }}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="商品名稱" />
        <Table.Column
          dataIndex="categoryId"
          title="分類"
          render={(value) =>
            categoriesData?.data?.find((item) => item.id === value)?.name ?? value
          }
        />
        <Table.Column
          dataIndex="basePrice"
          title="基本價"
          render={(value: number) => `NT$ ${Number(value).toLocaleString("zh-TW")}`}
        />
        <Table.Column dataIndex="unit" title="單位" />
        <Table.Column
          dataIndex="status"
          title="狀態"
          render={(value: string) => (
            <Tag color={value === "上架" ? "success" : "default"}>{value}</Tag>
          )}
        />
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
