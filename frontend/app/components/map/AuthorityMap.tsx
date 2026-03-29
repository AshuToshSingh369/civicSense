import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import useSupercluster from 'use-supercluster';
import { getStatusIconHtml } from './IssueMarker';



interface Issue {
    _id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    coordinates: { lat: number; lng: number };
    issueType?: string;
    severity?: number;
    createdAt?: string;
}

interface AuthorityMapProps {
    issues: Issue[];
    center?: [number, number];
    zoom?: number;
    onMarkerClick?: (issueId: string) => void;
}



const ISSUE_WEIGHTS: Record<string, number> = {
    'Pothole': 0.8,
    'Broken Road': 0.8,
    'Streetlight Failure': 0.5,
    'Water Leakage': 0.7,
    'Garbage Overflow': 0.6,
    'General': 0.4,
};

const NEON_GRADIENT = {
    0.2: "#00f5ff", 
    0.4: "#00ff85", 
    0.6: "#f9ff00", 
    0.8: "#ff7b00", 
    1.0: "#ff0055"  
};



interface HeatLayerProps {
    issues: Issue[];
    visible: boolean;
    LeafletMap: any;
}

function HeatLayer({ issues, visible, LeafletMap }: HeatLayerProps) {
    const heatLayerRef = useRef<any>(null);
    const map = LeafletMap.useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    
    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoomend', onZoom);
        return () => { map.off('zoomend', onZoom); };
    }, [map]);

    
    const heatData = useMemo<[number, number, number][]>(() => {
        return issues
            .filter(i =>
                i.coordinates &&
                typeof i.coordinates.lat === 'number' &&
                typeof i.coordinates.lng === 'number'
            )
            .map(i => {
                const weight = ISSUE_WEIGHTS[i.issueType || 'General'] || 0.4;
                const severity = i.severity || 3; 
                
                const intensity = (severity / 5) * weight;
                return [
                    i.coordinates.lat,
                    i.coordinates.lng,
                    intensity,
                ];
            });
    }, [issues]);

    
    useEffect(() => {
        if (!map) return;

        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
            heatLayerRef.current = null;
        }

        if (!visible || heatData.length === 0) return;

        import('leaflet.heat').then(() => {
            const L = (window as any).L ?? LeafletMap.L;
            if (!L?.heatLayer) return;

            
            
            const dynamicRadius = 15 + (zoom * 2);

            const layer = L.heatLayer(heatData, {
                radius: dynamicRadius,
                blur: dynamicRadius * 0.7,
                gradient: NEON_GRADIENT,
                maxZoom: 18,
            });
            layer.addTo(map);
            heatLayerRef.current = layer;
        }).catch(err => console.error('[Heatmap] Failed to load leaflet.heat:', err));

        return () => {
            if (heatLayerRef.current && map) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
        };
    }, [map, heatData, visible, LeafletMap, zoom]);

    return null;
}



