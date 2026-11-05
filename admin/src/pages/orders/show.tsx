import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Tag, Typography } from "antd";

const { Title, Text } = Typography;

export const OrderShow = () => {
  const { query, result: record } = useShow();

  return (
    <Show title="詳情" isLoading={query.isLoading}>
      <Title level={5}>訂單編號</Title>
      <Text>{record?.orderNo as string}</Text>
      <Title level={5}>會員</Title>
      <Text>{record?.memberName as string}</Text>
      <Title level={5}>品項</Title>
      <Text>{record?.productName as string}</Text>
      <Title level={5}>狀態</Title>
      <Tag>{record?.status as string}</Tag>
      <Title level={5}>金額</Title>
      <Text>
        {record?.amount != null
          ? `NT$ ${Number(record.amount).toLocaleString("zh-TW")}`
          : "-"}
      </Text>
      <Title level={5}>更新時間</Title>
      <Text>{record?.updatedAt as string}</Text>
      <Title level={5}>備註</Title>
      <Text>{(record?.note as string) || "-"}</Text>
    </Show>
  );
};
