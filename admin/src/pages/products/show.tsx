import { Show } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Tag, Typography } from "antd";

const { Title, Text } = Typography;

export const ProductShow = () => {
  const { query, result: record } = useShow();
  const { result: category } = useOne({
    resource: "categories",
    id: record?.categoryId as string | number,
    queryOptions: { enabled: !!record?.categoryId },
  });

  return (
    <Show title="詳情" isLoading={query.isLoading}>
      <Title level={5}>商品名稱</Title>
      <Text>{record?.name as string}</Text>
      <Title level={5}>分類</Title>
      <Text>{(category?.name as string) || String(record?.categoryId ?? "-")}</Text>
      <Title level={5}>基本價</Title>
      <Text>
        {record?.basePrice != null
          ? `NT$ ${Number(record.basePrice).toLocaleString("zh-TW")}`
          : "-"}
      </Text>
      <Title level={5}>單位</Title>
      <Text>{record?.unit as string}</Text>
      <Title level={5}>狀態</Title>
      <Tag color={record?.status === "上架" ? "success" : "default"}>
        {record?.status as string}
      </Tag>
      <Title level={5}>規格說明</Title>
      <Text>{(record?.specs as string) || "-"}</Text>
    </Show>
  );
};
