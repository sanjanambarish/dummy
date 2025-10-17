import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, languages, type Language } from '@/contexts/LanguageContext';


interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
  selectedLanguage?: Language;
}

export const LanguageSelector = ({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) => {
  const { t, setLanguage } = useLanguage();

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    onLanguageSelect(language);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-4">
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="heading-primary text-foreground animate-slide-up">
          {t('language.title')}
        </h2>
        <p className="text-mobile-lg sm:text-xl text-muted-foreground animate-slide-up delay-100">
          {t('language.subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-md mx-auto">
        {languages.map((language, index) => (
          <Card key={language.code} className="overflow-hidden animate-scale-in" style={{ animationDelay: `${(index + 2) * 0.1}s` }}>
            <Button
              variant={selectedLanguage?.code === language.code ? "default" : "outline"}
              className="w-full button-mobile flex items-center justify-start gap-3 sm:gap-4 p-4 sm:p-6 focus-accessible btn-animate"
              onClick={() => handleLanguageSelect(language)}
            >
              <span className="text-xl sm:text-2xl">{language.flag}</span>
              <div className="text-left">
                <div className="font-semibold text-mobile-lg sm:text-lg">{language.nativeName}</div>
                <div className="text-mobile-sm sm:text-sm text-muted-foreground">{language.name}</div>
              </div>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};