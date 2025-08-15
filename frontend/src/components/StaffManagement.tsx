import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState('coaches');

  const staffMembers = [
    { id: 1, name: 'Jan van der Berg', role: 'Head Coach', skill: 75, age: 45, nationality: 'Netherlands', contract: '2025-06-30', salary: 85000 },
    { id: 2, name: 'Piet Bakker', role: 'Assistant Coach', skill: 68, age: 38, nationality: 'Netherlands', contract: '2024-12-31', salary: 45000 },
    { id: 3, name: 'Klaas Visser', role: 'Goalkeeping Coach', skill: 72, age: 42, nationality: 'Netherlands', contract: '2025-06-30', salary: 55000 },
    { id: 4, name: 'Henk Smit', role: 'Fitness Coach', skill: 70, age: 35, nationality: 'Netherlands', contract: '2024-12-31', salary: 40000 },
    { id: 5, name: 'Willem de Boer', role: 'Scout', skill: 65, age: 50, nationality: 'Netherlands', contract: '2025-06-30', salary: 35000 },
    { id: 6, name: 'Johan Mulder', role: 'Physiotherapist', skill: 60, age: 40, nationality: 'Netherlands', contract: '2024-12-31', salary: 38000 }
  ];

  const staffRoles = [
    { id: 'coaches', name: 'Coaching Staff', count: 3 },
    { id: 'medical', name: 'Medical Staff', count: 1 },
    { id: 'scouting', name: 'Scouting Staff', count: 1 },
    { id: 'youth', name: 'Youth Staff', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Staff Management</h1>
              <p className="text-gray-300">Manage your coaching and support staff</p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Staff Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Staff Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Staff Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Staff:</span>
                  <span className="font-bold">{staffMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coaching Staff:</span>
                  <span className="font-bold text-blue-400">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Staff:</span>
                  <span className="font-bold text-green-400">1</span>
                </div>
                <div className="flex justify-between">
                  <span>Scouting Staff:</span>
                  <span className="font-bold text-purple-400">1</span>
                </div>
                <div className="flex justify-between">
                  <span>Youth Staff:</span>
                  <span className="font-bold text-yellow-400">0</span>
                </div>
              </div>
            </div>

            {/* Staff Categories */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Staff Categories</h2>
              <div className="space-y-3">
                {staffRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedStaff(role.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStaff === role.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-bold">{role.name}</div>
                    <div className="text-sm opacity-75">{role.count} members</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                  Hire New Staff
                </button>
                <button className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                  Staff Training
                </button>
                <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
                  Contract Renewals
                </button>
                <button className="w-full p-3 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors">
                  Staff Reports
                </button>
              </div>
            </div>
          </div>

          {/* Staff List */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Staff Members</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                    Hire Staff
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                    Staff Search
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Contract</th>
                      <th className="text-left p-3">Salary</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{staff.name}</td>
                        <td className="p-3">{staff.role}</td>
                        <td className="p-3">{staff.age}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="mr-2">{staff.skill}</span>
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(staff.skill / 100) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{staff.contract}</td>
                        <td className="p-3">€{(staff.salary / 1000).toFixed(0)}K</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors">
                              View
                            </button>
                            <button className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors">
                              Train
                            </button>
                            <button className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs transition-colors">
                              Fire
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Performance */}
            <div className="mt-6 bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Staff Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Coaching Quality</h3>
                  <div className="text-2xl font-bold text-green-400">72</div>
                  <div className="text-sm text-gray-400">Average skill level</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Staff Morale</h3>
                  <div className="text-2xl font-bold text-blue-400">78</div>
                  <div className="text-sm text-gray-400">Team satisfaction</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Staff Costs</h3>
                  <div className="text-2xl font-bold text-yellow-400">€298K</div>
                  <div className="text-sm text-gray-400">Annual salary budget</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
