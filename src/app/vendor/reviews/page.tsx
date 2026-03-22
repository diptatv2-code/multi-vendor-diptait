'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { StarRating } from '@/components/ui/star-rating';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/types';

export default function VendorReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data: v } = await supabase.from('vendor_profiles').select('id').eq('user_id', user!.id).single();
      if (!v) return;

      const { data } = await supabase
        .from('reviews')
        .select('*, user:user_profiles!reviews_user_id_fkey(full_name), product:products!inner(name, vendor_id)')
        .eq('product.vendor_id', v.id)
        .order('created_at', { ascending: false });
      setReviews((data as unknown as Review[]) || []);
    }
    fetch();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <EmptyState icon={<Star className="w-8 h-8 text-gray-400" />} title="No reviews yet" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{(r.product as unknown as { name: string })?.name}</p>
                  <p className="text-sm text-gray-500">by {(r.user as unknown as { full_name: string })?.full_name}</p>
                </div>
                <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span>
              </div>
              <StarRating rating={r.rating} size="md" />
              {r.title && <p className="font-medium mt-2">{r.title}</p>}
              {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
