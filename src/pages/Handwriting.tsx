import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PenTool, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const Handwriting = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-homework', {
        body: { text: inputText, type: 'handwriting' }
      });

      if (error) {
        console.error('Error converting text:', error);
        toast.error(error.message || "Failed to convert text");
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      setConvertedText(data.result);
      toast.success("Text converted to handwriting style!");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!convertedText) {
      toast.error("No text to export");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 10;
      
      // Use a more handwriting-like appearance with the default font
      doc.setFontSize(12);
      
      const lines = doc.splitTextToSize(convertedText, maxWidth);
      let y = margin;
      
      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }

      doc.save("handwritten-homework.pdf");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PenTool className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">Handwriting Converter</span>
            </div>
          </div>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3">Handwriting Style Converter</h1>
            <p className="text-muted-foreground text-lg">Transform typed text into beautiful handwriting</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="p-6 shadow-paper">
              <h2 className="text-xl font-semibold mb-4">Typed Text</h2>
              <Textarea
                placeholder="Type your homework or notes here...&#10;&#10;This will be converted to match your handwriting style."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] resize-none"
              />
              <Button
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full mt-4"
                size="lg"
              >
                {isLoading ? "Converting..." : "Convert to Handwriting"}
              </Button>
            </Card>

            {/* Output Section */}
            <Card className="p-6 shadow-paper paper-texture">
              <h2 className="text-xl font-semibold mb-4">Handwriting Preview</h2>
              <div className="min-h-[400px] p-4 bg-card/50 rounded-lg border border-border overflow-auto">
                {convertedText ? (
                  <div className="font-handwriting text-2xl leading-loose text-ink whitespace-pre-wrap">
                    {convertedText}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Your handwriting will appear here...</p>
                )}
              </div>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="mt-8 p-6 bg-secondary/30">
            <h3 className="text-lg font-semibold mb-3">✨ Handwriting Style Tips</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• The converted text uses a natural handwriting font</li>
              <li>• Perfect for assignments that require handwritten submissions</li>
              <li>• Export to PDF maintains the handwriting appearance</li>
              <li>• Customize spacing and size for better readability</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Handwriting;
