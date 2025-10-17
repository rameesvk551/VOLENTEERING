import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet"; // ✅ Explicit import
import "leaflet/dist/leaflet.css";

type MapProps = {
  lat: number;
  lon: number;
};

const MapComponent: React.FC<MapProps> = ({ lat, lon }) => {
  const position: LatLngExpression = [lat, lon]; // ✅ Ensure correct type

  return (
    <MapContainer
      center={position as [number, number]}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      {/* OpenStreetMap Default Map */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* OpenAerialMap (Satellite View) */}
      <TileLayer url="https://tiles.stadiamaps.com/tiles/satellite/{z}/{x}/{y}{r}.jpg" />

      <Marker position={position as [number, number]}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
