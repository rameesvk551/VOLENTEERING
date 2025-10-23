import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, Tag } from 'lucide-react';
import type { QueryEntities } from '../../hooks/useDiscovery';

interface EntityChipsProps {
  entities: QueryEntities;
}

export const EntityChips: React.FC<EntityChipsProps> = ({ entities }) => {
  const chips = [];

  if (entities.city) {
    chips.push({
      icon: <MapPin className="w-4 h-4" />,
      label: `${entities.city}${entities.country ? `, ${entities.country}` : ''}`,
      type: 'city',
      gradient: 'from-cyan-500 to-blue-500'
    });
  }

  if (entities.month) {
    chips.push({
      icon: <Calendar className="w-4 h-4" />,
      label: `${entities.month}${entities.year ? ` ${entities.year}` : ''}`,
      type: 'month',
      gradient: 'from-purple-500 to-pink-500'
    });
  }

  if (entities.interests && entities.interests.length > 0) {
    entities.interests.forEach((interest) => {
      chips.push({
        icon: <Heart className="w-4 h-4" />,
        label: interest,
        type: 'interest',
        gradient: 'from-amber-500 to-orange-500'
      });
    });
  }

  if (entities.eventType && entities.eventType.length > 0) {
    entities.eventType.forEach((eventType) => {
      chips.push({
        icon: <Tag className="w-4 h-4" />,
        label: eventType,
        type: 'eventType',
        gradient: 'from-green-500 to-emerald-500'
      });
    });
  }

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="entity-chips mb-8"
    >
      <div className="flex gap-3 flex-wrap">
        {chips.map((chip, idx) => (
          <motion.div
            key={`${chip.type}-${chip.label}`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ delay: idx * 0.05, type: 'spring' }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-gradient-to-r ${chip.gradient} text-white shadow-lg
              hover:shadow-xl transition-shadow duration-300`}
          >
            {chip.icon}
            <span className="font-medium">{chip.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
