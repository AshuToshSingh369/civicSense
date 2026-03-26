import React, { useEffect, useState } from 'react';
// Fix for default Leaflet icons in Vite
const fixLeafletIcons = async (L: any) => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

interface BaseMapProps {
    children?: React.ReactNode;
    center?: [number, number];
    zoom?: number;
    className?: string;
    onMapLoad?: (map: any) => void;
}

export default function BaseMap({
    children,
    center = [28.3949, 84.1240], // Default center on Nepal
    zoom = 7,
    className = "w-full h-[400px] rounded-lg shadow-sm border border-gray-200 z-0",
    onMapLoad
}: BaseMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [LeafletMap, setLeafletMap] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        // Dynamic import to prevent SSR crashes
        const loadLeaflet = async () => {
            try {
                const [L, ReactLeaflet] = await Promise.all([
                    import('leaflet'),
                    import('react-leaflet')
                ]);

                await fixLeafletIcons(L.default);

                setLeafletMap({ L: L.default, ...ReactLeaflet });
            } catch (error) {
                console.error("Failed to load map dependencies:", error);
            }
        };
        loadLeaflet();
    }, []);

    if (!isClient || !LeafletMap) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
                <div className="text-gray-400 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading Map...</span>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer } = LeafletMap;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className={className}
            whenReady={(e: any) => onMapLoad && onMapLoad(e.target)}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {children}
        </MapContainer>
    );
}
