import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  healthConditions: string[];
}

interface ProfileSetupProps {
  onProfileComplete: (profile: UserProfile) => void;
}

const healthConditions = [
  { id: 'diabetes', labelKey: 'health.conditions.diabetes', icon: '🩺' },
  { id: 'hypertension', labelKey: 'health.conditions.hypertension', icon: '❤️' },
  { id: 'heart', labelKey: 'health.conditions.heart', icon: '💓' },
  { id: 'arthritis', labelKey: 'health.conditions.arthritis', icon: '🦴' },
  { id: 'cholesterol', labelKey: 'health.conditions.cholesterol', icon: '🧪' },
  { id: 'thyroid', labelKey: 'health.conditions.thyroid', icon: '🦋' },
  { id: 'kidney', labelKey: 'health.conditions.kidney', icon: '🫘' },
  { id: 'asthma', labelKey: 'health.conditions.asthma', icon: '🫁' },
];

export const ProfileSetup = ({ onProfileComplete }: ProfileSetupProps) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    healthConditions: [],
  });

  const handleHealthConditionChange = (conditionId: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      healthConditions: checked 
        ? [...prev.healthConditions, conditionId]
        : prev.healthConditions.filter(id => id !== conditionId)
    }));
  };

  const handleSubmit = () => {
    if (profile.name && profile.age && profile.gender) {
      onProfileComplete(profile);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl-accessible font-bold text-foreground animate-slide-up">
          {t('profile.title')}
        </h2>
        <p className="text-large text-muted-foreground animate-slide-up delay-100">
          Help us personalize your wellness journey
        </p>
      </div>

      <Card className="p-8 space-y-8 animate-scale-in delay-200 shadow-lg">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-large font-medium">
              {t('profile.name')}
            </Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="text-large p-4 focus-accessible"
              placeholder={t('profile.name.placeholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-large font-medium">
                {t('profile.age')}
              </Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                className="text-large p-4 focus-accessible"
                placeholder={t('profile.age.placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-large font-medium">{t('profile.gender')}</Label>
              <div className="flex gap-4">
                {[
                  { key: 'Male', labelKey: 'profile.gender.male' },
                  { key: 'Female', labelKey: 'profile.gender.female' },
                  { key: 'Other', labelKey: 'profile.gender.other' }
                ].map((gender) => (
                  <Button
                    key={gender.key}
                    variant={profile.gender === gender.key ? "default" : "outline"}
                    onClick={() => setProfile(prev => ({ ...prev, gender: gender.key }))}
                    className="flex-1 button-large focus-accessible btn-animate"
                  >
                    {t(gender.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {t('profile.health.conditions')}
            </h3>
            <Button
              variant="ghost"
              onClick={handleSubmit}
              disabled={!profile.name || !profile.age || !profile.gender}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
          <p className="text-muted-foreground">
            Select any conditions you have for personalized recommendations (optional)
          </p>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthConditions.map((condition, index) => (
              <Card key={condition.id} className="p-4 card-hover animate-scale-in" style={{ animationDelay: `${(index + 3) * 0.1}s` }}>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={condition.id}
                    checked={profile.healthConditions.includes(condition.id)}
                    onCheckedChange={(checked) => 
                      handleHealthConditionChange(condition.id, checked as boolean)
                    }
                    className="focus-accessible"
                  />
                  <label 
                    htmlFor={condition.id}
                    className="flex items-center gap-2 text-large font-medium cursor-pointer"
                  >
                    <span className="text-xl">{condition.icon}</span>
                    {t(condition.labelKey)}
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!profile.name || !profile.age || !profile.gender}
          className="w-full button-large bg-primary hover:bg-primary-hover text-primary-foreground focus-accessible btn-animate"
        >
          {t('profile.continue')}
        </Button>
      </Card>
    </div>
  );
};