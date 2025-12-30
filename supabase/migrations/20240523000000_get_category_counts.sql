-- Create a function to get category counts
create or replace function get_category_counts()
returns table (category text, count bigint)
language plpgsql
as $$
begin
  return query
  select items.category, count(*)
  from items
  where items.status = 'available'
  group by items.category;
end;
$$;
