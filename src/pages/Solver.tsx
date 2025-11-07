import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const Solver = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) {
      toast.error("Please enter a mathematical problem");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('solve-math', {
        body: { problem }
      });

      if (error) {
        console.error('Error solving problem:', error);
        toast.error(error.message || "Failed to solve problem");
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      setSolution(data.solution);
      toast.success("Problem solved!");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!solution) {
      toast.error("No solution to export");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Add title
      doc.setFontSize(16);
      doc.text("Math Solution", margin, margin);

      // Add problem
      doc.setFontSize(12);
      doc.text("Problem:", margin, margin + 15);
      const problemLines = doc.splitTextToSize(problem, maxWidth);
      doc.setFontSize(10);
      doc.text(problemLines, margin, margin + 22);

      // Add solution
      const solutionY = margin + 22 + (problemLines.length * 7) + 10;
      doc.setFontSize(12);
      doc.text("Solution:", margin, solutionY);
      const solutionLines = doc.splitTextToSize(solution, maxWidth);
      doc.setFontSize(10);
      doc.text(solutionLines, margin, solutionY + 7);

      doc.save("math-solution.pdf");
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
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">Math Solver</span>
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
            <h1 className="text-4xl font-bold mb-3">Mathematical Derivation Solver</h1>
            <p className="text-muted-foreground text-lg">Enter your math problem and get step-by-step solutions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="p-6 shadow-paper">
              <h2 className="text-xl font-semibold mb-4">Your Problem</h2>
              <Textarea
                placeholder="Enter your mathematical problem here...&#10;&#10;Example: Solve the derivative of f(x) = 3x² + 2x + 1"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="min-h-[400px] font-mono resize-none"
              />
              <Button
                onClick={handleSolve}
                disabled={isLoading}
                className="w-full mt-4"
                size="lg"
              >
                {isLoading ? "Solving..." : "Solve Problem"}
              </Button>
            </Card>

            {/* Output Section */}
            <Card className="p-6 shadow-paper paper-texture">
              <h2 className="text-xl font-semibold mb-4">Solution</h2>
              <div className="min-h-[400px] p-4 bg-card/50 rounded-lg border border-border overflow-auto">
                {solution ? (
                  <pre className="whitespace-pre-wrap font-sans text-ink">{solution}</pre>
                ) : (
                  <p className="text-muted-foreground italic">Your solution will appear here...</p>
                )}
              </div>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="mt-8 p-6 bg-secondary/30">
            <h3 className="text-lg font-semibold mb-3">💡 Tips for Best Results</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Be specific with your problem statement</li>
              <li>• Use proper mathematical notation (e.g., x², √x, ∫, ∂)</li>
              <li>• Break complex problems into smaller steps</li>
              <li>• Include any given conditions or constraints</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Solver;
