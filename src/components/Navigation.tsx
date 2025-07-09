import React from 'react'
import { Users, MessageCircle, User, Heart, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut } = useAuth()

  const tabs = [
    { id: 'discover', label: 'Descobrir', icon: Users },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'profile', label: 'Perfil', icon: User }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
        
        <button
          onClick={signOut}
          className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-red-600 hover:text-red-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}