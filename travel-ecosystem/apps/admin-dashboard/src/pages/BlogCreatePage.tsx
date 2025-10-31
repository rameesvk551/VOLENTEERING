import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  featuredImage: string | null;
  category: string;
  tags: string[];
  content: string;
}

interface FormErrors {
  [key: string]: string;
}

interface SEOScore {
  score: number;
  suggestions: string[];
}

export function BlogCreatePage() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    featuredImage: null,
    category: '',
    tags: [],
    content: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, suggestions: [] });

  // Mock data - replace with API calls
  const categories = [
    'Travel Tips',
    'Destination Guides',
    'Volunteering',
    'Culture & Heritage',
    'Adventure Travel',
    'Budget Travel',
    'Food & Cuisine',
  ];

  const availableTags = [
    'backpacking',
    'solo-travel',
    'family-travel',
    'luxury',
    'budget',
    'photography',
    'wildlife',
    'beaches',
    'mountains',
    'cities',
  ];

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Auto-fill meta description from content
  useEffect(() => {
    if (formData.content && !formData.metaDescription) {
      const textContent = formData.content.replace(/<[^>]*>/g, '');
      const metaDesc = textContent.substring(0, 150).trim();
      if (metaDesc) {
        setFormData((prev) => ({ ...prev, metaDescription: metaDesc }));
      }
    }
  }, [formData.content]);

  // Calculate word count
  useEffect(() => {
    const textContent = formData.content.replace(/<[^>]*>/g, '');
    const words = textContent.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [formData.content]);

  // Calculate SEO score
  useEffect(() => {
    const suggestions: string[] = [];
    let score = 0;

    if (formData.title) {
      score += 15;
      if (formData.title.length >= 30 && formData.title.length <= 60) {
        score += 10;
      } else {
        suggestions.push('Title should be between 30-60 characters for optimal SEO');
      }
    } else {
      suggestions.push('Add a compelling title');
    }

    if (formData.metaDescription) {
      score += 15;
      if (formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160) {
        score += 10;
      } else {
        suggestions.push('Meta description should be 120-160 characters');
      }
    } else {
      suggestions.push('Add a meta description');
    }

    if (formData.keywords.length >= 3) {
      score += 15;
    } else {
      suggestions.push('Add at least 3 keywords');
    }

    if (formData.featuredImage) {
      score += 10;
    } else {
      suggestions.push('Add a featured image');
    }

    if (wordCount >= 300) {
      score += 15;
      if (wordCount >= 1000) {
        score += 10;
      }
    } else {
      suggestions.push('Content should be at least 300 words');
    }

    if (formData.category) {
      score += 10;
    } else {
      suggestions.push('Select a category');
    }

    if (formData.tags.length >= 2) {
      score += 5;
    } else {
      suggestions.push('Add at least 2 tags');
    }

    setSeoScore({ score, suggestions });
  }, [formData, wordCount]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('blog_draft', JSON.stringify(formData));
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('blog_draft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, featuredImage: 'Image size should be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleInputChange('featuredImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      handleInputChange('keywords', [...formData.keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleInputChange(
      'keywords',
      formData.keywords.filter((k) => k !== keyword)
    );
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter((t) => t !== tag)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    }
    if (!formData.metaTitle.trim()) {
      newErrors.metaTitle = 'Meta title is required';
    }
    if (!formData.metaDescription.trim()) {
      newErrors.metaDescription = 'Meta description is required';
    }
    if (formData.keywords.length === 0) {
      newErrors.keywords = 'Add at least one keyword';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Saving draft:', formData);
    setIsSaving(false);
    // Show success message
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    setIsPublishing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Publishing:', formData);
    localStorage.removeItem('blog_draft');
    setIsPublishing(false);
    navigate('/admin/blog');
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/blog')}
                aria-label="Go back to blog list"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Blog</h1>
                <p className="text-sm text-gray-500">Write and publish your story</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="transition-all duration-200 hover:bg-gray-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="transition-all duration-200 hover:shadow-lg"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">
                      Blog Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter an engaging title that captures attention..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={cn(
                        'mt-2 text-lg font-medium h-12 transition-all duration-200',
                        errors.title && 'border-red-500 focus:ring-red-500'
                      )}
                      aria-label="Blog title"
                      aria-invalid={!!errors.title}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.title.length} characters (recommended: 30-60)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-base font-semibold">
                      URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
                        /blog/
                      </span>
                      <Input
                        id="slug"
                        placeholder="url-friendly-slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className={cn(
                          'rounded-l-none transition-all duration-200',
                          errors.slug && 'border-red-500'
                        )}
                        aria-label="URL slug"
                      />
                    </div>
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.slug}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            handleInputChange('featuredImage', null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                  {errors.featuredImage && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.featuredImage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Blog Content <span className="text-red-500">*</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => handleInputChange('content', value)}
                    modules={quillModules}
                    className={cn(
                      'bg-white rounded-lg transition-all duration-200',
                      errors.content && 'border border-red-500'
                    )}
                    placeholder="Start writing your amazing content here..."
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.content}
                    </p>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Word count: {wordCount}</span>
                    <span className={wordCount >= 300 ? 'text-green-600' : 'text-orange-600'}>
                      {wordCount >= 300 ? '✓ Good length' : 'Recommended: 300+ words'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Metadata */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>SEO Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">
                      Meta Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="metaTitle"
                      placeholder="Optimized title for search engines"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      className={cn('mt-2', errors.metaTitle && 'border-red-500')}
                    />
                    {errors.metaTitle && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.metaTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">
                      Meta Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="Brief description that appears in search results (120-160 characters)"
                      value={formData.metaDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('metaDescription', e.target.value)}
                      className={cn('mt-2', errors.metaDescription && 'border-red-500')}
                      rows={3}
                    />
                    {errors.metaDescription && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.metaDescription}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaDescription.length} characters (recommended: 120-160)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">
                      Keywords <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="keywords"
                        placeholder="Add keyword and press Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className={cn(errors.keywords && 'border-red-500')}
                      />
                      <Button type="button" onClick={addKeyword} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="pl-3 pr-1 py-1 text-sm transition-all duration-200 hover:bg-gray-200"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {errors.keywords && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.keywords}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category and Tags */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: string) => handleInputChange('category', value)}
                    >
                      <SelectTrigger
                        id="category"
                        className={cn('mt-2', errors.category && 'border-red-500')}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="pl-3 pr-1 py-1 transition-all duration-200 hover:bg-primary/80"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-red-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter((tag) => !formData.tags.includes(tag))
                          .map((tag) => (
                            <button
                              key={tag}
                              onClick={() => addTag(tag)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* SEO Score */}
            <Card className="shadow-md sticky top-24">
              <CardHeader>
                <CardTitle>SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        'w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-500',
                        getSEOScoreBg(seoScore.score)
                      )}
                    >
                      <span className={getSEOScoreColor(seoScore.score)}>{seoScore.score}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Suggestions:</h4>
                    {seoScore.suggestions.length > 0 ? (
                      <ul className="space-y-2">
                        {seoScore.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start text-xs text-gray-600">
                            <AlertCircle className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        All SEO checks passed!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Writing Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use headers (H2, H3) to structure your content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Include relevant images and media</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Write in short, scannable paragraphs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Add internal and external links</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use bullet points and lists</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>End with a clear call-to-action</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Auto-save Indicator */}
            <div className="text-xs text-gray-500 text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Auto-saving to local storage</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
