import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { Monitor } from 'lucide-react';

const ScreenCard = ({ screenName, screenType }) => {
  return (
    <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Screen Details</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{screenName || 'Screen Layout'}</h3>
            {screenType && (
              <div className="mt-2">
                <Badge variant="info" className="uppercase text-[10px] tracking-wider">
                  {screenType} Experience
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreenCard;
