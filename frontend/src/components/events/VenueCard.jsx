import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Building2, MapPin } from 'lucide-react';

const VenueCard = ({ venueName, address, city }) => {
  return (
    <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Venue Details</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{venueName || 'Venue Information'}</h3>
            <div className="mt-2 text-sm text-slate-600 space-y-1">
              {address && (
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary-500 shrink-0" />
                  <span>{address}</span>
                </div>
              )}
              {city && (
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {city}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