export default function AuthorityMap({
    issues: initialIssues,
    center = [28.3949, 84.1240],
    zoom = 7,
    onMarkerClick
}: AuthorityMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [LeafletMap, setLeafletMap] = useState<any>(null);
    const [bounds, setBounds] = useState<any>(null);
    const [mapZoom, setMapZoom] = useState(zoom);
    const [showHeat, setShowHeat] = useState(true);
    const [showMarkers, setShowMarkers] = useState(true);
    const [issues, setIssues] = useState<Issue[]>(initialIssues);
    const [pulseLocation, setPulseLocation] = useState<[number, number] | null>(null);

    
    const [timeFilter, setTimeFilter] = useState('all'); 
    const [minSeverity, setMinSeverity] = useState(1);

    
    useEffect(() => {
        setIssues(initialIssues);
    }, [initialIssues]);

    
    useEffect(() => {
        setIsClient(true);
        const loadDeps = async () => {
            try {
                const [L, ReactLeaflet] = await Promise.all([
                    import('leaflet'),
                    import('react-leaflet')
                ]);
                setLeafletMap({ L: L.default, ...ReactLeaflet });
            } catch (err) {
                console.error('Failed to load map dependencies:', err);
            }
        };
        loadDeps();
    }, []);

    
    useEffect(() => {
        let socket: any;

        const connectSocket = async () => {
            try {
                const { io } = await import('socket.io-client');
                socket = io("/");

                socket.on('newIssue', (newIssue: Issue) => {
                    console.log('[Heatmap] New issue received for animation:', newIssue);
                    setIssues(prev => [newIssue, ...prev]);

                    
                    if (newIssue.coordinates) {
                        setPulseLocation([newIssue.coordinates.lat, newIssue.coordinates.lng]);
                        setTimeout(() => setPulseLocation(null), 4000);
                    }
                });
            } catch (err) {
                console.error('[Socket] Failed to connect:', err);
            }
        };

        connectSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    
    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            
            if (issue.severity && issue.severity < minSeverity) return false;

            
            if (timeFilter !== 'all' && issue.createdAt) {
                const created = new Date(issue.createdAt).getTime();
                const now = Date.now();
                const diffHours = (now - created) / (1000 * 60 * 60);

                if (timeFilter === '24h' && diffHours > 24) return false;
                if (timeFilter === '7d' && diffHours > 168) return false;
                if (timeFilter === '30d' && diffHours > 720) return false;
            }
            return true;
        });
    }, [issues, minSeverity, timeFilter]);

    

    const points = useMemo(() => {
        return filteredIssues
            .filter(i => i.coordinates && typeof i.coordinates.lat === 'number' && typeof i.coordinates.lng === 'number')
            .map(issue => ({
                type: 'Feature' as const,
                properties: {
                    cluster: false,
                    issueId: issue._id,
                    status: issue.status,
                    title: issue.title,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [issue.coordinates.lng, issue.coordinates.lat],
                },
            }));
    }, [filteredIssues]);

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds: bounds,
        zoom: mapZoom,
        options: { radius: 75, maxZoom: 18 },
    });

    

    const MapEvents = useCallback(() => {
        if (!LeafletMap) return null;
        const map = LeafletMap.useMapEvents({
            moveend: () => {
                const b = map.getBounds();
                setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
                setMapZoom(map.getZoom());
            },
        });

        useEffect(() => {
            if (map && !bounds) {
                const b = map.getBounds();
                setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
                setMapZoom(map.getZoom());
            }
        }, [map, bounds]);

        return null;
    }, [LeafletMap, bounds]);

    
    const PulseEffect = () => {
        const map = LeafletMap.useMap();
        if (!pulseLocation) return null;

        return (
            <LeafletMap.CircleMarker
                center={pulseLocation}
                radius={20}
                pathOptions={{
                    color: '#ff0055',
                    fillColor: '#ff0055',
                    fillOpacity: 0.6,
                    className: 'map-pulse-animation'
                }}
            />
        );
    };

    if (!isClient || !LeafletMap) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-[#0a0e14] rounded-xl animate-pulse border border-primary/20">
                <div className="flex flex-col items-center gap-3 text-text-muted">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-sm uppercase tracking-widest">Initializing Tactical Map…</span>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer, Marker, useMap } = LeafletMap;
    const { L } = LeafletMap;

    
    const ClusterMarker = ({ position, icon, expansionZoom }: {
        position: [number, number];
        icon: any;
        expansionZoom: number;
    }) => {
        const map = useMap();
        return (
            <Marker
                position={position}
                icon={icon}
                eventHandlers={{
                    click: () => map.flyTo(position, expansionZoom, { duration: 1 }),
                }}
            />
        );
    };

    

    return (
        <div className="w-full h-full relative z-0 group/map">
            <style dangerouslySetInnerHTML={{
                __html: `
                .map-pulse-animation {
                    animation: map-pulse 2s ease-out infinite;
                }
                @keyframes map-pulse {
                    0% { stroke-width: 2; r: 5; opacity: 1; }
                    100% { stroke-width: 20; r: 50; opacity: 0; }
                }
                .leaflet-container {
                    background: #0b0c10 !important;
                }
            `}} />

            
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4">
                <div className="bg-white/80 backdrop-blur-xl border border-border-muted p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px]">
                    <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em] mb-1">Tactical Analysis</h4>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Time Window</label>
                        <div className="flex bg-background-muted p-1 rounded-lg border border-border-muted">
                            {['all', '24h', '7d'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeFilter(t)}
                                    className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${timeFilter === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Min Severity</label>
                            <span className="text-[10px] font-mono text-primary font-bold">{minSeverity}+</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={minSeverity}
                            onChange={(e) => setMinSeverity(parseInt(e.target.value))}
                            className="accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            
            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => setShowHeat(prev => !prev)}
                    className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest
                        border backdrop-blur-xl transition-all duration-300 shadow-xl
                        ${showHeat
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-rose-500/10'
                            : 'bg-[#0f172a]/80 border-border-muted text-text-muted'
                        }
                    `}
                >
                    <span className={`w-2 h-2 rounded-full ${showHeat ? 'bg-rose-400 animate-pulse shadow-[0_0_8px_#fb7185]' : 'bg-slate-600'}`} />
                    Heat Zones: {showHeat ? 'Engaged' : 'Standby'}
                </button>

                <button
                    onClick={() => setShowMarkers(prev => !prev)}
                    className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest
                        border backdrop-blur-xl transition-all duration-300 shadow-xl
                        ${showMarkers
                            ? 'bg-primary/20 border-primary/40 text-primary shadow-primary/10'
                            : 'bg-[#0f172a]/80 border-border-muted text-text-muted'
                        }
                    `}
                >
                    <span className={`w-2 h-2 rounded-full ${showMarkers ? 'bg-primary animate-pulse shadow-[0_0_8px_#0d93f2]' : 'bg-slate-600'}`} />
                    Units: {showMarkers ? 'Visible' : 'Hidden'}
                </button>
            </div>

            <MapContainer
                key={`${center[0]}-${center[1]}-${zoom}`}
                center={center}
                zoom={zoom}
                maxZoom={18}
                scrollWheelZoom={true}
                className="w-full h-full rounded-[32px] shadow-2xl border border-border-muted"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapEvents />
                <PulseEffect />

                <HeatLayer
                    issues={filteredIssues}
                    visible={showHeat}
                    LeafletMap={LeafletMap}
                />

                {showMarkers && clusters.map((cluster: any) => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const { cluster: isCluster, point_count: pointCount } = cluster.properties;

                    if (isCluster) {
                        const baseSize = 40;
                        const scaledSize = Math.min(baseSize + (pointCount * 1.5), 80);

                        const clusterIcon = L.divIcon({
                            html: `
                               <div style="width:${scaledSize}px;height:${scaledSize}px;"
                                    class="bg-blue-600/90 text-white rounded-full flex items-center justify-center font-bold text-sm
                                           shadow-[0_0_15px_#2563eb80] border-2 border-white
                                           transform transition-transform hover:scale-110 hover:bg-blue-700 backdrop-blur-sm">
                                  ${pointCount}
                               </div>
                             `,
                            className: 'custom-cluster-icon',
                            iconSize: [scaledSize, scaledSize],
                            iconAnchor: [scaledSize / 2, scaledSize / 2],
                        });

                        const expansionZoom = supercluster
                            ? Math.min(supercluster.getClusterExpansionZoom(cluster.id), 18)
                            : 18;

                        return (
                            <ClusterMarker
                                key={`cluster-${cluster.id}`}
                                position={[latitude, longitude]}
                                icon={clusterIcon}
                                expansionZoom={expansionZoom}
                            />
                        );
                    }

                    
                    const statusIcon = L.divIcon({
                        html: getStatusIconHtml(cluster.properties.status),
                        className: 'custom-leaflet-icon',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32],
                    });

                    return (
                        <Marker
                            key={`issue-${cluster.properties.issueId}`}
                            position={[latitude, longitude]}
                            icon={statusIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onMarkerClick) onMarkerClick(cluster.properties.issueId);
                                },
                            }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
