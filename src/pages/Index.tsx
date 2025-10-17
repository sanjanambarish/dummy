import { useState, useEffect } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ProfileSetup } from '@/components/ProfileSetup';
import { Dashboard } from '@/components/Dashboard';
import { PrescriptionUpload } from '@/components/PrescriptionUpload';
import { WellnessTips } from '@/components/WellnessTips';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { useLanguage } from '@/contexts/LanguageContext';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  healthConditions: string[];
}

type AppState = 'language' | 'profile' | 'dashboard' | 'scan' | 'upload' | 'medicines' | 'reminders' | 'wellness' | 'progress' | 'voice';

const Index = () => {
  const { t } = useLanguage();
  const [currentState, setCurrentState] = useState<AppState>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Global speech cleanup when navigating between sections
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, [currentState]);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setCurrentState('profile');
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentState('dashboard');
  };

  const handleNavigation = (section: string) => {
    setCurrentState(section as AppState);
  };

  const handleBack = () => {
    setCurrentState('dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 max-w-7xl">{" "}
        {currentState === 'language' && (
          <LanguageSelector 
            onLanguageSelect={handleLanguageSelect}
            selectedLanguage={selectedLanguage}
          />
        )}

        {currentState === 'profile' && (
          <ProfileSetup onProfileComplete={handleProfileComplete} />
        )}

        {currentState === 'dashboard' && userProfile && (
          <Dashboard 
            userName={userProfile.name}
            onNavigate={handleNavigation}
          />
        )}

        {(currentState === 'scan' || currentState === 'upload') && (
          <PrescriptionUpload onBack={handleBack} />
        )}

        {currentState === 'wellness' && userProfile && (
          <WellnessTips 
            onBack={handleBack}
            healthConditions={userProfile.healthConditions}
          />
        )}

        {currentState === 'voice' && (
          <VoiceAssistant onBack={handleBack} />
        )}

        {(currentState === 'medicines' || currentState === 'reminders' || currentState === 'progress') && (
          <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6 px-4">
            <h2 className="heading-primary">
              {currentState === 'medicines' && t('dashboard.my.medicines')}
              {currentState === 'reminders' && t('dashboard.reminders')}
              {currentState === 'progress' && t('dashboard.progress')}
            </h2>
            <p className="text-mobile-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('coming.soon')}
            </p>
            <button 
              onClick={handleBack}
              className="text-primary hover:underline text-mobile-base sm:text-lg font-medium"
            >
              {t('voice.back')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
