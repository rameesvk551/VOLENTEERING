import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, HelpCircle, FileText } from 'lucide-react';

export function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content & Support</h1>
        <p className="text-gray-600 mt-1">Manage content moderation and customer support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">24</div>
            <p className="text-sm text-gray-600">8 pending, 16 resolved</p>
            <Button variant="outline" className="w-full mt-4">
              View All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">42</div>
            <p className="text-sm text-gray-600">Published articles</p>
            <Button variant="outline" className="w-full mt-4">
              Manage FAQs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">18</div>
            <p className="text-sm text-gray-600">Guides and tutorials</p>
            <Button variant="outline" className="w-full mt-4">
              Edit Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: '1234', subject: 'Payment issue', user: 'John Doe', status: 'pending', priority: 'high' },
              { id: '1235', subject: 'Trip cancellation', user: 'Jane Smith', status: 'resolved', priority: 'medium' },
              { id: '1236', subject: 'Account access', user: 'Bob Johnson', status: 'pending', priority: 'low' },
            ].map((ticket) => (
              <div key={ticket.id} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">#{ticket.id} - {ticket.subject}</p>
                  <p className="text-sm text-gray-500">{ticket.user}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.priority}
                  </span>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
