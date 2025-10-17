import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Pill, 
  Heart, 
  Mic,
  Camera,
  Upload,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ userName, onNavigate }: DashboardProps) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  });

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <h1 className="heading-primary text-foreground animate-slide-up">
          {t('dashboard.welcome')}, {userName}! 👋
        </h1>
        <p className="text-mobile-lg sm:text-xl lg:text-2xl text-muted-foreground animate-slide-up delay-100 max-w-3xl mx-auto">
          How can I help with your health today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">{" "}
        {/* Prescription/Report */}
        <Card className="p-4 sm:p-6 lg:p-8 card-hover shadow-md border border-border/50 animate-scale-in delay-200">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 lg:p-4 bg-prescription-light rounded-lg shrink-0">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-prescription" />
              </div>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h3 className="heading-secondary text-foreground">
                  {t('dashboard.scan.prescription')}
                </h3>
                <p className="text-mobile-sm sm:text-base lg:text-lg text-muted-foreground">
                  {t('dashboard.scan.description')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="prescription"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('scan')}
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">{t('dashboard.scan.prescription')}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('upload')}
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Upload Document</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Medicine Reminders */}
        <Card className="p-4 sm:p-6 lg:p-8 card-hover shadow-md border border-border/50 animate-scale-in delay-300">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 lg:p-4 bg-medicine-light rounded-lg shrink-0">
                <Pill className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-medicine" />
              </div>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h3 className="heading-secondary text-foreground">
                  {t('dashboard.my.medicines')}
                </h3>
                <p className="text-mobile-sm sm:text-base lg:text-lg text-muted-foreground">
                  {t('dashboard.medicines.description')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="medicine"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('medicines')}
              >
                <Pill className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">{t('dashboard.my.medicines')}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('reminders')}
              >
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">{t('dashboard.reminders')}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Wellness & Diet */}
        <Card className="p-4 sm:p-6 lg:p-8 card-hover shadow-md border border-border/50 animate-scale-in delay-400">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 lg:p-4 bg-wellness-light rounded-lg shrink-0">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-wellness" />
              </div>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h3 className="heading-secondary text-foreground">
                  {t('dashboard.wellness.tips')}
                </h3>
                <p className="text-mobile-sm sm:text-base lg:text-lg text-muted-foreground">
                  {t('dashboard.wellness.description')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="wellness"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('wellness')}
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">{t('dashboard.wellness.tips')}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 sm:gap-3 btn-animate button-mobile"
                onClick={() => onNavigate('progress')}
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">{t('dashboard.progress')}</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Voice Assistant */}
      <Card className="p-4 sm:p-6 lg:p-8 xl:p-10 mx-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-scale-in delay-500 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 sm:justify-between">
          <div className="space-y-2 sm:space-y-3 text-center sm:text-left flex-1">
            <h3 className="heading-secondary lg:text-3xl text-foreground">
              {t('dashboard.voice.assistant')}
            </h3>
            <p className="text-mobile-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-md">
              {t('dashboard.voice.description')}
            </p>
          </div>
          
          <Button
            variant="default"
            className="rounded-full aspect-square voice-pulse btn-animate shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
            onClick={() => onNavigate('voice')}
          >
            <Mic className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-4">
        <Card className="p-3 sm:p-4 lg:p-6 text-center card-hover animate-scale-in delay-600">
          <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-medicine">3</div>
          <div className="text-mobile-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">{t('dashboard.today.medicines')}</div>
        </Card>
        <Card className="p-3 sm:p-4 lg:p-6 text-center card-hover animate-scale-in delay-700">
          <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-wellness">5</div>
          <div className="text-mobile-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">{t('dashboard.active.days')}</div>
        </Card>
        <Card className="p-3 sm:p-4 lg:p-6 text-center card-hover animate-scale-in delay-800">
          <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-prescription">2</div>
          <div className="text-mobile-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">{t('dashboard.reports.uploaded')}</div>
        </Card>
        <Card className="p-3 sm:p-4 lg:p-6 text-center card-hover animate-scale-in delay-900">
          <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">98%</div>
          <div className="text-mobile-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">{t('dashboard.compliance.rate')}</div>
        </Card>
      </div>
    </div>
  );
};