import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  CircleMarker,
  useMap
} from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWalking, FaCarAlt } from 'react-icons/fa';
import { MdOutlineTrain } from 'react-icons/md';
import {
  Navigation2,
  Clock,
  Compass,
  RefreshCw,
  Share2,
  Route as RouteIcon,
  Info,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

import { RootState, AppDispatch } from '@/redux/store';
import { optimizeRoute } from '@/redux/thunks/routeOptimizerThunk';
import {
  setBottomSheetSeq,
  setFocusedSeq,
  setTravelMode,
  setUserLocation
} from '@/redux/Slices/routeOptimizerSlice';
import { useRouteExperienceMachine } from '@/hooks/useRouteExperienceMachine';
import { decorateLegs, formatDuration, metersToKm, formatTime, travelModeIcons } from '@/lib/route/utils';
import type { TravelMode } from '@/types/route';

const travelModes: Array<{ label: string; value: TravelMode; icon: React.ReactNode; helper: string }> = [
  { label: 'Walking', value: 'WALKING', icon: <FaWalking className="text-sky-600" />, helper: 'Best for short hops' },
  { label: 'Driving', value: 'DRIVING', icon: <FaCarAlt className="text-emerald-500" />, helper: 'Fastest ETA' },
  { label: 'Transit', value: 'TRANSIT', icon: <MdOutlineTrain className="text-indigo-500" />, helper: 'Metro + bus mix' }
];

type DecoratedLeg = ReturnType<typeof decorateLegs>[number];

type MapAutoFitProps = {
  legs: DecoratedLeg[];
  fitKey: number;
  userLocationEnabled: boolean;
};

const MapAutoFit: React.FC<MapAutoFitProps> = ({ legs, fitKey, userLocationEnabled }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !legs.length) return;
    const bounds: LatLngBoundsExpression = [
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

const MapFocus: React.FC<{ target: { lat: number; lng: number } | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 1.2 });
  }, [map, target]);

  return null;
};

