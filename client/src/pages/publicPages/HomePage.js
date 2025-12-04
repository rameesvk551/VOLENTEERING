import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import FeaturesSection from '../../components/HomeComponents/FeaturesSection';
import HeroSection from '../../components/HomeComponents/HeroSection';
import CallToActionSection from '../../components/HomeComponents/CallToActionSection';
import DiscoverSection from '../../components/HomeComponents/DiscoverSection';
import BlogSection from '../../components/HomeComponents/BlogSection';
const HomePage = () => {
    return (_jsxs("div", { className: ' bg-gradient-to-b from-blue-100 to-white ', children: [_jsx(HeroSection, {}), _jsx(FeaturesSection, {}), _jsx(DiscoverSection, {}), _jsx(BlogSection, {}), _jsx(CallToActionSection, {})] }));
};
export default HomePage;
