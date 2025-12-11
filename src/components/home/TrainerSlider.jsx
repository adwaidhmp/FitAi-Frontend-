import React, { useState } from 'react';
import { Star, MessageCircle, Award, Check, MapPin, Target, Users, Calendar, Video } from 'lucide-react';

const TrainerSlider = () => {
  const [selectedTrainer, setSelectedTrainer] = useState(0);

  const trainers = [
    {
      id: 1,
      name: "Alex Johnson",
      specialization: "Strength & Conditioning",
      experience: "10 years",
      rating: 4.9,
      clients: 250,
      price: "$80/hr",
      availability: "Mon-Fri",
      certifications: ["NASM", "ACE", "CrossFit L3"],
      bio: "Specialized in strength training and athletic performance. Helped 50+ clients achieve competition level.",
      imageColor: "from-blue-600 to-cyan-600",
      icon: "💪"
    },
    {
      id: 2,
      name: "Sarah Miller",
      specialization: "Yoga & Mindfulness",
      experience: "8 years",
      rating: 4.8,
      clients: 180,
      price: "$70/hr",
      availability: "Mon-Sun",
      certifications: ["RYT-500", "Yoga Therapy"],
      bio: "Focus on holistic wellness through yoga and meditation practices. Expert in injury prevention.",
      imageColor: "from-purple-600 to-pink-600",
      icon: "🧘"
    },
    {
      id: 3,
      name: "Mike Chen",
      specialization: "Weight Loss",
      experience: "12 years",
      rating: 4.95,
      clients: 300,
      price: "$90/hr",
      availability: "Mon-Sat",
      certifications: ["ISSA", "Precision Nutrition"],
      bio: "Weight loss specialist with proven track record. Focus on sustainable lifestyle changes.",
      imageColor: "from-green-600 to-emerald-600",
      icon: "⚖️"
    },
    {
      id: 4,
      name: "Jessica Williams",
      specialization: "Rehabilitation",
      experience: "15 years",
      rating: 4.7,
      clients: 200,
      price: "$85/hr",
      availability: "Mon-Fri",
      certifications: ["DPT", "CSCS", "FMS"],
      bio: "Physical therapist turned personal trainer. Expert in post-injury recovery and mobility.",
      imageColor: "from-orange-600 to-yellow-600",
      icon: "🏥"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Expert Trainers</h3>
        <p className="text-gray-400">Connect with certified fitness professionals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trainer List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainers.map((trainer, index) => (
              <button
                key={trainer.id}
                onClick={() => setSelectedTrainer(index)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedTrainer === index
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl bg-linear-to-r ${trainer.imageColor}`}>
                    <span className="text-2xl">{trainer.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{trainer.name}</h4>
                        <p className="text-sm text-gray-400">{trainer.specialization}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{trainer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-400" />
                        <span className="text-xs">{trainer.experience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-green-400" />
                        <span className="text-xs">{trainer.clients} clients</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {trainer.certifications.slice(0, 2).map((cert, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-800 rounded">
                          {cert}
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
          <div className="bg-linear-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 sticky top-24">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-4 rounded-xl bg-linear-to-r ${trainers[selectedTrainer].imageColor}`}>
                  <span className="text-3xl">{trainers[selectedTrainer].icon}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold">{trainers[selectedTrainer].name}</h4>
                  <p className="text-gray-300">{trainers[selectedTrainer].specialization}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="font-semibold">{trainers[selectedTrainer].experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Hourly Rate</span>
                  <span className="font-bold text-xl text-purple-400">{trainers[selectedTrainer].price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Availability</span>
                  <span className="font-semibold">{trainers[selectedTrainer].availability}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h5 className="font-semibold mb-3">Certifications</h5>
              <div className="space-y-2">
                {trainers[selectedTrainer].certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h5 className="font-semibold mb-3">About</h5>
              <p className="text-gray-300 text-sm">{trainers[selectedTrainer].bio}</p>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity font-semibold">
                Book Session
              </button>
              <button className="w-full py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message Trainer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "1-on-1 Sessions", desc: "Personalized coaching", icon: "🎯" },
          { title: "Virtual Training", desc: "Train from anywhere", icon: "💻" },
          { title: "Progress Tracking", desc: "Regular assessments", icon: "📈" },
          { title: "Nutrition Guidance", desc: "Meal plans included", icon: "🥗" },
        ].map((feature, index) => (
          <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h5 className="font-semibold mb-1">{feature.title}</h5>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerSlider;
