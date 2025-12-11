import React from "react";
import { motion, AnimatePresence } from "framer-motion";

//  id
//  title
//  message
//  time
//  unread
//  link

export default function NotificationModal({
  handleClick,
  isOpen,
  onClose,
  notifications,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onMouseLeave={onClose}
          className="absolute right-0 top-[120%] w-[340px] bg-white shadow-xl rounded-2xl border border-gray-200 z-50"
        >
          {notifications.length === 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
                Notifications
              </div>
              <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="text-sm text-gray-800 font-medium italic text-center py-[30px]">
                  You currently have no notifications.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
                Notifications
                <span className="text-xs text-blue-600 cursor-pointer hover:underline"></span>
              </div>

              <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {notifications.map((noti) => (
                  <div
                    key={noti.id}
                    className={`flex gap-3 items-start p-3 hover:bg-gray-50 cursor-pointer transition ${
                      noti.unread ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleClick(noti.id, noti.link)}
                  >
                    <div></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 font-medium">
                        {noti.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {noti.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {noti.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
