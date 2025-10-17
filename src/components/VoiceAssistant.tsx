import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mic, MicOff, Loader2, Volume2, Plus, Calendar, FileText, ShoppingCart, Keyboard } from 'lucide-react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface VoiceAssistantProps {
  onBack: () => void;
  onTranscriptReady?: (transcript: string) => void;
  onVoiceAnswer?: (response: VoiceResponse) => void;
}

interface VoiceResponse {
  answer_text: string;
  disclaimer: string;
  actions?: VoiceAction[];
}

interface VoiceAction {
  id: string;
  label: string;
  type: 'grocery' | 'reminder' | 'note' | 'appointment';
}

type MicState = 'idle' | 'listening' | 'processing';
type SupportedLanguage = 'en-US' | 'hi-IN' | 'kn-IN';

const supportedLanguages: { code: SupportedLanguage; label: string }[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
];

// Mock user profile and health data
const mockUserProfile = {
  name: "John Doe",
  age: 45,
  conditions: ["diabetes", "hypertension"],
  medications: ["Metformin", "Lisinopril"],
};

const mockRecentReports = [
  { type: "Blood Sugar", value: "145 mg/dL", date: "2024-01-15", status: "elevated" },
  { type: "Blood Pressure", value: "138/88", date: "2024-01-14", status: "high" },
  { type: "HbA1c", value: "7.2%", date: "2024-01-10", status: "needs_improvement" }
];

