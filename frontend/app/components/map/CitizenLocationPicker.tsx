import React, { useEffect, useState, useMemo, useRef } from 'react';

interface CitizenLocationPickerProps {
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
    initialLocation?: { lat: number; lng: number };
}

export default function CitizenLocationPicker({
    onLocationSelect,
    initialLocation
}: CitizenLocationPickerProps) {
    const [LeafletMap, setLeafletMap] = useState<any>(null);
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(initialLocation || null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const markerRef = useRef<any>(null);

    const handleLocateMe = () => {
        if (!("geolocation" in navigator)) {
            setGeoError("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
                setAccuracy(pos.coords.accuracy);
                onLocationSelect(newPos);
                setIsLocating(false);
            },
            (err) => {
                setGeoError("Failed to fetch current location. Please check permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
        const map = LeafletMap.useMap();
        useEffect(() => {
            map.setView([lat, lng], map.getZoom());
        }, [lat, lng, map]);
        return null;
    };

    // Initial load and geolocation
    useEffect(() => {
        const loadDeps = async () => {
            try {
                const [L, ReactLeaflet] = await Promise.all([
                    import('leaflet'),
                    import('react-leaflet')
                ]);
                // Fix Leaflet icons
                // @ts-ignore
                delete L.default.Icon.Default.prototype._getIconUrl;
                L.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                setLeafletMap({ L: L.default, ...ReactLeaflet });
            } catch (err) {
                console.error("Failed to load map dependencies", err);
            }
        };
        loadDeps();

        if (!initialLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(newPos);
                    setAccuracy(pos.coords.accuracy);
                    onLocationSelect(newPos);
                },
                (err) => {
                    setGeoError("Could not detect your exact location. Please adjust the pin manually.");
                    // Default to Kathmandu if location fails
                    const defaultPos = { lat: 27.7172, lng: 85.3240 };
                    setPosition(defaultPos);
                    onLocationSelect(defaultPos);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else if (!initialLocation) {
            // Default to Kathmandu
            const defaultPos = { lat: 27.7172, lng: 85.3240 };
            setPosition(defaultPos);
            onLocationSelect(defaultPos);
        }
    }, []);

    // Helper component to handle map clicks
    const LocationPickerEvents = () => {
        if (!LeafletMap) return null;
        LeafletMap.useMapEvents({
            click(e: any) {
                const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
                setPosition(newPos);
                onLocationSelect(newPos);
            },
        });
        return null;
    };

    // Memoize event handlers to prevent unnecessary re-renders
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    const formatted = { lat: newPos.lat, lng: newPos.lng };
                    setPosition(formatted);
                    onLocationSelect(formatted);
                }
            },
        }),
        [onLocationSelect],
    );

    if (!LeafletMap || !position) {
        return (
            <div className="w-full h-[300px] md:h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center border border-gray-200">
                <div className="flex flex-col items-center text-gray-400 gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Initializing Location Picker...</span>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer, Marker, Popup } = LeafletMap;

    return (
        <div className="w-full space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-gray-300 shadow-sm z-0">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={16}
                    scrollWheelZoom={true}
                    className="w-full h-[300px] md:h-[400px]"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPickerEvents />
                    <RecenterMap lat={position.lat} lng={position.lng} />
                    <Marker
                        position={[position.lat, position.lng]}
                        draggable={true}
                        eventHandlers={eventHandlers}
                        ref={markerRef}
                    >
                        <Popup>
                            <div className="text-center font-bold text-blue-900">
                                Issue Location<br />
                                <span className="text-xs font-normal text-gray-500">Drag me to adjust</span>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>

                {/* Accessibility & Accuracy Overlays */}
                <div className="absolute top-2 left-2 z-[1000] pointer-events-none">
                    {accuracy && accuracy > 100 && (
                        <div className="bg-amber-100 border border-amber-300 text-amber-800 text-xs px-3 py-2 rounded shadow-sm font-medium flex items-center gap-2">
                            <span>⚠️</span> Low GPS Accuracy. Please drag the pin.
                        </div>
                    )}
                    {geoError && (
                        <div className="bg-red-100 border border-red-300 text-red-800 text-xs px-3 py-2 rounded shadow-sm font-medium flex items-center gap-2">
                            <span>❌</span> {geoError}
                        </div>
                    )}
                </div>

                {/* GPS Tracking Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLocateMe();
                    }}
                    disabled={isLocating}
                    className="absolute bottom-4 right-4 z-[1001] size-12 bg-white hover:bg-gray-50 text-primary rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 group"
                    title="Track my location"
                >
                    <span className={`material-symbols-outlined text-[24px] ${isLocating ? 'animate-spin' : 'group-hover:animate-pulse'}`}>
                        {isLocating ? 'sync' : 'my_location'}
                    </span>
                </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 font-mono flex justify-between items-center shadow-inner">
                <span>LAT: {position.lat.toFixed(6)}</span>
                <span>LNG: {position.lng.toFixed(6)}</span>
            </div>
        </div>
    );
}
