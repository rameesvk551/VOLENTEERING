import server from '@/server/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: { rating: number; comment: string; hostId: string }) => {
      const res = await fetch(`${server}/user/add-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
        credentials: 'include',
        
      });
if(res.ok){
    toast.success("review added succesfully")
}
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] }); // Refresh reviews
    },
  });
};
export default useAddReview