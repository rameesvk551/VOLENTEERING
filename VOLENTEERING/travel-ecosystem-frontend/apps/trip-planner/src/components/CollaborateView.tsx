import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link as LinkIcon, Copy, Check, Users, Crown, Edit, Eye } from 'lucide-react';
import { useTripStore, Collaborator } from '../store/tripStore';

const CollaborateView: React.FC = () => {
  const { collaborators, tripName, addCollaborator } = useTripStore();
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Generate shareable link
  const shareableLink = `https://nomadic-nook.com/trip/${crypto.randomUUID().slice(0, 8)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tripName,
          text: `Check out my trip plan: ${tripName}`,
          url: shareableLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return Crown;
      case 'editor':
        return Edit;
      case 'viewer':
        return Eye;
    }
  };

  const getRoleColor = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return 'text-amber-600 dark:text-amber-400';
      case 'editor':
        return 'text-blue-600 dark:text-blue-400';
      case 'viewer':
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-24 px-4 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-600" />
            Collaborate
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Share your trip and plan together
          </p>
        </motion.div>

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Share Trip
            </h2>

            {/* Share link */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Shareable Link</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-white"
                />
                <motion.button
                  onClick={handleCopyLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Share button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Share via...
            </motion.button>
          </div>
        </motion.div>

        {/* Collaborators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Collaborators ({collaborators.length})
            </h2>
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              + Add Person
            </motion.button>
          </div>

          <div className="space-y-3">
            {collaborators.length > 0 ? (
              collaborators.map((collab, index) => {
                const RoleIcon = getRoleIcon(collab.role);
                return (
                  <motion.div
                    key={collab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        style={{ backgroundColor: collab.color }}
                      >
                        {collab.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {collab.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collab.email}
                        </p>
                      </div>

                      {/* Role badge */}
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getRoleColor(collab.role)}`}>
                        <RoleIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold capitalize">
                          {collab.role}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No collaborators yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Invite people to plan together
                </p>
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
                >
                  Invite Someone
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Role permissions info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Role Permissions
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Crown className="w-4 h-4 text-amber-600" />
              <strong>Owner:</strong> Full control, can delete trip
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Edit className="w-4 h-4 text-blue-600" />
              <strong>Editor:</strong> Can add/edit destinations and activities
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Eye className="w-4 h-4 text-gray-600" />
              <strong>Viewer:</strong> Can only view the trip
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollaborateView;
