import { Link } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

interface DesktopNavigationProps {
  navItems: {
    name: string
    href: string
    icon: LucideIcon
    description: string
  }[]
  isActive: (href: string) => boolean
}

export default function DesktopNavigation({ navItems, isActive }: DesktopNavigationProps) {
  return (
    <div className="hidden lg:flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${active
                ? 'bg-blue-50 text-blue-700': 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <Icon className={`w-5 h-5 mr-2 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
            <span className="font-medium">{item.name}</span>
            {active && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </Link>
        )
      })}
    </div>
  )
} 