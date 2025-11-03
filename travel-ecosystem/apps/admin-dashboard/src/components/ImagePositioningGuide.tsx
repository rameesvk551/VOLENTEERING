import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export function ImagePositioningGuide() {
  return (
    <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Image className="h-5 w-5 mr-2" />
          Image Positioning Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* How to Add Images */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">
            📤 Adding Images
          </h4>
          <ol className="space-y-1 text-xs text-gray-700">
            <li>1. Click the <strong>image icon</strong> in toolbar</li>
            <li>2. Select image from your computer</li>
            <li>3. Image will be inserted at cursor position</li>
            <li>4. Images auto-resize to fit (max 5MB)</li>
          </ol>
        </div>

        {/* Positioning Options */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">
            📍 Positioning Options
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlignCenter className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong>Center (Default):</strong>
                <p className="text-gray-600">Best for main/hero images</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlignLeft className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong>Left Align:</strong>
                <p className="text-gray-600">Text wraps on the right side</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlignRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong>Right Align:</strong>
                <p className="text-gray-600">Text wraps on the left side</p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">
            ✨ Best Practices
          </h4>
          <ul className="space-y-1 text-xs text-gray-700">
            <li>✓ Use 2-5 images per blog post</li>
            <li>✓ Add images between paragraphs</li>
            <li>✓ Place image after introducing the topic</li>
            <li>✓ Use high-quality, relevant images</li>
            <li>✓ Add line breaks before/after images</li>
            <li>✓ Compress large images before upload</li>
          </ul>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 text-white">
          <p className="text-xs font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Select image → Use alignment buttons in toolbar</li>
            <li>• Images auto-style with shadows & hover effects</li>
            <li>• On mobile, all images display full-width</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
