'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Step1Type } from './steps/step-1-type';
import { Step2Basic } from './steps/step-2-basic';
import { Step3Details } from './steps/step-3-details';
import { Step4Attachments } from './steps/step-4-attachments';
import { Step5Review } from './steps/step-5-review';
import { createRequest } from '@/app/actions/requests';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { REQUEST_TYPES } from '@/lib/constants';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const STEPS = [
  { id: 1, title: 'Jenis Permintaan' },
  { id: 2, title: 'Informasi Dasar' },
  { id: 3, title: 'Detail Kebutuhan' },
  { id: 4, title: 'Lampiran' },
  { id: 5, title: 'Review & Kirim' },
];

export function RequestFormWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [requestType, setRequestType] = useState<string>(REQUEST_TYPES.NEW_APPLICATION);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [businessNeed, setBusinessNeed] = useState('');
  const [objective, setObjective] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const progressPercentage = (currentStep / STEPS.length) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (title.length < 10) {
        newErrors.title = 'Judul minimal 10 karakter';
      }
      if (description.length < 50) {
        newErrors.description = 'Deskripsi minimal 50 karakter';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('requestType', requestType);
      formData.append('title', title);
      formData.append('description', description);
      if (urgency) formData.append('urgency', urgency);
      if (requesterPhone) formData.append('requesterPhone', requesterPhone);
      if (businessNeed) formData.append('businessNeed', businessNeed);
      if (objective) formData.append('objective', objective);
      if (expectedOutput) formData.append('expectedOutput', expectedOutput);

      files.forEach((file) => {
        formData.append('files', file);
      });

      const result = await createRequest(formData);

      if (result.success) {
        router.push(`/requests/${result.requestId}`);
      } else {
        alert(result.error || 'Terjadi kesalahan');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </span>
          <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1Type value={requestType} onChange={setRequestType} />
        )}

        {currentStep === 2 && (
          <Step2Basic
            title={title}
            description={description}
            urgency={urgency}
            requesterPhone={requesterPhone}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onUrgencyChange={setUrgency}
            onPhoneChange={setRequesterPhone}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <Step3Details
            businessNeed={businessNeed}
            objective={objective}
            expectedOutput={expectedOutput}
            onBusinessNeedChange={setBusinessNeed}
            onObjectiveChange={setObjective}
            onExpectedOutputChange={setExpectedOutput}
          />
        )}

        {currentStep === 4 && (
          <Step4Attachments files={files} onFilesChange={setFiles} />
        )}

        {currentStep === 5 && (
          <Step5Review
            requestType={requestType}
            title={title}
            description={description}
            urgency={urgency}
            requesterPhone={requesterPhone}
            businessNeed={businessNeed}
            objective={objective}
            expectedOutput={expectedOutput}
            files={files}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1 || isPending}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Sebelumnya
        </Button>

        {currentStep < STEPS.length ? (
          <Button type="button" onClick={handleNext} disabled={isPending}>
            Selanjutnya
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kirim Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
