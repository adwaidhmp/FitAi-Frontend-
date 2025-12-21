import React from "react";
import { Row, Col, Card, Statistic, Typography, Space } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Dashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: 1242,
      icon: <UserOutlined className="text-blue-500 text-xl" />,
      change: 12,
      isPositive: true,
      color: "blue",
    },
    {
      title: "Total Trainers",
      value: 86,
      icon: <TeamOutlined className="text-green-500 text-xl" />,
      change: 8,
      isPositive: true,
      color: "green",
    },
    {
      title: "Approved Trainers",
      value: 72,
      icon: <CheckCircleOutlined className="text-purple-500 text-xl" />,
      change: 5,
      isPositive: true,
      color: "purple",
    },
    {
      title: "Pending Approvals",
      value: 14,
      icon: <ClockCircleOutlined className="text-orange-500 text-xl" />,
      change: -2,
      isPositive: false,
      color: "orange",
    },
  ];

  const recentActivities = [
    { id: 1, user: "John Doe", action: "User registered", time: "2 min ago" },
    { id: 2, user: "Jane Smith", action: "Trainer approved", time: "15 min ago" },
    { id: 3, user: "Mike Johnson", action: "Account deactivated", time: "1 hour ago" },
    { id: 4, user: "Sarah Wilson", action: "Profile updated", time: "2 hours ago" },
  ];

  return (
    <div>
      <Title level={2} className="mb-6">
        Dashboard Overview
      </Title>
      
      <Row gutter={[24, 24]} className="mb-8">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="rounded-xl shadow-sm border border-opacity-20">
              <Space size="middle" className="mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    {stat.title}
                  </Text>
                  <Title level={3} className="mt-1 mb-0">
                    {stat.value.toLocaleString()}
                  </Title>
                </div>
              </Space>
              <div className="flex items-center gap-2">
                {stat.isPositive ? (
                  <ArrowUpOutlined className="text-green-500" />
                ) : (
                  <ArrowDownOutlined className="text-red-500" />
                )}
                <Text className={`text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}% from last month
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4} className="m-0">Recent Activities</Title>}
            className="rounded-xl shadow-sm h-full"
          >
            <Space direction="vertical" size="middle" className="w-full">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                >
                  <div>
                    <Text strong>{activity.user}</Text>
                    <Text type="secondary" className="block">
                      {activity.action}
                    </Text>
                  </div>
                  <Text type="secondary">{activity.time}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4} className="m-0">Quick Actions</Title>}
            className="rounded-xl shadow-sm h-full"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  hoverable
                  className="text-center rounded-lg border border-dashed border-gray-300"
                >
                  <UserOutlined className="text-xl text-blue-500" />
                  <div className="mt-2">
                    <Text strong>Add New User</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  hoverable
                  className="text-center rounded-lg border border-dashed border-gray-300"
                >
                  <TeamOutlined className="text-xl text-green-500" />
                  <div className="mt-2">
                    <Text strong>Review Trainers</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  hoverable
                  className="text-center rounded-lg border border-dashed border-gray-300"
                >
                  <SettingOutlined className="text-xl text-purple-500" />
                  <div className="mt-2">
                    <Text strong>System Settings</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  hoverable
                  className="text-center rounded-lg border border-dashed border-gray-300"
                >
                  <ClockCircleOutlined className="text-xl text-orange-500" />
                  <div className="mt-2">
                    <Text strong>View Logs</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;