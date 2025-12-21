import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  Switch,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Badge,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { fetchUsers, updateUserStatus } from "../../redux/admin_slices/admin_user_trainer_approve";

const { Title, Text } = Typography;
const { Search } = Input;

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loadingUsers } = useSelector((state) => state.admin);

  const [searchText, setSearchText] = useState("");
  const [filterActive, setFilterActive] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    let data = users;

    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      );
    }

    if (filterActive !== null) {
      data = data.filter((u) => u.is_active === filterActive);
    }

    return data;
  }, [users, searchText, filterActive]);

  const handleStatusChange = async (userId, is_active) => {
    try {
      await dispatch(updateUserStatus({ userId, is_active })).unwrap();
      message.success(
        `User ${is_active ? "activated" : "deactivated"}`
      );
    } catch {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            className={record.is_active ? "bg-blue-500" : "bg-gray-300"}
          />
          <div>
            <div className="font-medium">
              {record.name || "Unknown User"}
            </div>
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : role === "trainer" ? "blue" : "default"}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active) => (
        <Badge
          status={is_active ? "success" : "error"}
          text={is_active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Joined",
      dataIndex: "date_joined",
      key: "date_joined",
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title={record.is_active ? "Deactivate" : "Activate"}>
            <Switch
              checked={record.is_active}
              onChange={(checked) =>
                handleStatusChange(record.id, checked)
              }
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
  };

  return (
    <div>
      <Title level={2}>User Management</Title>

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Users" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Active Users" value={stats.active} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Inactive Users" value={stats.inactive} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <Search
            placeholder="Search by name or email"
            allowClear
            enterButton={<SearchOutlined />}
            className="w-full md:w-72"
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={setSearchText}
          />

          <Space>
            <Button.Group>
              <Button
                type={filterActive === null ? "primary" : "default"}
                onClick={() => setFilterActive(null)}
              >
                All
              </Button>
              <Button
                type={filterActive === true ? "primary" : "default"}
                onClick={() => setFilterActive(true)}
              >
                Active
              </Button>
              <Button
                type={filterActive === false ? "primary" : "default"}
                onClick={() => setFilterActive(false)}
              >
                Inactive
              </Button>
            </Button.Group>

            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchUsers())}
                loading={loadingUsers}
              />
            </Tooltip>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loadingUsers}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="User Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={<Button onClick={() => setIsModalVisible(false)}>Close</Button>}
      >
        {selectedUser && (
          <>
            <Text strong>Email:</Text>
            <div>{selectedUser.email}</div>

            <Text strong>Role:</Text>
            <div>{selectedUser.role}</div>

            <Text strong>Status:</Text>
            <div>{selectedUser.is_active ? "Active" : "Inactive"}</div>

            <Text strong>Joined:</Text>
            <div>
              {new Date(selectedUser.created_at).toLocaleDateString()}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
