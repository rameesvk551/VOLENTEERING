# Blog Image Management Guide

## Overview
The blog editor now supports advanced image insertion and positioning within blog content. Images can be added directly into the blog content (not just as featured images) and positioned with various alignment options.

## Features

### 1. **In-Content Image Upload**
- Click the **image icon** (📷) in the rich text editor toolbar
- Select an image from your computer (max 5MB)
- Image is automatically inserted at the cursor position
- Supports: JPG, PNG, WEBP, GIF formats

### 2. **Image Positioning**

#### Center Alignment (Default)
- Best for: Main images, hero shots, important visuals
- Full-width display with centered positioning
- Proper spacing above and below

#### Left Alignment
- Best for: Supporting images, diagrams
- Text wraps on the right side
- Max 50% width to allow text flow

#### Right Alignment
- Best for: Secondary visuals, portraits
- Text wraps on the left side
- Max 50% width to allow text flow

### 3. **Automatic Styling**
All images get:
- ✅ Rounded corners (border-radius: 8-12px)
- ✅ Shadow effects for depth
- ✅ Hover animations (scale + shadow)
- ✅ Responsive sizing (auto-scales on mobile)
- ✅ Proper spacing (margins)

### 4. **Gallery View**
- The blog post page automatically extracts images from content
- Creates a gallery section (up to 4 images)
- Displays below main content, above tags
- Hover effects with captions

## How to Use

### Adding Images to Your Blog

1. **Position Cursor**
   - Click where you want the image in your content
   - Best practice: Between paragraphs

2. **Insert Image**
   - Click the image icon in toolbar
   - Select image file (< 5MB recommended)
   - Image appears instantly

3. **Position Image** (Optional)
   - Click on the inserted image
   - Use alignment buttons in toolbar:
     - Left align: ⬅️
     - Center align: ↔️ (default)
     - Right align: ➡️

4. **Add Context**
   - Write a paragraph before/after the image
   - Consider adding italicized caption below image

### Best Practices

#### Content Structure
```
Paragraph of text introducing the topic...

[IMAGE - Center aligned, full width]

Paragraph explaining what the image shows...

More text content here...

[IMAGE - Left aligned, text wraps right]

Text content that flows around the image naturally...

[IMAGE - Right aligned, text wraps left]

Text content on the left side...
```

#### Image Selection
- ✅ Use high-quality images (1200-1800px width ideal)
- ✅ Compress images before upload (tools: TinyPNG, Squoosh)
- ✅ Ensure images are relevant to content
- ✅ Use consistent style (color, tone, filters)
- ❌ Avoid low-resolution or pixelated images
- ❌ Don't use watermarked or copyrighted images

#### Image Count
- **Short posts (< 500 words)**: 1-2 images
- **Medium posts (500-1000 words)**: 2-4 images
- **Long posts (> 1000 words)**: 4-6 images

#### Placement Strategy
1. **Hero Image**: Featured image at top (set separately)
2. **Section Images**: One per major section/heading
3. **Supporting Images**: Between paragraphs for visual breaks
4. **Gallery Images**: Extracted automatically for gallery section

## Technical Details

### Supported Features
- ✅ Drag & drop upload (in editor)
- ✅ Click to upload
- ✅ Multiple alignment options
- ✅ Automatic size optimization
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support
- ✅ Lazy loading
- ✅ Hover effects

### CSS Classes Applied
Images automatically receive styling through:
- `quill-custom.css` - Editor styles
- `blog-content.css` - Display page styles

### Performance
- Images are embedded as base64 (for simplicity)
- Consider CDN integration for production
- Lazy loading enabled for performance
- Automatic thumbnail generation (planned)

## Troubleshooting

### Image Too Large
**Problem**: "Image size should be less than 5MB" error
**Solution**: 
- Compress image using online tools
- Reduce image dimensions
- Convert to WebP format

### Image Not Appearing
**Problem**: Image uploaded but not showing
**Solution**:
- Check browser console for errors
- Ensure image format is supported
- Try re-uploading with different image
- Clear browser cache

### Alignment Not Working
**Problem**: Image won't align left/right
**Solution**:
- Select the image first
- Then click alignment button
- Ensure proper paragraph breaks around image
- Check CSS is loaded (inspect element)

### Mobile Display Issues
**Problem**: Images look wrong on mobile
**Solution**:
- All images auto-switch to full-width on mobile
- This is intentional for better readability
- Test in mobile viewport (< 768px)

## Future Enhancements

Planned features:
- [ ] Image caption editor
- [ ] Image alt text editor (SEO)
- [ ] Image crop/resize tool
- [ ] CDN integration
- [ ] Batch image upload
- [ ] Image library/manager
- [ ] Advanced filters/effects
- [ ] Automatic image optimization

## Examples

### Example 1: Travel Blog Post
```
# Exploring Tokyo's Hidden Gems

Tokyo is a city of contrasts, where ancient temples...

[CENTER IMAGE: Tokyo skyline at sunset]

The Shibuya district is known worldwide for...

[LEFT IMAGE: Shibuya crossing] Text wraps naturally around...

For foodies, the Tsukiji Market offers...

[RIGHT IMAGE: Sushi plate] You'll find the freshest...
```

### Example 2: Technical Tutorial
```
# Setting Up Your Development Environment

First, you'll need to install Node.js...

[CENTER IMAGE: Node.js logo]

Open your terminal and run the following...

[CENTER IMAGE: Terminal screenshot]
```

## Support

For issues or questions:
1. Check this guide first
2. Review browser console errors
3. Test in different browser
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: November 3, 2025  
**Maintained by**: Blog Development Team
