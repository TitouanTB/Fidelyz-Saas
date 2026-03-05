import { JourneyConfig } from "./config";
import { JourneyStats, JourneyStage } from "./types";
import { LucideIcon } from "lucide-react";

interface JourneyBlockProps {
  config: JourneyConfig;
  stat?: JourneyStats;
  icon: LucideIcon;
  onClick: () => void;
  onSimulate: () => void;
  index: number;
  isMobile?: boolean;
}

export function JourneyBlock({
  config,
  stat,
  icon: Icon,
  onClick,
  onSimulate,
  index,
  isMobile = false,
}: JourneyBlockProps) {
  if (isMobile) {
    return (
      <div
        className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <div className={`${config.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
              {stat && (
                <span className={`text-2xl font-bold ${config.color}`}>
                  {stat.count}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            {stat && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.iconBg} rounded-full transition-all duration-500`}
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{stat.rate}%</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSimulate();
          }}
          className="mt-3 w-full py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Simuler
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Icon Circle */}
      <button
        onClick={onClick}
        className={`relative z-10 ${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4 cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300`}
      >
        <div className={`${config.iconBg} w-14 h-14 rounded-xl flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {stat && (
          <div className={`absolute -top-2 -right-2 ${config.iconBg} text-white text-xs font-bold px-2 py-1 rounded-full shadow`}>
            {stat.count}
          </div>
        )}
      </button>

      {/* Label */}
      <div className="mt-3 text-center">
        <h3 className={`font-semibold text-sm ${config.color}`}>{config.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5 max-w-[100px]">{config.description}</p>
      </div>

      {/* Progress Bar */}
      {stat && (
        <div className="mt-2 w-full">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.iconBg} rounded-full transition-all duration-500`}
              style={{ width: `${stat.rate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{stat.rate}%</p>
        </div>
      )}

      {/* Simulate Button */}
      <button
        onClick={onSimulate}
        className="mt-2 px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Simuler
      </button>
    </div>
  );
}
