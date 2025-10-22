import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, differenceInDays } from 'date-fns';
import { ChevronDown, ChevronUp, MapPin, DollarSign, Clock, GripVertical, CheckCircle2 } from 'lucide-react';
import { useTripStore, Activity } from '../store/tripStore';

interface ActivityItemProps {
  activity: Activity;
  destinationId: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, destinationId }) => {
  const { toggleActivityComplete } = useTripStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const categoryColors = {
    sightseeing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    food: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    activity: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    transport: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    accommodation: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    other: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        relative group rounded-xl p-4 mb-3
        ${isDragging ? 'opacity-50 shadow-2xl scale-105' : ''}
        ${activity.completed ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
        border-2 ${activity.completed ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}
        hover:border-cyan-300 dark:hover:border-cyan-700 transition-all
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="pl-6 flex items-start gap-3">
        {/* Complete checkbox */}
        <button
          onClick={() => toggleActivityComplete(destinationId, activity.id)}
          className="mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
          aria-label={activity.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <CheckCircle2
            className={`w-5 h-5 ${
              activity.completed
                ? 'text-green-500 fill-green-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4
                className={`font-semibold ${
                  activity.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {activity.title}
              </h4>
              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${categoryColors[activity.category]}`}>
              {activity.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.time}</span>
              <span className="ml-1">({activity.duration}h)</span>
            </div>
            {activity.cost && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>${activity.cost}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface DestinationDayCardProps {
  destinationId: string;
}

const DestinationDayCard: React.FC<DestinationDayCardProps> = ({ destinationId }) => {
  const { destinations, updateDestination } = useTripStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const destination = destinations.find((d) => d.id === destinationId);
  if (!destination) return null;

  const days = differenceInDays(new Date(destination.endDate), new Date(destination.startDate)) + 1;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = destination.activities.findIndex((a) => a.id === active.id);
      const newIndex = destination.activities.findIndex((a) => a.id === over.id);
      const newActivities = arrayMove(destination.activities, oldIndex, newIndex);
      updateDestination(destinationId, { activities: newActivities });
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl p-0 overflow-hidden mb-6"
      style={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)'
      }}
    >
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-2 -m-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {destination.order + 1}
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                {destination.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(destination.startDate), 'MMM d')} - {format(new Date(destination.endDate), 'MMM d, yyyy')}
                <span className="ml-2 text-cyan-600 dark:text-cyan-400 font-medium">• {days} day{days !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </motion.div>
        </button>

        {/* Budget info */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">${destination.estimatedCost}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <span>{destination.activities.length} activities</span>
          </div>
        </div>

        {/* Activities */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={destination.activities.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {destination.activities.length > 0 ? (
                    destination.activities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        destinationId={destinationId}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No activities planned yet</p>
                      <p className="text-sm mt-1">Tap the + button to add activities</p>
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

const CalendarView: React.FC = () => {
  const { destinations } = useTripStore();
  const sortedDestinations = [...destinations].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full overflow-y-auto pb-24 px-4">
      <div className="max-w-4xl mx-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Itinerary
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your trip day by day. Drag to reorder activities.
          </p>
        </motion.div>

        {sortedDestinations.length > 0 ? (
          sortedDestinations.map((dest) => (
            <DestinationDayCard key={dest.id} destinationId={dest.id} />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No destinations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your first destination to start planning
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
