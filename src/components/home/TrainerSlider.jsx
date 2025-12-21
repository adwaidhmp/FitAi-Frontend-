import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, Check, Users } from "lucide-react";
import {
  fetchApprovedTrainers,
  bookTrainer,
  clearTrainerState,
} from "../../redux/user_slices/trainerBookingSlice";
import { message } from "antd";

const TrainerSlider = () => {
  const dispatch = useDispatch();

  // ✅ correct selector
  const {
    approvedTrainers,
    loading,
    error,
    actionSuccess,
  } = useSelector((state) => state.trainerBooking);

  const [selectedTrainer, setSelectedTrainer] = useState(0);

  useEffect(() => {
    dispatch(fetchApprovedTrainers());

    return () => {
      dispatch(clearTrainerState());
    };
  }, [dispatch]);

  useEffect(() => {
  if (error) {
    message.error(
      typeof error === "string"
        ? error
        : error?.detail || "Booking failed"
    );
    dispatch(clearTrainerState());
  }

  if (actionSuccess) {
    message.success(actionSuccess);
    dispatch(clearTrainerState());
  }
}, [error, actionSuccess, dispatch]);


  if (loading && approvedTrainers.length === 0) {
    return <div className="text-center text-gray-400">Loading trainers...</div>;
  }


  if (!approvedTrainers || approvedTrainers.length === 0) {
    return (
      <div className="text-center text-gray-400">No trainers available</div>
    );
  }

  const activeTrainer = approvedTrainers[selectedTrainer];

  const handleBookTrainer = () => {
    dispatch(bookTrainer(activeTrainer.id));;
  };
console.log(approvedTrainers);
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Expert Trainers</h3>
        <p className="text-gray-400">
          Connect with certified fitness professionals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trainer List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedTrainers.map((trainer, index) => (
              <button
                key={trainer.id} // ✅ fixed key
                onClick={() => setSelectedTrainer(index)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedTrainer === index
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-gray-800 bg-gray-900/50 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                    <span className="text-xl font-bold">
                      {trainer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{trainer.name}</h4>
                    <p className="text-sm text-gray-400">
                      {trainer.specialties?.[0] || "Fitness Trainer"}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-400" />
                        <span>{trainer.experience_years} years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-green-400" />
                        <span>Approved</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {trainer.specialties?.slice(0, 2).map((sp, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-800 rounded"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Trainer Details */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 sticky top-24">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                  <span className="text-2xl font-bold">
                    {activeTrainer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold">
                    {activeTrainer.name}
                  </h4>
                  <p className="text-gray-300">
                    {activeTrainer.specialties?.[0] || "Fitness Trainer"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="font-semibold">
                    {activeTrainer.experience_years} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="font-semibold text-green-400">
                    Approved Trainer
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h5 className="font-semibold mb-3">Specialties</h5>
              <div className="space-y-2">
                {activeTrainer.specialties?.length ? (
                  activeTrainer.specialties.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>{sp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No specialties listed
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h5 className="font-semibold mb-3">About</h5>
              <p className="text-gray-300 text-sm">
                {activeTrainer.bio || "No bio provided"}
              </p>
            </div>

            {actionSuccess && (
              <p className="text-green-400 text-sm mb-3">
                {actionSuccess}
              </p>
            )}

            <button
              onClick={handleBookTrainer}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-opacity ${
                loading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              }`}
            >
              {loading ? "Booking..." : "Book Trainer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSlider;
