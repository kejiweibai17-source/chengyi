import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title, Text } = Typography;

export const CategoryShow = () => {
  const { query, result: record } = useShow();

  return (
    <Show title="詳情" isLoading={query.isLoading}>
      <Title level={5}>排序</Title>
      <Text>{record?.sort as number}</Text>
      <Title level={5}>分類名稱</Title>
      <Text>{record?.name as string}</Text>
      <Title level={5}>說明</Title>
      <Text>{(record?.description as string) || "-"}</Text>
    </Show>
  );
};
