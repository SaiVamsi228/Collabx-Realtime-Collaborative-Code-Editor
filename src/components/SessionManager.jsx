import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faGlobe, faLock, faArrowRight, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';

function SessionManager() {
  const [activeTab, setActiveTab] = useState('public');

  return (
    <>
      <header className="bg-white/100 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-[1.8rem] font-bold text-primary">
            CollabX {/* Placeholder for SVG */}
          </div>
        </div>
      </header>
      <div className="mt-28 px-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* Search Section */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              placeholder="Name your session"
            />
            <button className="flex items-center gap-2 px-4 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all">
              <FontAwesomeIcon icon={faBolt} className="text-xs" />
              <span>Launch</span>
            </button>
          </div>

          {/* Rooms Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-3 font-semibold rounded-md text-sm transition-all ${
                  activeTab === 'public'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('public')}
              >
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Public
              </button>
              <button
                className={`flex-1 py-3 font-semibold rounded-md text-sm transition-all ${
                  activeTab === 'private'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('private')}
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Private
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'public' ? (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="bg-white p-4 rounded-md border border-gray-200 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Code Blitz</h3>
                      <p className="text-sm text-gray-500">
                        by CodeWiz • 3 participants
                      </p>
                    </div>
                    <button className="flex items-center gap-1 px-4 py-2 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all">
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                      <span>Join</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Room ID</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Room ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Password"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all">
                  <FontAwesomeIcon icon={faUnlockAlt} />
                  <span>Access Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SessionManager;