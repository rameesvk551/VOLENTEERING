import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPosts, deletePost, publishPost } from '@/store/slices/blogSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function BlogPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { posts, loading } = useAppSelector((state) => state.blog);

  // Ensure posts is always an array
  const blogPosts = posts || [];

  useEffect(() => {
    dispatch(fetchPosts({}));
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'secondary'> = {
      draft: 'secondary',
      published: 'success',
      archived: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts, categories, and tags</p>
        </div>
        <Button onClick={() => navigate('/admin/blog/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogPosts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {blogPosts.filter((p) => p.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {blogPosts.filter((p) => p.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                blogPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {post.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>{post.publishedAt ? formatDate(post.publishedAt) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {post.status === 'draft' && (
                          <Button size="sm" variant="outline" onClick={() => dispatch(publishPost(post.id))}>
                            Publish
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => dispatch(deletePost(post.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
