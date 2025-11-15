import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
const MapComponent = ({ lat, lon }) => {
    const position = [lat, lon]; // ✅ Ensure correct type
    return (_jsxs(MapContainer, { center: position, zoom: 13, style: { height: "300px", width: "100%" }, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(TileLayer, { url: "https://tiles.stadiamaps.com/tiles/satellite/{z}/{x}/{y}{r}.jpg" }), _jsx(Marker, { position: position, children: _jsx(Popup, { children: "Selected Location" }) })] }));
};
export default MapComponent;
