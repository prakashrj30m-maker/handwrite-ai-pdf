-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create handwriting_fonts table to store custom fonts
CREATE TABLE public.handwriting_fonts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  sample_image_url TEXT NOT NULL,
  font_style TEXT NOT NULL DEFAULT 'cursive',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handwriting_fonts ENABLE ROW LEVEL SECURITY;

-- Handwriting fonts policies
CREATE POLICY "Users can view their own fonts"
  ON public.handwriting_fonts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fonts"
  ON public.handwriting_fonts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fonts"
  ON public.handwriting_fonts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fonts"
  ON public.handwriting_fonts FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for handwriting samples
INSERT INTO storage.buckets (id, name, public)
VALUES ('handwriting-samples', 'handwriting-samples', true);

-- Storage policies for handwriting samples
CREATE POLICY "Users can view their own handwriting samples"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own handwriting samples"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own handwriting samples"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own handwriting samples"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_handwriting_fonts_updated_at
  BEFORE UPDATE ON public.handwriting_fonts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();