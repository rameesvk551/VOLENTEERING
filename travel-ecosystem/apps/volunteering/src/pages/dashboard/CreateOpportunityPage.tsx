import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/MainLayout';
import {
  Button,
  Card,
  Input,
  TextArea,
  Select,
  Checkbox,
  cn,
} from '../../design-system';

/* ========================================
   CREATE OPPORTUNITY PAGE
   Multi-step form for creating a new
   volunteering opportunity
   ======================================== */

type FormStep = 'basics' | 'details' | 'accommodation' | 'requirements' | 'photos' | 'preview';

const CreateOpportunityPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('basics');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const steps: { id: FormStep; label: string; number: number }[] = [
    { id: 'basics', label: 'Basic Info', number: 1 },
    { id: 'details', label: 'Details', number: 2 },
    { id: 'accommodation', label: 'Accommodation', number: 3 },
    { id: 'requirements', label: 'Requirements', number: 4 },
    { id: 'photos', label: 'Photos', number: 5 },
    { id: 'preview', label: 'Preview', number: 6 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <DashboardLayout title="Create Opportunity">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <button
                    onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                      isCompleted
                        ? 'bg-primary-500 text-white'
                        : isCurrent
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                        : 'bg-gray-200 text-gray-500'
                    )}
                    disabled={index > currentStepIndex}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <span
                    className={cn(
                      'text-xs mt-2 font-medium hidden sm:block',
                      isCurrent ? 'text-primary-600' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="mb-6">
          {currentStep === 'basics' && <BasicsStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'details' && <DetailsStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'accommodation' && <AccommodationStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'requirements' && <RequirementsStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'photos' && <PhotosStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'preview' && <PreviewStep formData={formData} />}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentStepIndex === 0}
          >
            ← Back
          </Button>

          <div className="flex gap-3">
            <Button variant="outline">
              Save as Draft
            </Button>
            {currentStep === 'preview' ? (
              <Button onClick={() => alert('Publish opportunity')}>
                Publish Opportunity
              </Button>
            ) : (
              <Button onClick={goNext}>
                Continue →
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* Step Components */
interface StepProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const BasicsStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500">Start with the essential details about your opportunity</p>
      </div>

      <Input
        label="Opportunity Title"
        placeholder="e.g., Organic Farm Experience in Beautiful Portugal"
        hint="Make it descriptive and eye-catching"
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <Select
        label="Category"
        options={[
          { value: '', label: 'Select a category' },
          { value: 'farming', label: 'Farming & Gardening' },
          { value: 'hostel', label: 'Hostel & Hospitality' },
          { value: 'teaching', label: 'Teaching & Education' },
          { value: 'animals', label: 'Animal Care' },
          { value: 'eco', label: 'Eco Projects' },
          { value: 'art', label: 'Art & Culture' },
          { value: 'social', label: 'Social Impact' },
          { value: 'tech', label: 'Tech & Digital' },
        ]}
        value={formData.category || ''}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Country"
          placeholder="Portugal"
          value={formData.country || ''}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        />
        <Input
          label="City/Region"
          placeholder="Sintra"
          value={formData.city || ''}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </div>

      <TextArea
        label="Short Description"
        placeholder="A brief overview that appears in search results (max 200 characters)"
        maxLength={200}
        value={formData.shortDescription || ''}
        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
      />
    </div>
  );
};

const DetailsStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Opportunity Details</h2>
        <p className="text-gray-500">Tell volunteers what they'll be doing</p>
      </div>

      <TextArea
        label="Full Description"
        placeholder="Describe your project, daily activities, and what makes it special..."
        rows={6}
        value={formData.fullDescription || ''}
        onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type of Help Needed
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Gardening',
            'Cooking',
            'Reception',
            'Cleaning',
            'Teaching',
            'Language Practice',
            'Building',
            'Animal Care',
            'Photography',
            'Social Media',
            'Web Development',
            'Event Planning',
          ].map((help) => (
            <Checkbox
              key={help}
              label={help}
              checked={formData.helpNeeded?.includes(help) || false}
              onChange={(e) => {
                const current = formData.helpNeeded || [];
                if (e.target.checked) {
                  setFormData({ ...formData, helpNeeded: [...current, help] });
                } else {
                  setFormData({ ...formData, helpNeeded: current.filter((h: string) => h !== help) });
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Hours per Day"
          type="number"
          placeholder="4-5"
          hint="Typical volunteer hours"
          value={formData.hoursPerDay || ''}
          onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
        />
        <Input
          label="Days per Week"
          type="number"
          placeholder="5"
          value={formData.daysPerWeek || ''}
          onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Minimum Stay"
          type="text"
          placeholder="2 weeks"
          value={formData.minStay || ''}
          onChange={(e) => setFormData({ ...formData, minStay: e.target.value })}
        />
        <Input
          label="Maximum Stay"
          type="text"
          placeholder="3 months"
          value={formData.maxStay || ''}
          onChange={(e) => setFormData({ ...formData, maxStay: e.target.value })}
        />
      </div>
    </div>
  );
};

const AccommodationStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Accommodation & Perks</h2>
        <p className="text-gray-500">What do you offer to volunteers?</p>
      </div>

      <Select
        label="Accommodation Type"
        options={[
          { value: '', label: 'Select accommodation type' },
          { value: 'private', label: 'Private Room' },
          { value: 'shared', label: 'Shared Room' },
          { value: 'dorm', label: 'Dormitory' },
          { value: 'tent', label: 'Tent/Camping' },
          { value: 'cabin', label: 'Cabin/Tiny House' },
        ]}
        value={formData.accommodationType || ''}
        onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
      />

      <TextArea
        label="Accommodation Description"
        placeholder="Describe the living space, shared facilities, etc."
        rows={4}
        value={formData.accommodationDescription || ''}
        onChange={(e) => setFormData({ ...formData, accommodationDescription: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's Included
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Breakfast',
            'Lunch',
            'Dinner',
            'WiFi',
            'Laundry',
            'Airport Pickup',
            'Kitchen Access',
            'Tours & Activities',
            'Language Lessons',
            'Bike/Scooter',
          ].map((perk) => (
            <Checkbox
              key={perk}
              label={perk}
              checked={formData.perks?.includes(perk) || false}
              onChange={(e) => {
                const current = formData.perks || [];
                if (e.target.checked) {
                  setFormData({ ...formData, perks: [...current, perk] });
                } else {
                  setFormData({ ...formData, perks: current.filter((p: string) => p !== perk) });
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RequirementsStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Requirements</h2>
        <p className="text-gray-500">What are you looking for in volunteers?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Languages Required
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Chinese', 'Japanese', 'Arabic'].map((lang) => (
            <Checkbox
              key={lang}
              label={lang}
              checked={formData.languages?.includes(lang) || false}
              onChange={(e) => {
                const current = formData.languages || [];
                if (e.target.checked) {
                  setFormData({ ...formData, languages: [...current, lang] });
                } else {
                  setFormData({ ...formData, languages: current.filter((l: string) => l !== lang) });
                }
              }}
            />
          ))}
        </div>
      </div>

      <Select
        label="Minimum Age"
        options={[
          { value: '', label: 'No minimum' },
          { value: '18', label: '18+' },
          { value: '21', label: '21+' },
          { value: '25', label: '25+' },
        ]}
        value={formData.minAge || ''}
        onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
      />

      <TextArea
        label="Required Skills or Experience"
        placeholder="List any specific skills, certifications, or experience needed..."
        rows={4}
        value={formData.requiredSkills || ''}
        onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
      />

      <TextArea
        label="Additional Requirements"
        placeholder="Any other requirements or expectations..."
        rows={3}
        value={formData.additionalRequirements || ''}
        onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
      />
    </div>
  );
};

const PhotosStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Photos</h2>
        <p className="text-gray-500">Add photos to attract more volunteers</p>
      </div>

      {/* Main Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cover Photo
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UploadIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-1">
            <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
        </div>
      </div>

      {/* Gallery Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Gallery Photos (up to 10)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
            >
              <PlusIcon className="w-6 h-6 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        💡 Tips: Show the accommodation, work areas, surroundings, and happy volunteers
      </p>
    </div>
  );
};

const PreviewStep: React.FC<{ formData: Record<string, any> }> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Preview</h2>
        <p className="text-gray-500">Review your opportunity before publishing</p>
      </div>

      {/* Preview Card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="aspect-video bg-gray-100" />
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {formData.title || 'Your Opportunity Title'}
          </h3>
          <p className="text-gray-500 mb-4">
            {formData.city}, {formData.country}
          </p>
          <p className="text-gray-600">
            {formData.shortDescription || 'Your short description will appear here...'}
          </p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <h4 className="font-semibold text-emerald-800 mb-2">✓ Ready to publish!</h4>
        <p className="text-sm text-emerald-700">
          Your opportunity looks great. Click "Publish" to make it live and start receiving applications.
        </p>
      </div>
    </div>
  );
};

/* Icons */
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default CreateOpportunityPage;
