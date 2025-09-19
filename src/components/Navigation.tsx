import React from 'react'
import { useState } from 'react'
import { Users, MessageCircle, User, Heart, Diamond } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasAnyUnreadMessages?: boolean
  isUserPremium?: boolean
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  hasAnyUnreadMessages = false,
  isUserPremium = false
}) => {

  const tabs = [
    { id: 'discover', label: 'Descobrir', icon: Users },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'event', label: 'Evento', icon: Diamond },
    { id: 'premium', label: 'Premium', icon: Diamond },
    { id: 'profile', label: 'Perfil', icon: User }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors relative ${
              activeTab === id
                ? `${
                    id === 'matches' && hasAnyUnreadMessages 
                      ? 'text-green-600 bg-green-50' 
                      : id === 'premium' && isUserPremium
                      ? 'text-yellow-500 bg-yellow-50'
                      : 'text-blue-600 bg-blue-50'
                  }`
                : `${
                    id === 'matches' && hasAnyUnreadMessages 
                      ? 'text-green-600 hover:text-green-800' 
                      : id === 'premium' && isUserPremium
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
            {/* Unread indicator for matches tab */}
            {id === 'matches' && hasAnyUnreadMessages && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}