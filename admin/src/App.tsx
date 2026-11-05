import {
  DashboardOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ErrorComponent,
  ThemedLayout,
  ThemedTitle,
  useNotificationProvider,
} from "@refinedev/antd";
import { Refine } from "@refinedev/core";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import zhTW from "antd/locale/zh_TW";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { DashboardPage } from "./pages/dashboard";
import { CategoryCreate } from "./pages/categories/create";
import { CategoryEdit } from "./pages/categories/edit";
import { CategoryList } from "./pages/categories/list";
import { CategoryShow } from "./pages/categories/show";
import { FaqCreate } from "./pages/faq/create";
import { FaqEdit } from "./pages/faq/edit";
import { FaqList } from "./pages/faq/list";
import { FaqShow } from "./pages/faq/show";
import { MemberCreate } from "./pages/members/create";
import { MemberEdit } from "./pages/members/edit";
import { MemberList } from "./pages/members/list";
import { MemberShow } from "./pages/members/show";
import { OrderCreate } from "./pages/orders/create";
import { OrderEdit } from "./pages/orders/edit";
import { OrderList } from "./pages/orders/list";
import { OrderShow } from "./pages/orders/show";
import { ProductCreate } from "./pages/products/create";
import { ProductEdit } from "./pages/products/edit";
import { ProductList } from "./pages/products/list";
import { ProductShow } from "./pages/products/show";
import { memoryDataProvider } from "./providers/memoryDataProvider";
import "@refinedev/antd/dist/reset.css";

function RefineRoot() {
  const notificationProvider = useNotificationProvider();

  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={memoryDataProvider}
      notificationProvider={notificationProvider}
      resources={[
        {
          name: "dashboard",
          list: "/",
          meta: {
            label: "總覽",
            icon: <DashboardOutlined />,
          },
        },
        {
          name: "orders",
          list: "/orders",
          create: "/orders/create",
          edit: "/orders/edit/:id",
          show: "/orders/show/:id",
          meta: {
            label: "訂單／檢稿",
            icon: <FileTextOutlined />,
          },
        },
        {
          name: "products",
          list: "/products",
          create: "/products/create",
          edit: "/products/edit/:id",
          show: "/products/show/:id",
          meta: {
            label: "商品／價目",
            icon: <ShoppingOutlined />,
          },
        },
        {
          name: "categories",
          list: "/categories",
          create: "/categories/create",
          edit: "/categories/edit/:id",
          show: "/categories/show/:id",
          meta: {
            label: "分類",
            icon: <TagsOutlined />,
          },
        },
        {
          name: "faq",
          list: "/faq",
          create: "/faq/create",
          edit: "/faq/edit/:id",
          show: "/faq/show/:id",
          meta: {
            label: "FAQ",
            icon: <QuestionCircleOutlined />,
          },
        },
        {
          name: "members",
          list: "/members",
          create: "/members/create",
          edit: "/members/edit/:id",
          show: "/members/show/:id",
          meta: {
            label: "會員",
            icon: <UserOutlined />,
          },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        title: {
          text: "橙益後台",
        },
      }}
    >
      <Routes>
        <Route
          element={
            <ThemedLayout
              Title={(props) => <ThemedTitle {...props} text="橙益後台" />}
            >
              <Outlet />
            </ThemedLayout>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route path="orders">
            <Route index element={<OrderList />} />
            <Route path="create" element={<OrderCreate />} />
            <Route path="edit/:id" element={<OrderEdit />} />
            <Route path="show/:id" element={<OrderShow />} />
          </Route>

          <Route path="products">
            <Route index element={<ProductList />} />
            <Route path="create" element={<ProductCreate />} />
            <Route path="edit/:id" element={<ProductEdit />} />
            <Route path="show/:id" element={<ProductShow />} />
          </Route>

          <Route path="categories">
            <Route index element={<CategoryList />} />
            <Route path="create" element={<CategoryCreate />} />
            <Route path="edit/:id" element={<CategoryEdit />} />
            <Route path="show/:id" element={<CategoryShow />} />
          </Route>

          <Route path="faq">
            <Route index element={<FaqList />} />
            <Route path="create" element={<FaqCreate />} />
            <Route path="edit/:id" element={<FaqEdit />} />
            <Route path="show/:id" element={<FaqShow />} />
          </Route>

          <Route path="members">
            <Route index element={<MemberList />} />
            <Route path="create" element={<MemberCreate />} />
            <Route path="edit/:id" element={<MemberEdit />} />
            <Route path="show/:id" element={<MemberShow />} />
          </Route>

          <Route path="*" element={<ErrorComponent />} />
        </Route>
      </Routes>
      <UnsavedChangesNotifier />
      <DocumentTitleHandler />
    </Refine>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <ConfigProvider
        locale={zhTW}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#1f1f1f",
            colorInfo: "#434343",
            colorSuccess: "#595959",
            colorWarning: "#8c8c8c",
            colorError: "#262626",
            colorLink: "#262626",
            colorBgLayout: "#f5f5f5",
            colorBgContainer: "#ffffff",
            colorBorder: "#d9d9d9",
            colorText: "#141414",
            colorTextSecondary: "#595959",
            borderRadius: 6,
            fontFamily:
              '"Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          components: {
            Button: {
              primaryShadow: "none",
            },
            Menu: {
              itemSelectedBg: "#f0f0f0",
              itemSelectedColor: "#141414",
              itemHoverBg: "#f5f5f5",
            },
            Layout: {
              siderBg: "#141414",
              headerBg: "#ffffff",
              bodyBg: "#f5f5f5",
              triggerBg: "#262626",
              triggerColor: "#f5f5f5",
            },
          },
        }}
      >
        <AntdApp>
          <RefineRoot />
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
