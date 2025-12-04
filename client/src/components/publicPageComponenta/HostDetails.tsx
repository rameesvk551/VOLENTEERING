import React, { useEffect, useState } from "react";
import {
  MapPin,
  Share2,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchHostById } from "../../api";
import Review from "../hostDetailsPageComponents/Review";
import OverviewSection from "../hostDetailsPageComponents/OverviewSection";
import PhotosSection from "../hostDetailsPageComponents/PhotosSection";
import MapComponent from "../placeAutoCompleteAndMap/MapComponent";
import useAddReview from "@/hooks/UseAddReview";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import HostDetailsScelton from "./HostDetailsScelton";
import HostDetailsErrorPage from "./HostDetailsErrorPage";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const HostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);
  const navigate = useNavigate();

  const calculateAverageRating = (reviews: { rating: number }[] = []) => {
    if (reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const tabs = [
    { id: 1, label: "Overview" },
    { id: 2, label: "Photos" },
    { id: 3, label: "Location" },
    { id: 4, label: `Reviews (${host?.reviews?.length || 0})` },
  ];

  const formatDate = (isoDate: string | Date): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const goToMessage = () => {
    navigate(`/message/${id}`);
  };

  useEffect(() => {
    if (id) {
      fetchHostById(id)
        .then((data) => {
          setHost(data.host);
        })
        .catch(() => setError("Failed to fetch host details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <HostDetailsScelton />;
  if (error || !host) return <HostDetailsErrorPage error={error || "Host not found"} />;

  const latitude = host.address?.lat;
  const longitude = host.address?.lon;

  const extractPlace = host.address?.display_name?.split(",").map((part: string) => part.trim()) || [];
  const state = extractPlace[extractPlace.length - 3];
  const country = extractPlace[extractPlace.length - 1];
  const avgRating = calculateAverageRating(host.reviews);

  const nextImage = () => {
    if (host.images && host.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % host.images.length);
    }
  };

  const prevImage = () => {
    if (host.images && host.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + host.images.length) % host.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image Gallery */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[500px]">
            {/* Main Image */}
            <div className="md:col-span-2 md:row-span-2 relative group">
              <img
                src={host.images?.[0]?.url}
                alt={host.images?.[0]?.description || "Host location"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Secondary Images */}
            {host.images?.slice(1, 5).map((img: { url: string; description?: string }, i: number) => (
              <div key={i} className="relative hidden md:block group">
                <img
                  src={img.url}
                  alt={img.description || `Image ${i + 2}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}

            {/* Show All Photos Button */}
            {host.images && host.images.length > 5 && (
              <button
                onClick={() => setActiveTab(2)}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Show all {host.images.length} photos
              </button>
            )}
          </div>

          {/* Mobile Image Carousel */}
          <div className="md:hidden relative mt-4">
            <div className="flex overflow-x-auto gap-2 snap-x snap-mandatory hide-scrollbar">
              {host.images?.map((img: { url: string; description?: string }, i: number) => (
                <div key={i} className="shrink-0 w-3/4 snap-center">
                  <img
                    src={img.url}
                    alt={img.description || `Image ${i + 1}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {host.selectedHelpTypes?.slice(0, 3).map((type: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {host.heading || "Volunteer with us and create lasting memories"}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {country}
                    {state && `, ${state}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-gray-400">({host.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Last active: {formatDate(host.lastActive)}</span>
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Host
                </Badge>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 1 && <OverviewSection host={host} />}
              {activeTab === 2 && <PhotosSection images={host.images} />}
              {activeTab === 3 && (
                <div className="h-[400px] rounded-xl overflow-hidden">
                  <MapComponent lat={latitude} lon={longitude} />
                </div>
              )}
              {activeTab === 4 && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900">{avgRating}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(parseFloat(avgRating))
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {host.reviews?.length || 0} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {host.reviews?.map((review: { id: string; rating: number; comment: string; reviewerProfile: string; reviewerName: string }) => (
                    <Review
                      key={review.id}
                      rating={review.rating}
                      comment={review.comment}
                      reviewerProfile={review.reviewerProfile}
                      reviewerName={review.reviewerName}
                    />
                  ))}

                  {/* Write Review Button */}
                  {volenteerData?.user && (
                    <Button onClick={() => setShowReviewModal(true)} className="mt-6">
                      Write a Review
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
                {/* Host Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <img
                    src={host.profileImage || `https://ui-avatars.com/api/?name=${host.firstName || "Host"}&background=random`}
                    alt={host.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {host.firstName} {host.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Host since 2023</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {host.acceptedWorkawayersCount || "1-2"}
                    </p>
                    <p className="text-xs text-gray-500">Volunteers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {host.minimumStay || "2 weeks"}
                    </p>
                    <p className="text-xs text-gray-500">Min. Stay</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button onClick={goToMessage} className="w-full" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Heart className="w-4 h-4 mr-2" />
                    Save to Wishlist
                  </Button>
                  <Button variant="ghost" className="w-full" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Response Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Response rate</span>
                    <span className="font-medium text-gray-900">95%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Response time</span>
                    <span className="font-medium text-gray-900">Within a day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Contact</p>
            <p className="font-semibold text-gray-900">{host.firstName}</p>
          </div>
          <Button onClick={goToMessage} size="lg">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-xl p-6 animate-scale-in">
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setShowReviewModal(false)}
            >
              ✕
            </button>
            {volenteerData?.user ? (
              <WriteReview hostId={host._id} onClose={() => setShowReviewModal(false)} />
            ) : (
              <p className="text-center text-gray-600 py-8">
                Please log in to write a review.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDetails;

// Write Review Component
type WriteReviewProps = {
  hostId: string;
  onClose: () => void;
};

const WriteReview = ({ hostId, onClose }: WriteReviewProps) => {
  const addReview = useAddReview();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview.mutate({ rating, comment: review, hostId });
    onClose();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hoveredRating ?? rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Experience
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            placeholder="Share your experience with this host..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" loading={addReview.isPending}>
          Submit Review
        </Button>
      </form>
    </div>
  );
};

