import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import haversine from 'haversine-distance';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
const TripMap = () => {
    const { selectedPlace } = useSelector((state) => state.attractions);
    const [userLocation, setUserLocation] = useState(null);
    const [sortedPlaces, setSortedPlaces] = useState([]);
    // Get user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        }, (err) => console.error('Error getting location:', err), { enableHighAccuracy: true });
    }, []);
    // Sort places once we have user location
    useEffect(() => {
        if (userLocation && selectedPlace.length > 0) {
            const sorted = sortPlacesByDistance(userLocation, selectedPlace);
            setSortedPlaces(sorted);
        }
    }, [userLocation, selectedPlace]);
    // Helper to sort locations by distance
    const sortPlacesByDistance = (userLocation, places) => {
        const sorted = [];
        const unvisited = [...places];
        let current = {
            place: 'You',
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
        };
        while (unvisited.length > 0) {
            let nearestIndex = 0;
            let minDistance = Infinity;
            for (let i = 0; i < unvisited.length; i++) {
                const distance = haversine({ lat: current.latitude, lon: current.longitude }, { lat: unvisited[i].latitude, lon: unvisited[i].longitude });
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = i;
                }
            }
            const nearest = unvisited.splice(nearestIndex, 1)[0];
            sorted.push(nearest);
            current = nearest;
        }
        return sorted;
    };
    const polylinePositions = [userLocation, ...sortedPlaces].map((p) => [p?.latitude, p?.longitude]);
    return (_jsxs("div", { className: "max-w-6xl mx-auto pt-2 pb-6 px-4", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "\uD83D\uDDFA\uFE0F Your Trip Plan" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "md:col-span-2", children: _jsx("div", { className: "h-[500px] rounded-xl shadow-lg overflow-hidden", children: userLocation && (_jsxs(MapContainer, { center: [userLocation.latitude, userLocation.longitude], zoom: 8, scrollWheelZoom: true, className: "h-full w-full", children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://osm.org/copyright">OpenStreetMap</a>', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), [userLocation, ...sortedPlaces].map((place, idx) => (_jsx(Marker, { position: [place.latitude, place.longitude], children: _jsx(Popup, { children: idx === 0 ? "Your Location" : sortedPlaces[idx - 1].place }) }, idx))), _jsx(Polyline, { positions: polylinePositions, pathOptions: { color: 'blue', weight: 4 } })] })) }) }), _jsx("div", { className: "md:col-span-1", children: _jsx("ol", { className: "space-y-4 max-h-[500px] overflow-y-auto pr-2", children: sortedPlaces.map((place, index) => {
                                const prev = index === 0 ? userLocation : sortedPlaces[index - 1];
                                const distance = haversine({ lat: prev?.latitude, lon: prev.longitude }, { lat: place?.latitude, lon: place.longitude });
                                return (_jsx("li", { className: "bg-white p-4 shadow rounded-xl hover:bg-gray-50 transition", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full font-bold", children: index + 1 }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-semibold", children: place.place }), _jsxs("p", { className: "text-sm text-gray-500", children: [(distance / 1000).toFixed(2), " km from ", prev?.place || 'Current Location'] })] })] }) }, place.place));
                            }) }) })] })] }));
};
export default TripMap;
