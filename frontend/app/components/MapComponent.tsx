import { Link } from "react-router";
import { useEffect, useState } from "react";

// DO NOT import Leaflet or React-Leaflet at the top level
// as it will crash during SSR (Server-Side Rendering) because 'window' is not defined.

interface Report {
    _id: string;
    title?: string;
    category?: string;
    location: string;
    status: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

interface MapComponentProps {
    reports: Report[];
    center?: [number, number];
    zoom?: number;
    selectable?: boolean;
    onLocationSelect?: (coords: { lat: number; lng: number }) => void;
    selectedLocation?: { lat: number; lng: number } | null;
}

export default function MapComponent({
    reports,
    center = [27.7172, 85.3240],
    zoom = 13,
    selectable = false,
    onLocationSelect,
    selectedLocation
}: MapComponentProps) {
    const [LeafletMap, setLeafletMap] = useState<any>(null);

    useEffect(() => {
        // Dynamically import Leaflet and React-Leaflet only on the client
        const loadLeaflet = async () => {
            const [L, ReactLeaflet] = await Promise.all([
                import("leaflet"),
                import("react-leaflet")
            ]);

            // Fix Leaflet marker icon issue in React
            // @ts-ignore
            delete L.default.Icon.Default.prototype._getIconUrl;
            L.default.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            setLeafletMap({
                L: L.default,
                ...ReactLeaflet
            });
        };

        loadLeaflet();
    }, []);

    if (!LeafletMap) {
        return (
            <div className="w-full h-[400px] bg-stone-100/50 backdrop-blur-sm animate-pulse rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-stone-200">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-stone-400 font-bold text-sm tracking-tight">Geographic Data Loading...</span>
            </div>
        );
    }

    const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = LeafletMap;

    // Internal component to handle clicks
    function LocationPicker() {
        useMapEvents({
            click(e: any) {
                if (selectable && onLocationSelect) {
                    onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
                }
            },
        });
        return selectedLocation ? (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>Selected Location</Popup>
            </Marker>
        ) : null;
    }

    const hasReports = reports.length > 0;
    const validReports = reports.filter(r => r.coordinates && r.coordinates.lat && r.coordinates.lng);

    return (
        <div className="w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl border-2 border-blue-900/10 shadow-inner z-10 relative">
            <MapContainer
                // @ts-ignore
                center={center}
                // @ts-ignore
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    // @ts-ignore
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // @ts-ignore
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectable && <LocationPicker />}

                {validReports.map((report) => (
                    <Marker
                        key={report._id}
                        position={[report.coordinates!.lat, report.coordinates!.lng]}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-blue-900">{report.title || report.category}</h3>
                                <p className="text-xs text-gray-500 mb-2">{report.location}</p>
                                <div className="flex items-center justify-between gap-4 border-t pt-2">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {report.status}
                                    </span>
                                    <Link
                                        to={`/track-report?id=${report._id}`}
                                        className="text-blue-600 font-bold text-xs hover:underline"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
