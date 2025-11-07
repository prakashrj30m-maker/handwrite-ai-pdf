import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">HomeworkAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-smooth">Features</a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-smooth">How It Works</a>
            <Button onClick={() => navigate('/solver')}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your <span className="text-gradient">Homework</span> Made Simple
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transform your assignments with AI-powered handwriting conversion and mathematical derivation solving. Generate professional PDFs in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/solver')} className="gap-2">
              Start Solving <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/handwriting')}>
              Try Handwriting Converter
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to ace your homework</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-2xl shadow-paper hover:shadow-elevated transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <PenTool className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Handwriting Style</h3>
              <p className="text-muted-foreground">
                Convert typed text to beautiful handwriting style that matches your natural writing. Perfect for personalized assignments.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-paper hover:shadow-elevated transition-smooth">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Math Solver</h3>
              <p className="text-muted-foreground">
                Solve complex mathematical derivations with step-by-step explanations. From algebra to calculus, we've got you covered.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-paper hover:shadow-elevated transition-smooth">
              <div className="w-14 h-14 bg-highlight/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-highlight" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">PDF Export</h3>
              <p className="text-muted-foreground">
                Export your work to professional PDF format with custom styling. Ready to print or submit digitally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to perfect homework</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Enter Your Problem</h3>
                <p className="text-muted-foreground">Type or paste your mathematical problem or text that needs to be converted.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">AI Processing</h3>
                <p className="text-muted-foreground">Our AI analyzes your input and generates solutions or converts to handwriting style.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-highlight rounded-full flex items-center justify-center text-foreground font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Export as PDF</h3>
                <p className="text-muted-foreground">Download your completed homework as a beautifully formatted PDF, ready to submit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Homework?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are making their homework easier and more beautiful.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/solver')} className="gap-2">
            Start Now - It's Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 HomeworkAI. Making homework easier, one problem at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
