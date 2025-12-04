import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SearchWithFilter from '../../components/travelPlanning/SearchWithFilter';
import SuggestedPlace from '@/components/travelPlanning/SuggestedPlace';
import 'leaflet/dist/leaflet.css';
import TripMap from '@/components/travelPlanning/TripMap';
import { useSelector } from 'react-redux';
const PlanYourTrip = () => {
    const { searchedPlace, selectedPlace } = useSelector((state) => state.attractions);
    return (_jsx("div", { className: "bg-gradient-to-b from-blue-50 to-white", children: _jsx("div", { className: "py-10 px-6 sm:px-10", children: _jsx("div", { className: "mx-auto", children: _jsxs("div", { className: "md:flex-row gap-8", children: [(!searchedPlace || searchedPlace.length === 0) &&
                            (!selectedPlace || selectedPlace.length === 0) && (_jsx(SearchWithFilter, {})), searchedPlace && searchedPlace.length > 0 && (_jsx(SuggestedPlace, {})), selectedPlace && selectedPlace.length > 0 && (_jsx(TripMap, {}))] }) }) }) }));
};
export default PlanYourTrip;
