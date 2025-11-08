import React from 'react';
import { cn } from '~/lib/utils';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  // Determine badge style and label based on score
  const getBadgeConfig = (score: number) => {
    if (score > 70) {
      return {
        bgColor: 'bg-badge-green',
        textColor: 'text-green-600',
        label: 'Strong'
      };
    } else if (score > 49) {
      return {
        bgColor: 'bg-badge-yellow',
        textColor: 'text-yellow-600',
        label: 'Good Start'
      };
    } else {
      return {
        bgColor: 'bg-badge-red',
        textColor: 'text-red-600',
        label: 'Needs work'
      };
    }
  };

  const config = getBadgeConfig(score);

  return (
    <div className={cn('score-badge', config.bgColor)}>
      <p className={cn('text-sm font-semibold', config.textColor)}>
        {config.label}
      </p>
    </div>
  );
};

export default ScoreBadge;
