"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    if (session && typeof window !== 'undefined' && !hasCheckedOnboarding) {
      const complete = localStorage.getItem('onboardingComplete');
      const skipped = localStorage.getItem('onboardingSkipped');
      
      // Only show onboarding if user hasn't completed it OR skipped it
      if (!complete && !skipped) {
        setShowOnboarding(true);
      }
      setHasCheckedOnboarding(true);
    }
  }, [session, hasCheckedOnboarding]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboardingSkipped', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      {children}
    </>
  );
}