export const VoiceAssistant = ({ onBack, onTranscriptReady, onVoiceAnswer }: VoiceAssistantProps) => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  
  // State management
  const [micState, setMicState] = useState<MicState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    // Default to user's app language if supported
    const appLang = currentLanguage.code;
    if (appLang === 'hi') return 'hi-IN';
    if (appLang === 'kn') return 'kn-IN';
    return 'en-US';
  });
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<VoiceResponse | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for speech recognition support
  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (!speechRecognitionSupported) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setMicState('listening');
      setInterimTranscript('');
      setPermissionDenied(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(final);
        setInterimTranscript('');
        recognition.stop();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setPermissionDenied(true);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice features",
          variant: "destructive"
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking louder or closer to the microphone",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or use text input",
          variant: "destructive"
        });
      }
      
      setMicState('idle');
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setMicState('idle');
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage, speechRecognitionSupported, toast]);

  // Process final transcript
  useEffect(() => {
    if (finalTranscript.trim()) {
      onTranscriptReady?.(finalTranscript);
      processQuery(finalTranscript);
      setFinalTranscript('');
    }
  }, [finalTranscript, onTranscriptReady]);

  // Auto-stop listening after silence
  useEffect(() => {
    if (micState === 'listening' && !interimTranscript) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && micState === 'listening') {
          recognitionRef.current.stop();
        }
      }, 3000); // Stop after 3 seconds of silence
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [micState, interimTranscript]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      setPermissionDenied(true);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access and try again",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleMicClick = async () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please use text input.",
        variant: "destructive"
      });
      setShowTextInput(true);
      return;
    }

    if (micState === 'listening') {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if (micState === 'processing') {
      return; // Don't allow clicks during processing
    }

    // Request permission and start listening
    const hasPermission = await requestMicrophonePermission();
    if (hasPermission && recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    }
  };

  const processQuery = async (query: string) => {
    setMicState('processing');

    try {
      // Try to send to backend endpoint
      const response = await fetch('/api/voice/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          language: selectedLanguage,
          user_profile: mockUserProfile,
          recent_reports: mockRecentReports,
        }),
      });

      let voiceData: VoiceResponse;

      if (response.ok) {
        voiceData = await response.json();
      } else {
        throw new Error('Backend unavailable');
      }

      setVoiceResponse(voiceData);
      onVoiceAnswer?.(voiceData);
      speakResponse(voiceData.answer_text);

    } catch (error) {
      console.error('Backend unavailable, using mock response:', error);
      
      // Use mock response when backend is unavailable
      const mockResponse = generateMockResponse(query);
      setVoiceResponse(mockResponse);
      onVoiceAnswer?.(mockResponse);
      speakResponse(mockResponse.answer_text);
    } finally {
      setMicState('idle');
    }
  };

  const generateMockResponse = (query: string): VoiceResponse => {
    const input = query.toLowerCase();
    let answerText = '';
    let actions: VoiceAction[] = [];

    // Generate contextual responses based on user input and health data
    if (input.includes('blood sugar') || input.includes('glucose') || input.includes('diabetes')) {
      const latestBG = mockRecentReports.find(r => r.type === "Blood Sugar");
      answerText = getLocalizedText(
        selectedLanguage,
        `Your latest blood sugar was ${latestBG?.value} on ${latestBG?.date}. This is ${latestBG?.status}. Consider checking your medication timing and diet.`,
        `आपका नवीनतम रक्त शर्करा ${latestBG?.value} था ${latestBG?.date} को। यह ${latestBG?.status} है। अपनी दवा का समय और आहार की जांच करें।`,
        `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ರಕ್ತದ ಸಕ್ಕರೆ ${latestBG?.value} ಆಗಿತ್ತು ${latestBG?.date} ನಲ್ಲಿ। ಇದು ${latestBG?.status} ಆಗಿದೆ।`
      );
      actions = [
        { id: 'reminder', label: 'Add Reminder', type: 'reminder' },
        { id: 'appointment', label: 'Schedule Appointment', type: 'appointment' }
      ];
    } else if (input.includes('blood pressure') || input.includes('hypertension')) {
      const latestBP = mockRecentReports.find(r => r.type === "Blood Pressure");
      answerText = getLocalizedText(
        selectedLanguage,
        `Your recent blood pressure reading was ${latestBP?.value}. This is ${latestBP?.status}. Consider reducing salt intake and monitoring regularly.`,
        `आपका हालिया रक्तचाप ${latestBP?.value} था। यह ${latestBP?.status} है। नमक कम करें और नियमित जांच करें।`,
        `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ರಕ್ತದ ಒತ್ತಡ ${latestBP?.value} ಆಗಿತ್ತು। ಇದು ${latestBP?.status} ಆಗಿದೆ।`
      );
      actions = [
        { id: 'groceries', label: 'Add to Grocery List', type: 'grocery' }
      ];
    } else if (input.includes('medication') || input.includes('medicine')) {
      answerText = getLocalizedText(
        selectedLanguage,
        `You're currently taking ${mockUserProfile.medications.join(' and ')}. Remember to take them as prescribed.`,
        `आप वर्तमान में ${mockUserProfile.medications.join(' और ')} ले रहे हैं। इन्हें निर्धारित समय पर लेना याद रखें।`,
        `ನೀವು ಪ್ರಸ್ತುತ ${mockUserProfile.medications.join(' ಮತ್ತು ')} ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ।`
      );
      actions = [
        { id: 'reminder', label: 'Set Medication Reminder', type: 'reminder' }
      ];
    } else if (input.includes('hello') || input.includes('hi') || input.includes('namaste')) {
      answerText = getLocalizedText(
        selectedLanguage,
        `Hello ${mockUserProfile.name}! I'm your health assistant. How can I help you today?`,
        `नमस्ते ${mockUserProfile.name}! मैं आपका स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
        `ನಮಸ್ಕಾರ ${mockUserProfile.name}! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`
      );
    } else {
      answerText = getLocalizedText(
        selectedLanguage,
        `I understand you said: "${query}". As your health assistant, I can help with medication management, health monitoring, and wellness guidance.`,
        `मैं समझ गया कि आपने कहा: "${query}"। आपके स्वास्थ्य सहायक के रूप में, मैं दवा प्रबंधन और स्वास्थ्य निगरानी में मदद कर सकता हूं।`,
        `ನೀವು ಹೇಳಿದ್ದು ನನಗೆ ಅರ್ಥವಾಯಿತು: "${query}"। ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕನಾಗಿ, ನಾನು ಔಷಧ ನಿರ್ವಹಣೆ ಮತ್ತು ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು।`
      );
    }

    return {
      answer_text: answerText,
      disclaimer: getLocalizedText(
        selectedLanguage,
        "This is general guidance; consult your doctor.",
        "यह सामान्य मार्गदर्शन है; अपने डॉक्टर से सलाह लें।",
        "ಇದು ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ; ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ।"
      ),
      actions
    };
  };

  const getLocalizedText = (lang: SupportedLanguage, en: string, hi: string, kn: string): string => {
    switch (lang) {
      case 'hi-IN': return hi;
      case 'kn-IN': return kn;
      default: return en;
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processQuery(textInput.trim());
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const handleActionClick = (action: VoiceAction) => {
    switch (action.type) {
      case 'grocery':
        toast({ title: "Added to Grocery List", description: "Low-sodium foods added" });
        break;
      case 'reminder':
        toast({ title: "Reminder Set", description: "You'll be notified at the scheduled time" });
        break;
      case 'note':
        toast({ title: "Note Saved", description: "Your note has been saved" });
        break;
      case 'appointment':
        toast({ title: "Appointment", description: "Opening appointment scheduler" });
        break;
    }
  };

  const getMicIcon = () => {
    switch (micState) {
      case 'listening':
        return <Mic className="w-12 h-12" />;
      case 'processing':
        return <Loader2 className="w-12 h-12 animate-spin" />;
      default:
        return <Mic className="w-12 h-12" />;
    }
  };

  const getMicButtonClass = () => {
    const baseClass = "w-32 h-32 rounded-full text-4xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    
    switch (micState) {
      case 'listening':
        return `${baseClass} bg-red-500 hover:bg-red-600 animate-pulse`;
      case 'processing':
        return `${baseClass} bg-blue-500 hover:bg-blue-600`;
      default:
        return `${baseClass} bg-primary hover:bg-primary/90`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
      {/* Hidden audio element for fallback playback */}
      <audio ref={audioRef} className="hidden" />

      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          {t('voice.title')}
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Speak naturally and I'll help you with your health management
        </p>
      </div>

      {/* Interim transcript area */}
      {interimTranscript && (
        <Card className="p-4 bg-muted/50 border-dashed animate-fade-in">
          <p className="text-muted-foreground italic">
            Listening: "{interimTranscript}"
          </p>
        </Card>
      )}

      <Card className="p-8 space-y-6">
        {/* Language selector and microphone */}
        <div className="flex items-center justify-center gap-4">
          <Select 
            value={selectedLanguage} 
            onValueChange={(value: SupportedLanguage) => setSelectedLanguage(value)}
          >
            <SelectTrigger className="w-48" aria-label="Select language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md z-50">
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleMicClick}
            disabled={micState === 'processing' || permissionDenied}
            className={getMicButtonClass()}
            aria-label={
              micState === 'listening' 
                ? 'Stop recording' 
                : micState === 'processing' 
                  ? 'Processing speech' 
                  : 'Start recording'
            }
          >
            {getMicIcon()}
          </Button>
        </div>

        {/* Status text */}
        <div className="min-h-[1.5rem]">
          {micState === 'listening' && (
            <p className="text-lg font-medium text-red-500 animate-pulse">
              Listening... Click to stop
            </p>
          )}
          {micState === 'processing' && (
            <p className="text-lg font-medium text-blue-500">
              Processing speech...
            </p>
          )}
          {micState === 'idle' && !permissionDenied && (
            <p className="text-lg font-medium text-muted-foreground">
              Click to start speaking
            </p>
          )}
          {permissionDenied && (
            <p className="text-lg font-medium text-destructive">
              Microphone access denied. Use text input below.
            </p>
          )}
        </div>

        {/* Text input fallback */}
        <div className="space-y-2">
          {!showTextInput ? (
            <Button
              variant="outline"
              onClick={() => setShowTextInput(true)}
              className="flex items-center gap-2"
              aria-label="Switch to text input"
            >
              <Keyboard className="w-4 h-4" />
              Type instead
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your question..."
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                className="flex-1"
                aria-label="Text input for voice assistant"
              />
              <Button 
                onClick={handleTextSubmit} 
                disabled={!textInput.trim() || micState === 'processing'}
              >
                Send
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTextInput(false);
                  setTextInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Answer card */}
      {voiceResponse && (
        <Card className="p-6 space-y-4 text-left animate-scale-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assistant:</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakResponse(voiceResponse.answer_text)}
              className="flex items-center gap-2"
              aria-label="Replay response"
            >
              <Volume2 className="w-4 h-4" />
              Replay
            </Button>
          </div>
          
          <div className="space-y-3">
            <p className="text-foreground">{voiceResponse.answer_text}</p>
            
            {voiceResponse.disclaimer && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-yellow-500 pl-3">
                {voiceResponse.disclaimer}
              </p>
            )}
            
            {voiceResponse.actions && voiceResponse.actions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Suggested Actions:</h4>
                <div className="flex flex-wrap gap-2">
                  {voiceResponse.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(action)}
                      className="flex items-center gap-2"
                    >
                      {action.type === 'grocery' && <ShoppingCart className="w-4 h-4" />}
                      {action.type === 'reminder' && <Plus className="w-4 h-4" />}
                      {action.type === 'note' && <FileText className="w-4 h-4" />}
                      {action.type === 'appointment' && <Calendar className="w-4 h-4" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Button 
        onClick={onBack}
        variant="outline"
        className="text-lg"
      >
        {t('voice.back')}
      </Button>
    </div>
  );
};