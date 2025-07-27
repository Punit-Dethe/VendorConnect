import React from 'react';

interface SupplierStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}

const SupplierStatCard: React.FC<SupplierStatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  bgColor,
  textColor,
}) => {
  return (
    <div className={`card card-elevated ${bgColor} border-current`}>
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textColor.replace('text-', 'text-')}-700 mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${textColor.replace('text-', 'text-')}-900`}>{value}</p>
            <p className={`text-xs ${textColor.replace('text-', 'text-')}-600 mt-1`}>{description}</p>
          </div>
          <div className={`w-12 h-12 ${textColor.replace('text-', 'bg-')}-500 rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierStatCard; 