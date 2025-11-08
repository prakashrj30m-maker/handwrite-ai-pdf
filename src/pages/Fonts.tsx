import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Trash2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";

interface HandwritingFont {
  id: string;
  name: string;
  sample_image_url: string;
  font_style: string;
  is_active: boolean;
}

const FontsPage = () => {
  const navigate = useNavigate();
  const [fonts, setFonts] = useState<HandwritingFont[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fontName, setFontName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fontStyle, setFontStyle] = useState("cursive");

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('handwriting_fonts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFonts(data || []);
    } catch (error) {
      console.error('Error loading fonts:', error);
      toast.error("Failed to load fonts");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!fontName.trim()) {
      toast.error("Please enter a font name");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a handwriting sample image");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('handwriting-samples')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('handwriting-samples')
        .getPublicUrl(fileName);

      // Save font record to database
      const { error: dbError } = await supabase
        .from('handwriting_fonts')
        .insert({
          user_id: user.id,
          name: fontName,
          sample_image_url: publicUrl,
          font_style: fontStyle,
          is_active: false
        });

      if (dbError) throw dbError;

      toast.success("Handwriting sample uploaded successfully!");
      setFontName("");
      setSelectedFile(null);
      setFontStyle("cursive");
      loadFonts();
    } catch (error) {
      console.error('Error uploading font:', error);
      toast.error("Failed to upload handwriting sample");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActive = async (fontId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deactivate all fonts
      await supabase
        .from('handwriting_fonts')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate selected font
      const { error } = await supabase
        .from('handwriting_fonts')
        .update({ is_active: true })
        .eq('id', fontId);

      if (error) throw error;

      toast.success("Active font updated!");
      loadFonts();
    } catch (error) {
      console.error('Error setting active font:', error);
      toast.error("Failed to update active font");
    }
  };

  const handleDelete = async (fontId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/handwriting-samples/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('handwriting-samples')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('handwriting_fonts')
        .delete()
        .eq('id', fontId);

      if (error) throw error;

      toast.success("Font deleted successfully!");
      loadFonts();
    } catch (error) {
      console.error('Error deleting font:', error);
      toast.error("Failed to delete font");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gradient">My Handwriting Fonts</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Upload Section */}
            <Card className="p-6 shadow-paper">
              <h2 className="text-xl font-semibold mb-4">Upload Handwriting Sample</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="font-name">Font Name</Label>
                  <Input
                    id="font-name"
                    placeholder="My Handwriting"
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="font-style">Font Style</Label>
                  <select
                    id="font-style"
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="cursive">Cursive</option>
                    <option value="print">Print</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="file-upload">Handwriting Sample Image</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
                <Button onClick={handleUpload} disabled={isLoading} className="gap-2">
                  <Upload className="w-4 h-4" />
                  {isLoading ? "Uploading..." : "Upload Sample"}
                </Button>
              </div>
            </Card>

            {/* Fonts List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">My Fonts</h2>
              {fonts.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No fonts uploaded yet. Upload your first handwriting sample above!
                </Card>
              ) : (
                <div className="grid gap-4">
                  {fonts.map((font) => (
                    <Card key={font.id} className="p-4 shadow-paper">
                      <div className="flex items-start gap-4">
                        <img
                          src={font.sample_image_url}
                          alt={font.name}
                          className="w-32 h-32 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{font.name}</h3>
                            {font.is_active && (
                              <span className="flex items-center gap-1 text-sm text-primary">
                                <CheckCircle className="w-4 h-4" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Style: {font.font_style}
                          </p>
                          <div className="flex gap-2">
                            {!font.is_active && (
                              <Button
                                onClick={() => handleSetActive(font.id)}
                                size="sm"
                                variant="outline"
                              >
                                Set as Active
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(font.id, font.sample_image_url)}
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default FontsPage;
