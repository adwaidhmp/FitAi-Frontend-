import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Input,
  Badge,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Modal,
  Descriptions,
  Tabs,
  Image,
  Empty,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  fetchTrainers,
  fetchTrainerDetail,
  approveTrainer,
} from "../../redux/admin_slices/admin_user_trainer_approve";

const { Title, Text } = Typography;
const { Search } = Input;

const TrainerManagement = () => {
  const dispatch = useDispatch();
  const {
    trainers = [],
    trainerDetail,
    loadingTrainers,
    loadingTrainerDetail,
  } = useSelector((state) => state.admin);

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);

  useEffect(() => {
    dispatch(fetchTrainers());
  }, [dispatch]);

  const filteredTrainers = useMemo(() => {
    let data = [...trainers];

    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q)
      );
    }

    if (activeTab === "pending") {
      data = data.filter((t) => !t.is_approved);
    }

    if (activeTab === "approved") {
      data = data.filter((t) => t.is_approved);
    }

    return data;
  }, [trainers, searchText, activeTab]);

  const handleViewDetail = async (id) => {
    try {
      await dispatch(fetchTrainerDetail(id)).unwrap();
      setSelectedTrainerId(id);
      setOpen(true);
    } catch {
      message.error("Failed to load trainer details");
    }
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(approveTrainer(id)).unwrap();
      message.success("Trainer approved");
      dispatch(fetchTrainers());
      setOpen(false);
    } catch {
      message.error("Approval failed");
    }
  };

  const columns = [
    {
      title: "Trainer",
      render: (_, r) => (
        <Space>
          <Avatar icon={<TeamOutlined />} />
          <div>
            <div>{r.name || "Trainer"}</div>
            <Text type="secondary">{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_approved",
      render: (v) => (
        <Badge status={v ? "success" : "warning"} text={v ? "Approved" : "Pending"} />
      ),
    },
    {
      title: "Applied On",
      dataIndex: "date_joined",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(r.id)}
          />
          {!r.is_approved && (
            <Button
              type="text"
              icon={<CheckCircleOutlined className="text-green-500" />}
              onClick={() => handleApprove(r.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: trainers.length,
    approved: trainers.filter((t) => t.is_approved).length,
    pending: trainers.filter((t) => !t.is_approved).length,
  };

  return (
    <>
      <Title level={2}>Trainer Management</Title>

      <Row gutter={16} className="mb-4">
        <Col span={8}><Card><Statistic title="Total" value={stats.total} /></Card></Col>
        <Col span={8}><Card><Statistic title="Approved" value={stats.approved} /></Card></Col>
        <Col span={8}><Card><Statistic title="Pending" value={stats.pending} /></Card></Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: `All (${stats.total})` },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "approved", label: `Approved (${stats.approved})` },
          ]}
        />

        <Space className="mb-4">
          <Search
            placeholder="Search trainers"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchTrainers())}
            loading={loadingTrainers}
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredTrainers}
          loading={loadingTrainers}
        />
      </Card>

      <Modal
        title="Trainer Details"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>,
          !trainers.find(t => t.id === selectedTrainerId)?.is_approved && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={loadingTrainerDetail}
              onClick={() => handleApprove(selectedTrainerId)}
            >
              Approve Trainer
            </Button>
          ),
        ]}
        width={900}
      >
        {!trainerDetail?.profile ? (
          <Text type="secondary">No trainer profile data found</Text>
        ) : (
          <>
            {/* SUMMARY */}
            <div className="text-center mb-6">
              <Avatar size={80} icon={<TeamOutlined />} />
              <Title level={4}>Trainer Profile</Title>

              <Badge
                status={trainerDetail.profile.is_completed ? "success" : "warning"}
                text={
                  trainerDetail.profile.is_completed
                    ? "Profile Completed"
                    : "Profile Incomplete"
                }
              />

              <div className="mt-2 text-sm text-gray-500">
                Applied on{" "}
                {new Date(trainerDetail.profile.created_at).toLocaleString()}
              </div>
            </div>

            <Tabs
              items={[
                {
                  key: "1",
                  label: "Profile Info",
                  children: (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Bio">
                        {trainerDetail.profile.bio || "Not provided"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Specialties">
                        {trainerDetail.profile.specialties?.length
                          ? trainerDetail.profile.specialties.join(", ")
                          : "Not provided"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Experience (years)">
                        {trainerDetail.profile.experience_years ?? "Not provided"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Profile Status">
                        {trainerDetail.profile.is_completed
                          ? "Completed"
                          : "Incomplete"}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "2",
                  label: `Certificates (${trainerDetail.profile.certificates.length})`,
                  children:
                    trainerDetail.profile.certificates.length === 0 ? (
                      <Text type="secondary">No certificates uploaded</Text>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {trainerDetail.profile.certificates.map((cert) => (
                          <div key={cert.id} className="border p-2 rounded">
                            <img
                              src={cert.file_url}
                              alt="Certificate"
                              className="w-48 h-auto object-cover"
                            />
                            <div className="text-xs text-center mt-1 text-gray-500">
                              {new Date(cert.uploaded_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                },
              ]}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default TrainerManagement;
