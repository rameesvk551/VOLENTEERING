import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SearchWithFilter from '../../components/travelPlanning/SearchWithFilter';
import SuggestedPlace from '@/components/travelPlanning/SuggestedPlace';
import RouteOptimizerExperience from '@/components/travelPlanning/route-experience/RouteOptimizerExperience';
import { useSelector } from 'react-redux';
const PlanYourTrip = () => {
    const { searchedPlace } = useSelector((state) => state.attractions);
    return (_jsxs("div", { className: "bg-gradient-to-b from-blue-50 to-white", children: [_jsx("div", { className: "py-10 px-6 sm:px-10", children: _jsx("div", { className: "mx-auto", children: _jsxs("div", { className: "md:flex-row gap-8", children: [(!searchedPlace || searchedPlace.length === 0) && (_jsx(SearchWithFilter, {})), searchedPlace && searchedPlace.length > 0 && (_jsx(SuggestedPlace, {}))] }) }) }), _jsx("div", { className: "pt-6 pb-12 px-0 sm:px-4", children: _jsx(RouteOptimizerExperience, {}) })] }));
};
export default PlanYourTrip;
