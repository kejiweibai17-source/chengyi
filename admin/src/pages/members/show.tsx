import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Tag, Typography } from "antd";

const { Title, Text } = Typography;

export const MemberShow = () => {
  const { query, result: record } = useShow();

  return (
    <Show title="詳情" isLoading={query.isLoading}>
      <Title level={5}>姓名</Title>
      <Text>{record?.name as string}</Text>
      <Title level={5}>Email</Title>
      <Text>{record?.email as string}</Text>
      <Title level={5}>電話</Title>
      <Text>{(record?.phone as string) || "-"}</Text>
      <Title level={5}>狀態</Title>
      <Tag color={record?.status === "啟用" ? "success" : "default"}>
        {record?.status as string}
      </Tag>
      <Title level={5}>註冊日</Title>
      <Text>{record?.createdAt as string}</Text>
    </Show>
  );
};
