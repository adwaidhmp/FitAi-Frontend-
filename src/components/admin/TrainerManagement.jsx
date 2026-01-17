import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Users,
  FileText,
  X,
  Award
} from "lucide-react";
import Loading from "../Loading";
import {
  fetchTrainers,
  fetchTrainerDetail,
  approveTrainer,
} from "../../redux/admin_slices/admin_user_trainer_approve";

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
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(true);
    } catch {
      // Error handled via toast or slice
    }
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(approveTrainer(id)).unwrap();
      dispatch(fetchTrainers());
      setIsModalOpen(false);
    } catch {
       // Error handled
    }
  };

  const stats = {
    total: trainers.length,
    approved: trainers.filter((t) => t.is_approved).length,
    pending: trainers.filter((t) => !t.is_approved).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Trainer Management</h2>
          <p className="text-gray-400 text-sm">
            Review and approve trainer applications
          </p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => dispatch(fetchTrainers())}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                disabled={loadingTrainers}
            >
                {loadingTrainers ? <Loading small /> : <RefreshCw size={20} />}
            </button>
        </div>
      </div>

       {/* TABS & SEARCH */}
       <div className="flex flex-col md:flex-row gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-black border border-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex bg-black border border-gray-800 rounded-lg p-1 overflow-x-auto">
          {[
            { key: "all", label: `All (${stats.total})` },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "approved", label: `Approved (${stats.approved})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Trainer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Applied On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTrainers.length === 0 ? (
                <tr>
                   <td colSpan="4" className="p-8 text-center text-gray-500">
                       No trainers found.
                   </td>
                </tr>
              ) : (
                filteredTrainers.map((trainer) => (
                    <tr key={trainer.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="font-medium text-white">{trainer.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{trainer.email}</div>
                        </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            trainer.is_approved ? 'bg-green-900/20 text-green-400' : 'bg-orange-900/20 text-orange-400'
                        }`}>
                            {trainer.is_approved ? "Approved" : "Pending"}
                        </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                        {trainer.date_joined ? new Date(trainer.date_joined).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => handleViewDetail(trainer.id)}
                                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <Eye size={18} />
                            </button>
                            {!trainer.is_approved && (
                                <button
                                    onClick={() => handleApprove(trainer.id)}
                                    className="p-2 hover:bg-gray-700 rounded-lg text-green-500 hover:text-green-400 transition-colors"
                                    title="Approve"
                                >
                                    <CheckCircle size={18} />
                                </button>
                            )}
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
              <h3 className="text-lg font-bold text-white">Trainer Application</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
                {!trainerDetail?.profile ? (
                    <div className="text-center text-gray-500 py-10">No profile data found.</div>
                ) : (
                    <div className="space-y-8">
                        {/* HEADER */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                                {trainerDetail.profile.name?.[0] || "T"}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">
                                    {trainerDetail.profile.name || "Trainer Name"}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-sm px-2 py-0.5 rounded-full ${trainerDetail.profile.is_completed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {trainerDetail.profile.is_completed ? "Profile Completed" : "Incomplete Profile"}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        Exp: {trainerDetail.profile.experience_years || 0} years
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* BIO */}
                        <div>
                            <h5 className="flex items-center gap-2 text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">
                                <FileText size={16} /> Bio
                            </h5>
                            <p className="text-gray-300 bg-black/30 p-4 rounded-xl border border-gray-800">
                                {trainerDetail.profile.bio || "No bio provided."}
                            </p>
                        </div>

                        {/* SPECIALTIES */}
                        <div>
                             <h5 className="flex items-center gap-2 text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">
                                <Award size={16} /> Specialties
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {trainerDetail.profile.specialties?.length ? (
                                    trainerDetail.profile.specialties.map((spec, i) => (
                                        <span key={i} className="px-3 py-1 rounded-lg bg-purple-900/20 text-purple-400 border border-purple-900/30 text-sm">
                                            {spec}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 italic">None listed</span>
                                )}
                            </div>
                        </div>

                         {/* CERTIFICATES */}
                         <div>
                            <h5 className="flex items-center gap-2 text-gray-400 text-sm uppercase font-bold tracking-wider mb-4">
                                <CheckCircle size={16} /> Certificates
                            </h5>
                            {trainerDetail.profile.certificates?.length === 0 ? (
                                <p className="text-gray-500 italic">No certificates uploaded.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {trainerDetail.profile.certificates.map((cert) => (
                                        <div key={cert.id} className="group relative rounded-xl overflow-hidden border border-gray-800 bg-black">
                                            <img
                                                src={cert.file_url}
                                                alt="Certificate"
                                                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute bottom-0 w-full bg-black/70 p-2 text-xs text-center text-gray-300">
                                                Uploaded: {new Date(cert.uploaded_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3 shrink-0">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                    Close
                </button>
                {!trainers.find((t) => t.id === selectedTrainerId)?.is_approved && (
                    <button
                        onClick={() => handleApprove(selectedTrainerId)}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center gap-2"
                        disabled={loadingTrainerDetail}
                    >
                        <CheckCircle size={18} />
                        Approve Application
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;
