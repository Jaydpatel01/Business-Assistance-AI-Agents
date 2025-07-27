import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

const steps = [
  'Welcome',
  'Profile',
  'Preferences',
  'FirstScenario',
  'Complete',
];

export function OnboardingWizard({ onComplete, onSkip }: { 
  onComplete?: () => void;
  onSkip?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', role: '' });
  const [preferences, setPreferences] = useState({ theme: 'light', notifications: true });
  const [scenario, setScenario] = useState('');

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const skip = () => onSkip?.() || onComplete?.();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <Card className="w-full max-w-lg p-8 relative">
        {/* Skip/Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 p-2"
          onClick={skip}
        >
          <X className="h-4 w-4" />
        </Button>

        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Boardroom AI Navigator!</h2>
            <p className="mb-6">Let's get you set up for your first boardroom experience.</p>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={next}>Get Started</Button>
              <Button variant="outline" onClick={skip}>Skip Setup</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              You can always complete setup later in your profile settings.
            </p>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set up your profile (Optional)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can fill this out now or skip and set it up later in settings.
            </p>
            <Input
              className="mb-4"
              placeholder="Your Name (optional)"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              className="mb-4"
              placeholder="Your Role (e.g. CEO, Product Manager) - optional"
              value={profile.role}
              onChange={e => setProfile({ ...profile, role: e.target.value })}
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={skip}>Skip</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Preferences (Optional)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Set your preferences or skip to use defaults.
            </p>
            <div className="mb-4">
              <label className="block mb-2">Theme</label>
              <select
                className="w-full border rounded p-2"
                value={preferences.theme}
                onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={e => setPreferences({ ...preferences, notifications: e.target.checked })}
                  className="mr-2"
                />
                Enable notifications
              </label>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={skip}>Skip</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create your first scenario (Optional)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can create a custom scenario or skip to use our predefined scenarios.
            </p>
            <Input
              className="mb-4"
              placeholder="e.g. Expand to Southeast Asia (optional)"
              value={scenario}
              onChange={e => setScenario(e.target.value)}
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={skip}>Skip</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">You're all set!</h2>
            <p className="mb-6">
              {profile.name ? `Welcome, ${profile.name}!` : 'Welcome!'} You can now start your first boardroom session.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can update your profile and preferences anytime in the settings.
            </p>
            <Button onClick={() => onComplete?.()}>Start Using Boardroom AI</Button>
          </div>
        )}
      </Card>
    </div>
  );
} 