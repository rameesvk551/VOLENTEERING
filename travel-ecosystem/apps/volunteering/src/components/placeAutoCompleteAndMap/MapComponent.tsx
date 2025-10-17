import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapProps = {
  lat: number;
  lon: number;
};

const MapComponent: React.FC<MapProps> = ({ lat, lon }) => {
  const position: LatLngExpression = [lat, lon];

  return (
    <MapContainer center={position as [number, number]} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <TileLayer url="https://tiles.stadiamaps.com/tiles/satellite/{z}/{x}/{y}{r}.jpg" />
      <Marker position={position as [number, number]}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
