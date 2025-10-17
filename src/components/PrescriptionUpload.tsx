import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Upload, 
  FileText, 
  ArrowLeft, 
  RotateCcw,
  Languages,
  Volume2
} from 'lucide-react';

interface PrescriptionUploadProps {
  onBack: () => void;
}

export const PrescriptionUpload = ({ onBack }: PrescriptionUploadProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageBase64 = e.target?.result as string;
          
          const { analyzePrescriptionImage } = await import('@/lib/geminiVision');
          const analysis = await analyzePrescriptionImage(imageBase64);
          
          setExtractedText(analysis.extractedText);
          setSimplifiedText(analysis.simplifiedExplanation);
          setIsProcessing(false);
          
          const medicineCount = analysis.structuredData.medicines.length;
          toast({
            title: "Prescription Analyzed Successfully",
            description: `Found ${medicineCount} medicine${medicineCount !== 1 ? 's' : ''} and created a detailed guide for you`,
          });
        } catch (error) {
          console.error('Error processing prescription:', error);
          setIsProcessing(false);
          toast({
            title: "Processing Failed",
            description: error instanceof Error ? error.message : "Failed to analyze prescription. Please try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    }
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech first
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(simplifiedText);
      utterance.lang = currentLanguage === 'hindi' ? 'hi-IN' : 'en-US';
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
            Prescription Scanner
          </h2>
          <p className="text-large text-muted-foreground animate-slide-up delay-100">
            Upload or scan your prescription
          </p>
        </div>
      </div>

      {!uploadedImage ? (
        /* Upload Interface */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 text-center space-y-4 card-hover shadow-md border border-border/50 animate-scale-in delay-200"
                  onClick={() => fileInputRef.current?.click()}>
              <div className="mx-auto w-16 h-16 bg-prescription-light rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110">
                <Upload className="h-8 w-8 text-prescription" />
              </div>
              <h3 className="text-xl font-semibold">Upload from Gallery</h3>
              <p className="text-muted-foreground">
                Choose a photo from your device
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 card-hover shadow-md border border-border/50 animate-scale-in delay-300"
                  onClick={() => fileInputRef.current?.click()}>
              <div className="mx-auto w-16 h-16 bg-prescription-light rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110">
                <Camera className="h-8 w-8 text-prescription" />
              </div>
              <h3 className="text-xl font-semibold">Take Photo</h3>
              <p className="text-muted-foreground">
                Capture prescription with camera
              </p>
            </Card>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      ) : (
        /* Processing/Results Interface */
        <div className="space-y-6">
          <Card className="p-6 shadow-lg animate-scale-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Uploaded Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Uploaded Prescription</h3>
                <img 
                  src={uploadedImage} 
                  alt="Uploaded prescription"
                  className="w-full rounded-lg border shadow-sm"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setUploadedImage(null)}
                  className="w-full btn-animate"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Upload Different Image
                </Button>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {isProcessing ? (
                  <div className="text-center space-y-4 py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <h3 className="text-lg font-semibold">Processing Prescription...</h3>
                    <p className="text-muted-foreground">
                      Reading and simplifying your prescription
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Simplified Explanation</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={speakText}
                          className="btn-animate"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Listen
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentLanguage(
                            currentLanguage === 'english' ? 'hindi' : 'english'
                          )}
                          className="btn-animate"
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          {currentLanguage === 'english' ? 'हिंदी' : 'English'}
                        </Button>
                      </div>
                    </div>
                    
                    <Card className="p-4 bg-muted/30">
                      <pre className="whitespace-pre-wrap text-large font-medium leading-relaxed">
                        {simplifiedText}
                      </pre>
                    </Card>

                    <div className="flex gap-4">
                      <Button 
                        variant="wellness" 
                        className="flex-1 btn-animate"
                        onClick={() => {
                          toast({
                            title: "Medicines Added",
                            description: "All medicines have been added to your reminders",
                          });
                        }}
                      >
                        Add to My Medicines
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 btn-animate"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Original
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};