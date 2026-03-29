import React, { useEffect, useState } from 'react';
import { Link } from 'react-router'; 

interface IssueMarkerProps {
    issue: {
        _id: string;
        title: string;
        description: string;
        status: 'pending' | 'in-progress' | 'resolved';
        locationName?: string;
        createdAt: string;
        coordinates: { lat: number; lng: number };
        imageUrl?: string;
    };
}


export const getStatusIconHtml = (status: string) => {
    let color;
    switch (status) {
        case 'pending':
            color = '#ff0055'; 
            break;
        case 'in-progress':
            color = '#0d93f2'; 
            break;
        case 'resolved':
            color = '#00ff85'; 
            break;
        default:
            color = '#64748b';
    }

    return `
      <div class="relative flex items-center justify-center transform transition-transform hover:scale-125" style="filter: drop-shadow(0 0 8px ${color}66)">
         <span style="color: ${color}; font-size: 32px; line-height: 1; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5))">🔻</span>
      </div>
    `;
};


export default function IssueMarker({ issue }: IssueMarkerProps) {
    const [LeafletMap, setLeafletMap] = useState<any>(null);

    useEffect(() => {
        const loadDeps = async () => {
            const [L, ReactLeaflet] = await Promise.all([
                import('leaflet'),
                import('react-leaflet')
            ]);
            setLeafletMap({ L: L.default, ...ReactLeaflet });
        };
        loadDeps();
    }, []);

    if (!LeafletMap || !issue.coordinates) return null;

    const { Marker, Popup } = LeafletMap;
    const { L } = LeafletMap;

    const statusIcon = L.divIcon({
        html: getStatusIconHtml(issue.status),
        className: 'custom-leaflet-icon', 
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });


    return (
        <Marker
            position={[issue.coordinates.lat, issue.coordinates.lng]}
            icon={statusIcon}
        >
            <Popup className="custom-popup">
                <div className="p-2 min-w-[200px] max-w-[280px]">
                    {issue.imageUrl && (
                        <div className="w-full h-24 mb-3 overflow-hidden rounded-md bg-gray-100">
                            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight pr-2">{issue.title}</h3>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm whitespace-nowrap 
                             ${issue.status === 'pending' ? 'bg-red-100 text-red-700' :
                                issue.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'}`}>
                            {issue.status}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2 truncate">{issue.locationName || 'Unknown Location'}</p>
                    <p className="text-xs text-gray-700 mb-3 line-clamp-2">{issue.description}</p>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        <Link to={`/track-report?id=${issue._id}`} className="text-blue-600 font-bold hover:underline">
                            Details →
                        </Link>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
