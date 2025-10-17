import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Apple, 
  Activity, 
  Droplets, 
  Sun, 
  Heart,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface WellnessTipsProps {
  onBack: () => void;
  healthConditions: string[];
}

export const WellnessTips = ({ onBack, healthConditions }: WellnessTipsProps) => {
  const [activeTab, setActiveTab] = useState('diet');

  const getTodaysTips = () => {
    const baseTips = {
      diet: {
        icon: <Apple className="h-6 w-6" />,
        title: "Today's Nutrition Tip 🍎",
        content: "Include fiber-rich foods like oats and vegetables to help manage blood sugar levels naturally.",
        details: "Aim for 25-30g of fiber daily. Good sources: oatmeal, beans, berries, vegetables."
      },
      exercise: {
        icon: <Activity className="h-6 w-6" />,
        title: "Movement for Today 🚶‍♂️",
        content: "Take a 20-minute gentle walk after your largest meal to help with digestion and blood sugar.",
        details: "Walking after meals can reduce blood sugar spikes by up to 30%."
      },
      hydration: {
        icon: <Droplets className="h-6 w-6" />,
        title: "Hydration Goal 💧",
        content: "Drink 8 glasses of water throughout the day. Start with a glass when you wake up.",
        details: "Proper hydration helps kidney function and can improve energy levels."
      },
      wellness: {
        icon: <Sun className="h-6 w-6" />,
        title: "Wellness Tip 🌿",
        content: "Practice deep breathing for 5 minutes to reduce stress and lower blood pressure.",
        details: "Stress management is crucial for heart health and overall wellbeing."
      }
    };

    // Customize tips based on health conditions
    if (healthConditions.includes('diabetes')) {
      baseTips.diet.content = "Choose complex carbs like brown rice and quinoa. Avoid sugary drinks and processed foods.";
    }
    
    if (healthConditions.includes('hypertension')) {
      baseTips.diet.content = "Reduce sodium intake. Choose fresh fruits, vegetables, and lean proteins. Limit processed foods.";
    }

    return baseTips;
  };

  const tips = getTodaysTips();

  const healthMetrics = [
    { label: 'Daily Steps', value: 7500, target: 10000, color: 'wellness' },
    { label: 'Water Intake', value: 6, target: 8, color: 'primary', unit: 'glasses' },
    { label: 'Medicine Compliance', value: 90, target: 100, color: 'medicine', unit: '%' },
    { label: 'Sleep Quality', value: 75, target: 100, color: 'prescription', unit: '%' },
  ];

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const speakTip = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech first
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="btn-animate">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-xl-accessible font-bold text-foreground animate-slide-up">
            Wellness & Diet
          </h2>
          <p className="text-large text-muted-foreground animate-slide-up delay-100">
            Personalized health recommendations
          </p>
        </div>
      </div>

      {/* Daily Tips Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(tips).map(([key, tip], index) => (
          <Card key={key} className="p-6 card-hover shadow-md border border-border/50 animate-scale-in" style={{ animationDelay: `${(index + 2) * 0.1}s` }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-wellness-light rounded-lg text-wellness transition-transform duration-200 hover:scale-110">
                    {tip.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{tip.title}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => speakTip(tip.content)}
                  className="btn-animate"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-large leading-relaxed">{tip.content}</p>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Did you know?</strong> {tip.details}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Health Progress */}
      <Card className="p-6 shadow-lg animate-scale-in delay-600">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Today's Health Progress</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthMetrics.map((metric) => {
              const percentage = (metric.value / metric.target) * 100;
              return (
                <div key={metric.label} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {metric.value}{metric.unit || ''} / {metric.target}{metric.unit || ''}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {percentage >= 100 ? '🎉 Goal achieved!' : 
                     percentage >= 75 ? '👍 Almost there!' : 
                     '💪 Keep going!'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Health Achievements */}
      <Card className="p-6 bg-gradient-to-r from-success/10 to-wellness/10 border-success/20 shadow-lg animate-scale-in delay-700">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-success" />
            <h3 className="text-xl font-semibold">Health Achievements</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl">🏆</div>
              <div className="font-semibold">7 Day Streak</div>
              <div className="text-sm text-muted-foreground">Medicine compliance</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl">📈</div>
              <div className="font-semibold">BP Improved</div>
              <div className="text-sm text-muted-foreground">Down 10 points this month</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl">💪</div>
              <div className="font-semibold">Active Days</div>
              <div className="text-sm text-muted-foreground">5 days this week</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};