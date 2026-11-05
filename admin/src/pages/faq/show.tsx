import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Tag, Typography } from "antd";

const { Title, Text } = Typography;

export const FaqShow = () => {
  const { query, result: record } = useShow();

  return (
    <Show title="詳情" isLoading={query.isLoading}>
      <Title level={5}>分類</Title>
      <Tag>{record?.category as string}</Tag>
      <Title level={5}>問題</Title>
      <Text>{record?.question as string}</Text>
      <Title level={5}>回答</Title>
      <Text>{record?.answer as string}</Text>
      <Title level={5}>排序</Title>
      <Text>{record?.sort as number}</Text>
    </Show>
  );
};
