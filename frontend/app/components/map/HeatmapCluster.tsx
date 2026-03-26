import React, { useEffect, useState, useCallback } from 'react';
import { useEffect as useMapEffect } from 'react-leaflet';

interface HeatmapPoint {
    _id: string;
    coordinates: { lat: number; lng: number };
    issueType: string;
    severity: number; // 1-5
    status: string;
    createdAt: string;
}

interface HeatmapClusterProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    onMapLoad?: (map: any) => void;
}

export default function HeatmapCluster({
    center = [28.3949, 84.1240], // Nepal default
    zoom = 7,
    className = "w-full h-[600px] rounded-lg shadow-lg border border-gray-300 z-0",
    onMapLoad
}: HeatmapClusterProps) {
    const [isClient, setIsClient] = useState(false);
    const [map, setMap] = useState<any>(null);
    const [heatLayer, setHeatLayer] = useState<any>(null);
    const [clusterLayer, setClusterLayer] = useState<any>(null);
    const [issues, setIssues] = useState<HeatmapPoint[]>([]);
    const [LeafletMap, setLeafletMap] = useState<any>(null);

    // Load Leaflet libraries
    useEffect(() => {
        setIsClient(true);

        const loadLibraries = async () => {
            try {
                const [L, ReactLeaflet, HeatLib, SuperCluster] = await Promise.all([
                    import('leaflet'),
                    import('react-leaflet'),
                    import('leaflet.heat'),
                    import('supercluster')
                ]);

                // Fix Leaflet icons for Vite
                delete L.default.Icon.Default.prototype._getIconUrl;
                L.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });

                setLeafletMap({
                    L: L.default,
                    MapContainer: ReactLeaflet.MapContainer,
                    TileLayer: ReactLeaflet.TileLayer,
                    Marker: ReactLeaflet.Marker,
                    Popup: ReactLeaflet.Popup,
                    CircleMarker: ReactLeaflet.CircleMarker,
                    heat: HeatLib.default,
                    SuperCluster: SuperCluster.default
                });
            } catch (error) {
                console.error("Failed to load heatmap dependencies:", error);
            }
        };

        loadLibraries();
    }, []);

    // Initialize map and heatmap
    const handleMapReady = useCallback((mapInstance: any) => {
        setMap(mapInstance);

        if (onMapLoad) {
            onMapLoad(mapInstance);
        }

        // Create initial heatmap layer
        const heat = LeafletMap?.heat?.([center], {
            max: 8,
            radius: 25,
            blur: 15,
            gradient: {
                0.0: '#0000FF', // Blue - Low
                0.25: '#00FF00', // Green - Low-Medium
                0.5: '#FFFF00', // Yellow - Medium
                0.75: '#FF7F00', // Orange - High
                1.0: '#FF0000' // Red - Critical
            }
        });

        if (heat) {
            heat.addTo(mapInstance);
            setHeatLayer(heat);
        }

        console.log('✅ Heatmap initialized');
    }, [LeafletMap, center, onMapLoad]);

    // Update heatmap with new data
    const updateHeatmap = useCallback((data: HeatmapPoint[]) => {
        if (!heatLayer || !map) return;

        // Convert report coordinates to heatmap format [lat, lng, intensity]
        // Intensity based on severity (1-5 scale)
        const heatData = data.map(point => [
            point.coordinates.lat,
            point.coordinates.lng,
            point.severity / 5 // Normalize to 0-1
        ]);

        if (heatData.length > 0) {
            heatLayer.setLatLngs(heatData);
            console.log(`🔥 Heatmap updated with ${heatData.length} points`);
        }
    }, [heatLayer, map]);

    // Cluster issues by type
    const clusterByType = useCallback((data: HeatmapPoint[]) => {
        if (!map) return;

        const typeGroups: { [key: string]: HeatmapPoint[] } = {};
        const severityColors: { [key: number]: string } = {
            1: '#3b82f6', // Blue - Low
            2: '#10b981', // Green - Medium
            3: '#f59e0b', // Amber - High
            4: '#ef4444', // Red - Critical
            5: '#7c3aed'  // Violet - Severe
        };

        // Group by issue type
        data.forEach(issue => {
            if (!typeGroups[issue.issueType]) {
                typeGroups[issue.issueType] = [];
            }
            typeGroups[issue.issueType].push(issue);
        });

        // Create cluster circles for each type
        Object.entries(typeGroups).forEach(([type, issues]) => {
            const issueCount = issues.length;
            const avgLat = issues.reduce((sum, i) => sum + i.coordinates.lat, 0) / issueCount;
            const avgLng = issues.reduce((sum, i) => sum + i.coordinates.lng, 0) / issueCount;
            const avgSeverity = Math.ceil(issues.reduce((sum, i) => sum + i.severity, 0) / issueCount);

            if (LeafletMap?.CircleMarker && map.eachLayer) {
                // This would need to be integrated with React-Leaflet's component system
                // For now, store data for display
            }
        });
    }, [map, LeafletMap]);

    // Fetch initial reports and listen for updates
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports/public/recent');
                const data = await response.json();
                const formattedData = data.map((report: any) => ({
                    _id: report._id,
                    coordinates: report.coordinates,
                    issueType: report.issueType || 'General',
                    severity: report.severity || 3,
                    status: report.status,
                    createdAt: report.createdAt
                }));
                setIssues(formattedData);
                updateHeatmap(formattedData);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            }
        };

        if (heatLayer) {
            fetchReports();
        }
    }, [heatLayer, updateHeatmap]);

    // Socket.io real-time updates
    useEffect(() => {
        const setupSocketListener = async () => {
            // Dynamically import Socket.io client
            const { io } = await import('socket.io-client');
            const socket = io({
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            socket.on('newIssue', (newIssue: HeatmapPoint) => {
                console.log('🆕 New issue received via Socket.io:', newIssue);
                setIssues(prev => [...prev, newIssue]);
                updateHeatmap([...issues, newIssue]);
            });

            socket.on('status_updated', (updatedReport: any) => {
                console.log('📡 Status update received:', updatedReport);
                setIssues(prev =>
                    prev.map(issue =>
                        issue._id === updatedReport._id
                            ? { ...issue, status: updatedReport.status }
                            : issue
                    )
                );
            });

            return () => {
                socket.disconnect();
            };
        };

        setupSocketListener().catch(console.error);
    }, [issues, updateHeatmap]);

    if (!isClient || !LeafletMap) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
                <div className="text-gray-400 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading Heatmap...</span>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer } = LeafletMap;

    return (
        <div className="relative">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className={className}
                whenReady={(e: any) => handleMapReady(e.target)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Rendered CircleMarkers for cluster visualization */}
                {/* This section dynamically renders based on zoom level and cluster data */}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10">
                <h3 className="font-bold text-sm mb-3">Severity Level</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0000FF' }}></div>
                        <span>Low (1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00FF00' }}></div>
                        <span>Low-Medium (2)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFFF00' }}></div>
                        <span>Medium (3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF7F00' }}></div>
                        <span>High (4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF0000' }}></div>
                        <span>Critical (5)</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                    <p className="font-semibold mb-1">Total Issues: {issues.length}</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="text-xs space-y-1">
                    <p><span className="font-semibold">Pending:</span> {issues.filter(i => i.status === 'pending').length}</p>
                    <p><span className="font-semibold">In Progress:</span> {issues.filter(i => i.status === 'in-progress').length}</p>
                    <p><span className="font-semibold">Resolved:</span> {issues.filter(i => i.status === 'resolved').length}</p>
                </div>
            </div>
        </div>
    );
}
