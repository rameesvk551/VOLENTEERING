import { motion } from 'framer-motion';
import { Bookmark, GitCompare, ArrowRight, Clock, DollarSign, Calendar } from 'lucide-react';
import { VisaInfo } from '../../types/visa.types';
import Button from '../atoms/Button';
import { cn, getVisaTypeColor, getVisaTypeLabel, getComplexityLevel, formatCurrency } from '../../lib/utils';

interface VisaCardProps {
  visa: VisaInfo;
  onViewDetails?: () => void;
  onSave?: () => void;
  onCompare?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
}

/**
 * VisaCard Component - Molecule
 *
 * Displays visa information in a card format with:
 * - Country flag and name
 * - Visa type badge
 * - Key details (stay, fees, processing time)
 * - Complexity score
 * - Action buttons (save, compare)
 *
 * UX Features:
 * - Hover lift effect
 * - Smooth animations
 * - Color-coded visa status
 * - Mobile-optimized touch targets
 */
const VisaCard: React.FC<VisaCardProps> = ({
  visa,
  onViewDetails,
  onSave,
  onCompare,
  isSaved = false,
  isComparing = false,
}) => {
  const complexity = getComplexityLevel(visa.complexityScore);
  const visaTypeColor = getVisaTypeColor(visa.visaType);
  const visaTypeLabel = getVisaTypeLabel(visa.visaType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-white dark:bg-gray-800',
        'rounded-xl p-6',
        'border border-gray-200 dark:border-gray-700',
        'shadow-card hover:shadow-card-hover',
        'cursor-pointer transition-all',
        'group'
      )}
      onClick={onViewDetails}
    >
      {/* Header - Flag and Visa Status */}
      <div className="flex items-start justify-between mb-4">
        {/* Country Flag */}
        <motion.div
          className="text-5xl"
          whileHover={{ rotateY: [0, 10, -10, 5, 0] }}
          transition={{ duration: 0.5 }}
          role="img"
          aria-label={`${visa.destination.name} flag`}
        >
          {visa.destination.flag}
        </motion.div>

        {/* Visa Type Badge */}
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full',
            'text-xs font-medium border',
            visaTypeColor
          )}
        >
          {visaTypeLabel}
        </span>
      </div>

      {/* Country Name */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
        {visa.destination.name}
      </h3>

      {/* Region */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {visa.destination.region}
      </p>

      {/* Key Details Grid */}
      <div className="space-y-3 mb-4">
        {/* Stay Duration */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-gray-600 dark:text-gray-300">
            Stay: <span className="font-medium text-gray-900 dark:text-white">{visa.stayDuration} days</span>
          </span>
        </div>

        {/* Processing Time */}
        {visa.processingTime.max > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-300">
              Processing: <span className="font-medium text-gray-900 dark:text-white">
                {visa.processingTime.min === visa.processingTime.max
                  ? `${visa.processingTime.max} ${visa.processingTime.unit}`
                  : `${visa.processingTime.min}-${visa.processingTime.max} ${visa.processingTime.unit}`}
              </span>
            </span>
          </div>
        )}

        {/* Fees */}
        {visa.fees && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-300">
              Fee: <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(visa.fees.amount, visa.fees.currency)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Complexity Score */}
      <div className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium mb-4',
        complexity.color
      )}>
        <span role="img" aria-label={complexity.label}>
          {complexity.icon}
        </span>
        {complexity.label} ({visa.complexityScore}/100)
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          className={cn(isSaved && 'text-primary-600')}
          aria-label={isSaved ? 'Remove from saved' : 'Save visa'}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<GitCompare className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            onCompare?.();
          }}
          className={cn(isComparing && 'text-primary-600')}
          aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
        >
          Compare
        </Button>

        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="ml-auto"
          aria-label="View details"
        >
          Details
        </Button>
      </div>

      {/* Hover Indicator */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
  );
};

export default VisaCard;