const buildMarkerIcon = (seq: number, isActive: boolean) =>
  L.divIcon({
    html: `<div class="shadow-lg rounded-full h-12 w-12 flex items-center justify-center font-semibold ${
      isActive ? 'bg-sky-600 text-white scale-105' : 'bg-white text-slate-900'
    } border-2 ${isActive ? 'border-sky-300' : 'border-slate-200'} dark:bg-slate-800 dark:text-white">
        ${seq}
      </div>`,
    className: 'route-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

const RouteOptimizerExperience: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPlace } = useSelector((state: RootState) => state.attractions);
  const routeState = useSelector((state: RootState) => state.routeOptimizer);
  const { state: machineState, send } = useRouteExperienceMachine();

  const [fitKey, setFitKey] = useState(0);
  const [etaCountdown, setEtaCountdown] = useState<string>('');
  const [shareMessage, setShareMessage] = useState<string>('');
  const messageTimeout = useRef<NodeJS.Timeout | null>(null);

  const pushMessage = useCallback((message: string) => {
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
    const map = new Map(
      legs.flatMap((leg) => [
        [leg.from.placeId, leg.from],
        [leg.to.placeId, leg.to]
      ])
    );
    return map;
  }, [legs]);

  const handleOptimize = useCallback(
    (mode?: TravelMode) => {
      if (selectedPlace.length < 2) {
        pushMessage('Select at least two attractions to build a route.');
        return;
      }

      const nextMode = mode || routeState.travelMode;
      dispatch(optimizeRoute({ travelMode: nextMode, places: selectedPlace }));
      send({ type: 'OPTIMIZE' });
    },
    [dispatch, routeState.travelMode, selectedPlace, send, pushMessage]
  );

  const handleTravelModeChange = (mode: TravelMode) => {
    dispatch(setTravelMode(mode));
    handleOptimize(mode);
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    send({ type: 'LOCATE' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        );
        send({ type: 'LOCATE_SUCCESS' });
      },
      (error) => {
        console.warn('Geolocation blocked', error?.message);
        send({ type: 'LOCATE_ERROR', message: error?.message || 'Location unavailable' });
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
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
    if (!routeState.etaTicker) return;
    const updateCountdown = () => {
      const now = Date.now();
      const { startsAt, endsAt } = routeState.etaTicker!;
      if (now < startsAt) {
        const diff = Math.max(0, startsAt - now);
        const minutes = Math.round(diff / 60000);
        setEtaCountdown(`Trip starts in ${formatDuration(minutes)}`);
      } else if (now <= endsAt) {
        const diff = Math.max(0, endsAt - now);
        const minutes = Math.round(diff / 60000);
        setEtaCountdown(`Ends in ${formatDuration(minutes)}`);
      } else {
        setEtaCountdown('Trip finished');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [routeState.etaTicker]);

  const handleMarkerClick = (seq: number) => {
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
    } else if (routeState.routeData) {
      const summary = `Trip from ${routeState.routeData.summary.startsAt} to ${routeState.routeData.summary.endsAt}`;
      navigator.clipboard?.writeText(summary);
      pushMessage('Trip summary copied to clipboard');
    }
  };

  const activeSheetEntry = routeState.routeData?.timeline.find(
    (entry) => entry.seq === routeState.bottomSheetSeq
  );

  const legForSheet = legs.find((leg) => leg.from.seq === activeSheetEntry?.seq);

  const renderMap = () => {
    if (!legs.length) {
      return (
        <div className="h-[420px] w-full rounded-3xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600">
          <div className="text-center space-y-3">
            <RouteIcon className="mx-auto text-slate-400" />
            <p className="text-slate-500 dark:text-slate-300 font-medium">Generate a route to unlock the live map.</p>
            <button
              onClick={() => handleOptimize()}
              className="px-6 py-3 rounded-full bg-sky-600 text-white font-semibold shadow-lg"
            >
              Optimize Now
            </button>
          </div>
        </div>
      );
    }

    const firstPlace = timeline[0]?.placeId ? placeLookup.get(timeline[0].placeId) : legs[0]?.from;
    const center: [number, number] = [firstPlace?.lat || 28.6, firstPlace?.lng || 77.2];
    const focusedPlace = routeState.focusedSeq
      ? placeLookup.get(timeline.find((item) => item.seq === routeState.focusedSeq)?.placeId || '')
      : null;

    return (
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          className="h-[460px] md:h-[520px]"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
            className="grayscale dark:opacity-70"
          />

          {legs.map((leg) => (
            <Polyline
              key={`${leg.from.placeId}-${leg.to.placeId}`}
              positions={leg.decodedPolyline}
              color={leg.color}
              weight={6}
              opacity={0.85}
            />
          ))}

          {timeline.map((entry) => {
            const place = placeLookup.get(entry.placeId);
            if (!place) return null;
            return (
              <Marker
                key={entry.placeId}
                position={[place.lat, place.lng]}
                icon={buildMarkerIcon(entry.seq, routeState.focusedSeq === entry.seq)}
                eventHandlers={{ click: () => handleMarkerClick(entry.seq) }}
              >
                <Tooltip direction="top" offset={[0, -20]}>{place.name}</Tooltip>
              </Marker>
            );
          })}

          {routeState.userLocation && (
            <CircleMarker
              center={[routeState.userLocation.lat, routeState.userLocation.lng]}
              radius={8}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.8 }}
            />
          )}

          <MapAutoFit legs={legs} fitKey={fitKey} userLocationEnabled={Boolean(routeState.userLocation)} />
          <MapFocus target={focusedPlace || null} />
        </MapContainer>

        <div className="absolute top-4 left-4 flex flex-col md:flex-row gap-3">
          <div className="backdrop-blur bg-white/85 dark:bg-slate-900/70 rounded-2xl shadow-lg px-4 py-3 min-w-[220px] border border-white/60 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Trip Summary</p>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">{machineState.status}</p>
            <div className="flex items-center gap-3 mt-2">
              <Clock className="text-sky-600" size={20} />
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatDuration(routeState.routeData?.estimatedDurationMinutes || 0)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{etaCountdown || 'ETA syncing'}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <Navigation2 size={16} /> {metersToKm(routeState.routeData?.totalDistanceMeters || 0)}
            </div>
          </div>

          <div className="flex gap-2">
            {travelModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleTravelModeChange(mode.value)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all border',
                  routeState.travelMode === mode.value
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/70 dark:text-white'
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-3">
          <button
            onClick={handleRecenter}
            className="h-12 w-12 rounded-full bg-white text-slate-700 shadow-xl flex items-center justify-center border border-slate-200 hover:scale-105"
            aria-label="Recenter map"
          >
            <Compass />
          </button>
          <button
            onClick={() => handleOptimize()}
            className="h-12 w-12 rounded-full bg-sky-600 text-white shadow-xl flex items-center justify-center"
            aria-label="Refresh route"
          >
            <RefreshCw />
          </button>
        </div>

        {routeState.status === 'loading' && (
          <motion.div
            className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left center' }}
          />
        )}
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="space-y-6">
      {timeline.map((entry, index) => {
        const place = placeLookup.get(entry.placeId);
        const inboundLeg = legs.find((leg) => leg.to.placeId === entry.placeId);
        const outboundLeg = legs.find((leg) => leg.from.placeId === entry.placeId);
        return (
          <motion.div
            key={entry.placeId}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold shadow-md">
                {entry.seq}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{place?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{formatTime(entry.arrivalTime)} → {formatTime(entry.departureTime)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Arrival</p>
                <p className="font-semibold text-slate-900 dark:text-white">{formatTime(entry.arrivalTime)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Departure</p>
                <p className="font-semibold text-slate-900 dark:text-white">{formatTime(entry.departureTime)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Visit</p>
                <p className="font-semibold text-slate-900 dark:text-white">{entry.visitDurationMinutes} min</p>
              </div>
            </div>

            {outboundLeg && (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span>{travelModeIcons[outboundLeg.travelType] || '➡️'}</span>
                  <span className="font-medium text-slate-700 dark:text-white">{outboundLeg.travelType.toUpperCase()}</span>
                </div>
                <div className="flex gap-4">
                  <span>{formatDuration(Math.round(outboundLeg.travelTimeSeconds / 60))}</span>
                  <span>{metersToKm(outboundLeg.distanceMeters)}</span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  const renderInstructions = () => (
    <div className="space-y-4">
      {legs.map((leg, idx) => (
        <div key={`${leg.from.placeId}-${leg.to.placeId}`} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Leg {idx + 1}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{leg.from.name} → {leg.to.name}</p>
            </div>
            <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-300">
              <span>{formatDuration(Math.round(leg.travelTimeSeconds / 60))}</span>
              <span>{metersToKm(leg.distanceMeters)}</span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {leg.steps.map((step, index) => (
              <div key={`${step.mode}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
                <span className="text-lg">{travelModeIcons[step.mode] || '➡️'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {step.mode === 'fallback' ? 'Walk' : step.mode} {metersToKm(step.distanceMeters)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">~{formatDuration(Math.round(step.durationSeconds / 60))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBottomSheet = () => (
    <AnimatePresence>
      {activeSheetEntry && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-t-[28px] shadow-[0_-20px_60px_rgba(15,23,42,0.35)] p-6 border border-slate-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
            <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-400">Stop {activeSheetEntry.seq}</p>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{placeLookup.get(activeSheetEntry.placeId)?.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {formatTime(activeSheetEntry.arrivalTime)} → {formatTime(activeSheetEntry.departureTime)}
                </p>
              </div>
              <button onClick={handleSheetClose} className="text-slate-400">Close</button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-300">Visit Duration</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{activeSheetEntry.visitDurationMinutes} minutes</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-300">Travel Type</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {legForSheet?.travelType.toUpperCase() ?? 'WALK'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                className="w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2"
                onClick={() => {
                  const place = placeLookup.get(activeSheetEntry.placeId);
                  if (place) {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
                    window.open(url, '_blank');
                  }
                }}
              >
                <Info size={18} /> View Details
              </button>
              <button
                className="w-full py-3 rounded-2xl bg-sky-600 text-white font-semibold flex items-center justify-center gap-2"
                onClick={() => {
                  const place = placeLookup.get(activeSheetEntry.placeId);
                  if (place) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                    window.open(url, '_blank');
                  }
                }}
              >
                <Navigation2 size={18} /> Start Navigation
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section className="space-y-10 mt-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Route Optimizer</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Immersive Journey Preview</h2>
          <p className="text-slate-500 dark:text-slate-300">Visualize the optimized path, timeline, and step-by-step guidance.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOptimize()}
            className="px-6 py-3 rounded-full bg-sky-600 text-white font-semibold shadow-lg flex items-center gap-2"
          >
            <RouteIcon size={18} /> Optimize Again
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold flex items-center gap-2"
          >
            <Share2 size={18} /> Share Plan
          </button>
        </div>
      </div>

      {shareMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 flex items-center gap-2">
          <ShieldCheck size={18} /> {shareMessage}
        </div>
      )}

      {routeState.status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse" aria-live="polite">
          <div className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>
      )}

      {renderMap()}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Timeline</h3>
          {renderTimeline()}
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Turn-by-turn</h3>
          {renderInstructions()}
        </div>
      </div>

      <div className="sticky bottom-4 z-30">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-2xl border border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">Ready to go?</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Start navigation or share the plan with friends.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const last = timeline[timeline.length - 1];
                const place = last ? placeLookup.get(last.placeId) : null;
                if (place) {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                  window.open(url, '_blank');
                }
              }}
              className="px-5 py-3 rounded-full bg-sky-600 text-white font-semibold flex items-center gap-2"
            >
              <Navigation2 size={18} /> Start Navigation
            </button>
            <button
              onClick={handleShare}
              className="px-5 py-3 rounded-full bg-slate-900 text-white font-semibold flex items-center gap-2"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </div>

      {renderBottomSheet()}
    </section>
  );
};

export default RouteOptimizerExperience;
