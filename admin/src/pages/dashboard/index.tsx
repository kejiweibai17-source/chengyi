import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Col, List as AntList, Row, Space, Table, Tag, Typography } from "antd";

const { Text, Title } = Typography;

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

export const DashboardPage = () => {
  const { result: ordersResult } = useList({
    resource: "orders",
    pagination: { pageSize: 50 },
  });
  const { result: faqResult } = useList({
    resource: "faq",
    pagination: { pageSize: 50 },
  });
  const { result: membersResult } = useList({
    resource: "members",
    pagination: { pageSize: 50 },
  });
  const { result: productsResult } = useList({
    resource: "products",
    pagination: { pageSize: 50 },
  });

  const orders = ordersResult?.data ?? [];
  const pendingProof = orders.filter((item) => item.status === "待檢稿").length;
  const awaitingPayment = orders.filter((item) => item.status === "待付款").length;
  const printing = orders.filter((item) => item.status === "印製中").length;
  const activeMembers = (membersResult?.data ?? []).filter(
    (item) => item.status === "啟用",
  ).length;

  const stats = [
    {
      title: "待檢稿",
      value: pendingProof,
      hint: "需員工處理",
      icon: <FileSearchOutlined />,
    },
    {
      title: "待確認收款",
      value: awaitingPayment,
      hint: "轉帳核對",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "印製中",
      value: printing,
      hint: "產線進行中",
      icon: <ShoppingOutlined />,
    },
    {
      title: "FAQ 筆數",
      value: faqResult?.data?.length ?? 0,
      hint: `啟用會員 ${activeMembers}／商品 ${productsResult?.data?.length ?? 0}`,
      icon: <CheckCircleOutlined />,
    },
  ];

  const todos = orders
    .filter((item) =>
      ["待檢稿", "待補件", "待付款"].includes(String(item.status)),
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      tag: String(item.status),
      text: `${item.orderNo}｜${item.memberName}`,
    }));

  return (
    <div>
      <div className="dashboard-hero">
        <Title level={2} style={{ margin: 0, fontSize: 26 }}>
          橙益印刷｜營運總覽
        </Title>
        <p>黑白灰 Demo 儀表板，資料來自本機示意資料，可於各選單新增／編輯／刪除。</p>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card variant="borderless" style={{ borderRadius: 8 }}>
              <Space align="start" size={14}>
                <div className="stat-icon">{item.icon}</div>
                <div>
                  <Text type="secondary">{item.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 650, lineHeight: 1.2 }}>
                    {item.value}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.hint}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={15}>
          <Card
            title="近期訂單"
            variant="borderless"
            style={{ borderRadius: 8 }}
            extra={<Text type="secondary">可至「訂單／檢稿」操作</Text>}
          >
            <Table
              rowKey="id"
              dataSource={orders.slice(0, 6)}
              pagination={false}
              size="middle"
              columns={[
                { title: "訂單編號", dataIndex: "orderNo" },
                { title: "會員", dataIndex: "memberName" },
                { title: "品項", dataIndex: "productName" },
                {
                  title: "狀態",
                  dataIndex: "status",
                  render: (status: string) => (
                    <Tag color={statusColor[status] ?? "default"}>{status}</Tag>
                  ),
                },
                {
                  title: "金額",
                  dataIndex: "amount",
                  align: "right",
                  render: (amount: number) =>
                    `NT$ ${Number(amount).toLocaleString("zh-TW")}`,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title="待處理"
            variant="borderless"
            style={{ borderRadius: 8, height: "100%" }}
          >
            <AntList
              dataSource={todos}
              locale={{ emptyText: "目前沒有待處理訂單" }}
              renderItem={(item) => (
                <AntList.Item>
                  <Space>
                    <Tag>{item.tag}</Tag>
                    <Text>{item.text}</Text>
                  </Space>
                </AntList.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
