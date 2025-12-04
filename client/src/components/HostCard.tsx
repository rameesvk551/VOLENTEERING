import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Heart, Users, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import ContactHostButton from "./ContactHostButton";

interface HostCardProps {
  host: Host;
}

const HostCard: React.FC<HostCardProps> = ({ host }) => {
  const projectNames = host?.selectedHelpTypes?.slice(0, 2);
  const extractPlace = host?.address?.display_name
    ? host.address.display_name.split(",").map((part) => part.trim())
    : [];

  const country = extractPlace[extractPlace?.length - 1];
  const city = extractPlace[0];

  // Calculate average rating
  const avgRating =
    host?.reviews?.length > 0
      ? (
          host.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          host.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <Link
          to={`/host-details/${host._id}`}
          className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden"
        >
          <img
            src={host?.images?.[0]?.url}
            alt={host?.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Wishlist button */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
            aria-label="Save to wishlist"
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-primary" />
          </button>

          {/* Badge for host type */}
          {projectNames?.[0] && (
            <Badge
              variant="secondary"
              className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-xs font-medium"
            >
              {projectNames[0]}
            </Badge>
          )}
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          {/* Location & Rating Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">
                {city && city !== country ? `${city}, ` : ""}
                {country}
              </span>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{avgRating}</span>
                <span className="text-xs text-muted-foreground">
                  ({host?.reviews?.length})
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/host-details/${host._id}`}>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {host?.heading || "Volunteer in an off‑grid community"}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {host?.description?.replace(/[#*]/g, "").slice(0, 120)}...
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {projectNames?.map((tag: string, index: number) => (
              <Badge key={index} variant="muted" className="text-xs">
                {tag}
              </Badge>
            ))}
            {host?.acceptedWorkawayersCount && (
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {host.acceptedWorkawayersCount} volunteers
              </Badge>
            )}
          </div>

          {/* CTA Section */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <ContactHostButton hostId={host?._id} />
            <Link to={`/host-details/${host._id}`}>
              <Button variant="ghost" size="sm" className="text-primary">
                View Details →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostCard;