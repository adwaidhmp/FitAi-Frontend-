import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Button,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/user_slices/authSlice"

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "User Management",
    },
    {
      key: "/admin/trainers",
      icon: <TeamOutlined />,
      label: "Trainer Management",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleUserMenuClick = async ({ key }) => {
    if (key === "logout") {
      await dispatch(logoutUser());
      navigate("/login", { replace: true });
      return;
    }

    if (key === "profile") {
      navigate("/admin/profile");
    }

    if (key === "settings") {
      navigate("/admin/settings");
    }
  };

  const handleNavigation = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="bg-white shadow-md"
      >
        <div className="p-6 text-center border-b border-gray-200">
          <Title
            level={3}
            className={`m-0 text-blue-500 ${
              collapsed ? "truncate" : ""
            }`}
          >
            {collapsed ? "AD" : "ADMIN PANEL"}
          </Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleNavigation}
          items={menuItems}
          className="border-r-0 p-4"
        />

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="bg-blue-500" icon={<UserOutlined />} />
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm">
                  {user?.email || "Admin"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role?.toUpperCase() || "ADMIN"}
                </div>
              </div>
            )}
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className="px-6 bg-white flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={
              collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={() => setCollapsed(!collapsed)}
            className="text-base w-16 h-16"
          />

          <Space size="large">
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined className="text-lg" />}
                shape="circle"
              />
            </Badge>

            <Dropdown
              placement="bottomRight"
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
            >
              <div className="cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
                <Avatar className="bg-blue-500" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium text-sm">
                    {user?.email || "Admin"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role?.toUpperCase() || "ADMIN"}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className="m-6 p-0">
          <div className="p-6 min-h-[360px] bg-white rounded-lg">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
