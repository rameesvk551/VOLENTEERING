import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWalking, FaCarAlt } from 'react-icons/fa';
import { MdOutlineTrain } from 'react-icons/md';
import { Navigation2, Clock, Compass, RefreshCw, Share2, Route as RouteIcon, Info, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { optimizeRoute } from '@/redux/thunks/routeOptimizerThunk';
import { setBottomSheetSeq, setFocusedSeq, setTravelMode, setUserLocation } from '@/redux/Slices/routeOptimizerSlice';
import { useRouteExperienceMachine } from '@/hooks/useRouteExperienceMachine';
import { decorateLegs, formatDuration, metersToKm, formatTime, travelModeIcons } from '@/lib/route/utils';
const travelModes = [
    { label: 'Walking', value: 'WALKING', icon: _jsx(FaWalking, { className: "text-sky-600" }), helper: 'Best for short hops' },
    { label: 'Driving', value: 'DRIVING', icon: _jsx(FaCarAlt, { className: "text-emerald-500" }), helper: 'Fastest ETA' },
    { label: 'Transit', value: 'TRANSIT', icon: _jsx(MdOutlineTrain, { className: "text-indigo-500" }), helper: 'Metro + bus mix' }
];
const MapAutoFit = ({ legs, fitKey, userLocationEnabled }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !legs.length)
            return;
        const bounds = [
            [Infinity, Infinity],
            [-Infinity, -Infinity]
        ];
        legs.forEach((leg) => {
            leg.decodedPolyline.forEach(([lat, lng]) => {
                bounds[0][0] = Math.min(bounds[0][0], lat);
                bounds[0][1] = Math.min(bounds[0][1], lng);
                bounds[1][0] = Math.max(bounds[1][0], lat);
                bounds[1][1] = Math.max(bounds[1][1], lng);
            });
            bounds[0][0] = Math.min(bounds[0][0], leg.from.lat, leg.to.lat);
            bounds[0][1] = Math.min(bounds[0][1], leg.from.lng, leg.to.lng);
            bounds[1][0] = Math.max(bounds[1][0], leg.from.lat, leg.to.lat);
            bounds[1][1] = Math.max(bounds[1][1], leg.from.lng, leg.to.lng);
        });
        if (Number.isFinite(bounds[0][0]) && Number.isFinite(bounds[1][0])) {
            map.fitBounds(bounds, { padding: [userLocationEnabled ? 80 : 60, 60] });
        }
    }, [legs, map, fitKey, userLocationEnabled]);
    return null;
};
const MapFocus = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !target)
            return;
        map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 1.2 });
    }, [map, target]);
    return null;
};
const buildMarkerIcon = (seq, isActive) => L.divIcon({
    html: `<div class="shadow-lg rounded-full h-12 w-12 flex items-center justify-center font-semibold ${isActive ? 'bg-sky-600 text-white scale-105' : 'bg-white text-slate-900'} border-2 ${isActive ? 'border-sky-300' : 'border-slate-200'} dark:bg-slate-800 dark:text-white">
        ${seq}
      </div>`,
    className: 'route-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});
const RouteOptimizerExperience = () => {
    const dispatch = useDispatch();
    const { selectedPlace } = useSelector((state) => state.attractions);
    const routeState = useSelector((state) => state.routeOptimizer);
    const { state: machineState, send } = useRouteExperienceMachine();
    const [fitKey, setFitKey] = useState(0);
    const [etaCountdown, setEtaCountdown] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const messageTimeout = useRef(null);
    const pushMessage = useCallback((message) => {
        if (messageTimeout.current) {
            clearTimeout(messageTimeout.current);
        }
        setShareMessage(message);
        messageTimeout.current = setTimeout(() => {
            setShareMessage('');
            messageTimeout.current = null;
        }, 4000);
    }, []);
    useEffect(() => () => {
        if (messageTimeout.current) {
            clearTimeout(messageTimeout.current);
        }
    }, []);
    const legs = useMemo(() => (routeState.routeData?.legs ? decorateLegs(routeState.routeData.legs) : []), [
        routeState.routeData
    ]);
    const timeline = routeState.routeData?.timeline || [];
    const placeLookup = useMemo(() => {
        const map = new Map(legs.flatMap((leg) => [
            [leg.from.placeId, leg.from],
            [leg.to.placeId, leg.to]
        ]));
        return map;
    }, [legs]);
    const handleOptimize = useCallback((mode) => {
        if (selectedPlace.length < 2) {
            pushMessage('Select at least two attractions to build a route.');
            return;
        }
        const nextMode = mode || routeState.travelMode;
        dispatch(optimizeRoute({ travelMode: nextMode, places: selectedPlace }));
        send({ type: 'OPTIMIZE' });
    }, [dispatch, routeState.travelMode, selectedPlace, send, pushMessage]);
    const handleTravelModeChange = (mode) => {
        dispatch(setTravelMode(mode));
        handleOptimize(mode);
    };
    useEffect(() => {
        if (!('geolocation' in navigator))
            return;
        send({ type: 'LOCATE' });
        navigator.geolocation.getCurrentPosition((position) => {
            dispatch(setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            }));
            send({ type: 'LOCATE_SUCCESS' });
        }, (error) => {
            console.warn('Geolocation blocked', error?.message);
            send({ type: 'LOCATE_ERROR', message: error?.message || 'Location unavailable' });
        }, { enableHighAccuracy: true, timeout: 7000 });
    }, [dispatch, send]);
    useEffect(() => {
        if (routeState.status === 'loading') {
            send({ type: 'OPTIMIZE' });
        }
        if (routeState.status === 'success') {
            send({ type: 'OPTIMIZE_SUCCESS' });
            setFitKey((key) => key + 1);
        }
        if (routeState.status === 'error' && routeState.error) {
            send({ type: 'OPTIMIZE_ERROR', message: routeState.error });
        }
    }, [routeState.status, routeState.error, send]);
    useEffect(() => {
        if (!routeState.etaTicker)
            return;
        const updateCountdown = () => {
            const now = Date.now();
            const { startsAt, endsAt } = routeState.etaTicker;
            if (now < startsAt) {
                const diff = Math.max(0, startsAt - now);
                const minutes = Math.round(diff / 60000);
                setEtaCountdown(`Trip starts in ${formatDuration(minutes)}`);
            }
            else if (now <= endsAt) {
                const diff = Math.max(0, endsAt - now);
                const minutes = Math.round(diff / 60000);
                setEtaCountdown(`Ends in ${formatDuration(minutes)}`);
            }
            else {
                setEtaCountdown('Trip finished');
            }
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [routeState.etaTicker]);
    const handleMarkerClick = (seq) => {
        dispatch(setFocusedSeq(seq));
        dispatch(setBottomSheetSeq(seq));
        send({ type: 'OPEN_SHEET', seq });
    };
    const handleSheetClose = () => {
        dispatch(setBottomSheetSeq(null));
        send({ type: 'CLOSE_SHEET' });
    };
    const handleRecenter = () => {
        setFitKey((key) => key + 1);
    };
    const handleShare = () => {
        if (navigator.share && routeState.routeData) {
            navigator
                .share({
                title: 'My optimized trip',
                text: `Exploring ${routeState.routeData.optimizedOrder.length} spots with Volenteering route optimizer`,
                url: window.location.href
            })
                .catch(() => null);
        }
        else if (routeState.routeData) {
            const summary = `Trip from ${routeState.routeData.summary.startsAt} to ${routeState.routeData.summary.endsAt}`;
            navigator.clipboard?.writeText(summary);
            pushMessage('Trip summary copied to clipboard');
        }
    };
    const activeSheetEntry = routeState.routeData?.timeline.find((entry) => entry.seq === routeState.bottomSheetSeq);
    const legForSheet = legs.find((leg) => leg.from.seq === activeSheetEntry?.seq);
    const renderMap = () => {
        if (!legs.length) {
            return (_jsx("div", { className: "h-[420px] w-full rounded-3xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600", children: _jsxs("div", { className: "text-center space-y-3", children: [_jsx(RouteIcon, { className: "mx-auto text-slate-400" }), _jsx("p", { className: "text-slate-500 dark:text-slate-300 font-medium", children: "Generate a route to unlock the live map." }), _jsx("button", { onClick: () => handleOptimize(), className: "px-6 py-3 rounded-full bg-sky-600 text-white font-semibold shadow-lg", children: "Optimize Now" })] }) }));
        }
        const firstPlace = timeline[0]?.placeId ? placeLookup.get(timeline[0].placeId) : legs[0]?.from;
        const center = [firstPlace?.lat || 28.6, firstPlace?.lng || 77.2];
        const focusedPlace = routeState.focusedSeq
            ? placeLookup.get(timeline.find((item) => item.seq === routeState.focusedSeq)?.placeId || '')
            : null;
        return (_jsxs("div", { className: "relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700", children: [_jsxs(MapContainer, { center: center, zoom: 13, scrollWheelZoom: true, className: "h-[460px] md:h-[520px]", attributionControl: false, children: [_jsx(TileLayer, { url: "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png", className: "grayscale dark:opacity-70" }), legs.map((leg) => (_jsx(Polyline, { positions: leg.decodedPolyline, color: leg.color, weight: 6, opacity: 0.85 }, `${leg.from.placeId}-${leg.to.placeId}`))), timeline.map((entry) => {
                            const place = placeLookup.get(entry.placeId);
                            if (!place)
                                return null;
                            return (_jsx(Marker, { position: [place.lat, place.lng], icon: buildMarkerIcon(entry.seq, routeState.focusedSeq === entry.seq), eventHandlers: { click: () => handleMarkerClick(entry.seq) }, children: _jsx(Tooltip, { direction: "top", offset: [0, -20], children: place.name }) }, entry.placeId));
                        }), routeState.userLocation && (_jsx(CircleMarker, { center: [routeState.userLocation.lat, routeState.userLocation.lng], radius: 8, pathOptions: { color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.8 } })), _jsx(MapAutoFit, { legs: legs, fitKey: fitKey, userLocationEnabled: Boolean(routeState.userLocation) }), _jsx(MapFocus, { target: focusedPlace || null })] }), _jsxs("div", { className: "absolute top-4 left-4 flex flex-col md:flex-row gap-3", children: [_jsxs("div", { className: "backdrop-blur bg-white/85 dark:bg-slate-900/70 rounded-2xl shadow-lg px-4 py-3 min-w-[220px] border border-white/60 dark:border-slate-700", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300", children: "Trip Summary" }), _jsx("p", { className: "text-[11px] uppercase tracking-[0.4em] text-slate-400", children: machineState.status }), _jsxs("div", { className: "flex items-center gap-3 mt-2", children: [_jsx(Clock, { className: "text-sky-600", size: 20 }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-slate-900 dark:text-white", children: formatDuration(routeState.routeData?.estimatedDurationMinutes || 0) }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-300", children: etaCountdown || 'ETA syncing' })] })] }), _jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300", children: [_jsx(Navigation2, { size: 16 }), " ", metersToKm(routeState.routeData?.totalDistanceMeters || 0)] })] }), _jsx("div", { className: "flex gap-2", children: travelModes.map((mode) => (_jsxs("button", { onClick: () => handleTravelModeChange(mode.value), className: clsx('flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all border', routeState.travelMode === mode.value
                                    ? 'bg-sky-600 text-white border-sky-500'
                                    : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/70 dark:text-white'), children: [mode.icon, mode.label] }, mode.value))) })] }), _jsxs("div", { className: "absolute bottom-4 right-4 flex flex-col gap-3", children: [_jsx("button", { onClick: handleRecenter, className: "h-12 w-12 rounded-full bg-white text-slate-700 shadow-xl flex items-center justify-center border border-slate-200 hover:scale-105", "aria-label": "Recenter map", children: _jsx(Compass, {}) }), _jsx("button", { onClick: () => handleOptimize(), className: "h-12 w-12 rounded-full bg-sky-600 text-white shadow-xl flex items-center justify-center", "aria-label": "Refresh route", children: _jsx(RefreshCw, {}) })] }), routeState.status === 'loading' && (_jsx(motion.div, { className: "absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400", initial: { scaleX: 0 }, animate: { scaleX: 1 }, exit: { scaleX: 0 }, transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }, style: { transformOrigin: 'left center' } }))] }));
    };
    const renderTimeline = () => (_jsx("div", { className: "space-y-6", children: timeline.map((entry, index) => {
            const place = placeLookup.get(entry.placeId);
            const inboundLeg = legs.find((leg) => leg.to.placeId === entry.placeId);
            const outboundLeg = legs.find((leg) => leg.from.placeId === entry.placeId);
            return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold shadow-md", children: entry.seq }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-slate-900 dark:text-white", children: place?.name }), _jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-300", children: [formatTime(entry.arrivalTime), " \u2192 ", formatTime(entry.departureTime)] })] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-3 gap-3 text-sm", children: [_jsxs("div", { className: "bg-slate-50 dark:bg-slate-800 rounded-xl p-3", children: [_jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Arrival" }), _jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: formatTime(entry.arrivalTime) })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-800 rounded-xl p-3", children: [_jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Departure" }), _jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: formatTime(entry.departureTime) })] }), _jsxs("div", { className: "bg-slate-50 dark:bg-slate-800 rounded-xl p-3", children: [_jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Visit" }), _jsxs("p", { className: "font-semibold text-slate-900 dark:text-white", children: [entry.visitDurationMinutes, " min"] })] })] }), outboundLeg && (_jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: travelModeIcons[outboundLeg.travelType] || '➡️' }), _jsx("span", { className: "font-medium text-slate-700 dark:text-white", children: outboundLeg.travelType.toUpperCase() })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { children: formatDuration(Math.round(outboundLeg.travelTimeSeconds / 60)) }), _jsx("span", { children: metersToKm(outboundLeg.distanceMeters) })] })] }))] }, entry.placeId));
        }) }));
    const renderInstructions = () => (_jsx("div", { className: "space-y-4", children: legs.map((leg, idx) => (_jsxs("div", { className: "rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300", children: ["Leg ", idx + 1] }), _jsxs("p", { className: "font-semibold text-slate-900 dark:text-white", children: [leg.from.name, " \u2192 ", leg.to.name] })] }), _jsxs("div", { className: "flex gap-2 text-sm text-slate-500 dark:text-slate-300", children: [_jsx("span", { children: formatDuration(Math.round(leg.travelTimeSeconds / 60)) }), _jsx("span", { children: metersToKm(leg.distanceMeters) })] })] }), _jsx("div", { className: "mt-3 space-y-2", children: leg.steps.map((step, index) => (_jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2", children: [_jsx("span", { className: "text-lg", children: travelModeIcons[step.mode] || '➡️' }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-slate-900 dark:text-white", children: [step.mode === 'fallback' ? 'Walk' : step.mode, " ", metersToKm(step.distanceMeters)] }), _jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-300", children: ["~", formatDuration(Math.round(step.durationSeconds / 60))] })] })] }, `${step.mode}-${index}`))) })] }, `${leg.from.placeId}-${leg.to.placeId}`))) }));
    const renderBottomSheet = () => (_jsx(AnimatePresence, { children: activeSheetEntry && (_jsx(motion.div, { className: "fixed inset-x-0 bottom-0 z-40", initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'spring', stiffness: 120, damping: 20 }, children: _jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-t-[28px] shadow-[0_-20px_60px_rgba(15,23,42,0.35)] p-6 border border-slate-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto", children: [_jsx("div", { className: "w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs uppercase text-slate-400", children: ["Stop ", activeSheetEntry.seq] }), _jsx("h3", { className: "text-2xl font-semibold text-slate-900 dark:text-white", children: placeLookup.get(activeSheetEntry.placeId)?.name }), _jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-300", children: [formatTime(activeSheetEntry.arrivalTime), " \u2192 ", formatTime(activeSheetEntry.departureTime)] })] }), _jsx("button", { onClick: handleSheetClose, className: "text-slate-400", children: "Close" })] }), _jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "rounded-2xl bg-slate-50 dark:bg-slate-800 p-3", children: [_jsx("p", { className: "text-xs text-slate-500 dark:text-slate-300", children: "Visit Duration" }), _jsxs("p", { className: "text-lg font-semibold text-slate-900 dark:text-white", children: [activeSheetEntry.visitDurationMinutes, " minutes"] })] }), _jsxs("div", { className: "rounded-2xl bg-slate-50 dark:bg-slate-800 p-3", children: [_jsx("p", { className: "text-xs text-slate-500 dark:text-slate-300", children: "Travel Type" }), _jsx("p", { className: "text-lg font-semibold text-slate-900 dark:text-white", children: legForSheet?.travelType.toUpperCase() ?? 'WALK' })] })] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3", children: [_jsxs("button", { className: "w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2", onClick: () => {
                                    const place = placeLookup.get(activeSheetEntry.placeId);
                                    if (place) {
                                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
                                        window.open(url, '_blank');
                                    }
                                }, children: [_jsx(Info, { size: 18 }), " View Details"] }), _jsxs("button", { className: "w-full py-3 rounded-2xl bg-sky-600 text-white font-semibold flex items-center justify-center gap-2", onClick: () => {
                                    const place = placeLookup.get(activeSheetEntry.placeId);
                                    if (place) {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                                        window.open(url, '_blank');
                                    }
                                }, children: [_jsx(Navigation2, { size: 18 }), " Start Navigation"] })] })] }) })) }));
    return (_jsxs("section", { className: "space-y-10 mt-10", children: [_jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-[0.4em] text-slate-400", children: "Route Optimizer" }), _jsx("h2", { className: "text-3xl md:text-4xl font-bold text-slate-900 dark:text-white", children: "Immersive Journey Preview" }), _jsx("p", { className: "text-slate-500 dark:text-slate-300", children: "Visualize the optimized path, timeline, and step-by-step guidance." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => handleOptimize(), className: "px-6 py-3 rounded-full bg-sky-600 text-white font-semibold shadow-lg flex items-center gap-2", children: [_jsx(RouteIcon, { size: 18 }), " Optimize Again"] }), _jsxs("button", { onClick: handleShare, className: "px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold flex items-center gap-2", children: [_jsx(Share2, { size: 18 }), " Share Plan"] })] })] }), shareMessage && (_jsxs("div", { className: "rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 flex items-center gap-2", children: [_jsx(ShieldCheck, { size: 18 }), " ", shareMessage] })), routeState.status === 'loading' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse", "aria-live": "polite", children: [_jsx("div", { className: "h-40 rounded-3xl bg-slate-100 dark:bg-slate-800" }), _jsx("div", { className: "h-40 rounded-3xl bg-slate-100 dark:bg-slate-800" })] })), renderMap(), _jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-semibold text-slate-900 dark:text-white mb-4", children: "Timeline" }), renderTimeline()] }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-semibold text-slate-900 dark:text-white mb-4", children: "Turn-by-turn" }), renderInstructions()] })] }), _jsx("div", { className: "sticky bottom-4 z-30", children: _jsxs("div", { className: "rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-2xl border border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-300", children: "Ready to go?" }), _jsx("p", { className: "text-lg font-semibold text-slate-900 dark:text-white", children: "Start navigation or share the plan with friends." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => {
                                        const last = timeline[timeline.length - 1];
                                        const place = last ? placeLookup.get(last.placeId) : null;
                                        if (place) {
                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                                            window.open(url, '_blank');
                                        }
                                    }, className: "px-5 py-3 rounded-full bg-sky-600 text-white font-semibold flex items-center gap-2", children: [_jsx(Navigation2, { size: 18 }), " Start Navigation"] }), _jsxs("button", { onClick: handleShare, className: "px-5 py-3 rounded-full bg-slate-900 text-white font-semibold flex items-center gap-2", children: [_jsx(Share2, { size: 18 }), " Share"] })] })] }) }), renderBottomSheet()] }));
};
export default RouteOptimizerExperience;
