-- Allow users to edit/delete their own discussion posts.
-- (review_votes already cascades on discussion_posts delete via its FK.)

create policy "users can update their own discussion posts"
  on discussion_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own discussion posts"
  on discussion_posts for delete
  using (auth.uid() = user_id);
