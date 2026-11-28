-- Texts & WhatsApp → Tally. Paste into Supabase → SQL Editor → New query → Run (once).
-- Your phone (MacroDroid) sends each new text to /api/msg with your private link; this files it in Tally
-- as one "Reply to <name>" item per sender, which syncs to all your devices like a task.

-- One secret token per person; the phone's link contains it.
create table if not exists public.msg_tokens (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  token text not null unique,
  tz text not null default 'UTC',
  created_at timestamptz not null default now()
);
alter table public.msg_tokens enable row level security;
drop policy if exists "own msg token" on public.msg_tokens;
create policy "own msg token" on public.msg_tokens
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
grant select, insert, update, delete on table public.msg_tokens to authenticated;

-- Files one message. Only works with a valid token. Returns 'added', 'dup' or 'full'.
create or replace function public.msg_in(p_token text, p_src text, p_from text, p_name text, p_text text, p_person boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  u uuid; z text; k text; cur jsonb; msgs jsonb; lastm jsonb;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  loc timestamp; nudge timestamp; who text; src text; body text;
begin
  select user_id, tz into u, z from public.msg_tokens where token = p_token and length(p_token) >= 24;
  if u is null then raise exception 'not allowed'; end if;
  src := case when p_src = 'wa' then 'wa' else 'sms' end;
  who := left(coalesce(nullif(btrim(p_name), ''), nullif(btrim(p_from), ''), 'Unknown'), 80);
  body := left(coalesce(p_text, ''), 1500);
  if btrim(body) = '' then return 'dup'; end if;
  -- the same sender always lands in the same item
  k := 'task:msg-' || substr(md5(src || '|' || lower(coalesce(nullif(btrim(p_from), ''), who))), 1, 16);
  select data into cur from public.items where user_id = u and id = k and not deleted;
  if cur is null and (select count(*) from public.items where user_id = u and kind = 'task' and not deleted and data->>'type' = 'msg') >= 300 then return 'full'; end if;
  msgs := coalesce(cur->'msgs', '[]'::jsonb);
  lastm := msgs->(jsonb_array_length(msgs) - 1);
  -- WhatsApp updates the same notification as more messages arrive: don't file a message twice
  if lastm is not null and lastm->>'text' = body and now_ms - (lastm->>'at')::bigint < 15 * 60000 then return 'dup'; end if;
  msgs := msgs || jsonb_build_array(jsonb_build_object('at', now_ms, 'text', body));
  -- keep the last 12 from a person, 40 from a business (bank texts wait there until Tally turns them into expenses)
  if jsonb_array_length(msgs) > (case when p_person then 12 else 40 end) then
    msgs := (select jsonb_agg(x order by i) from jsonb_array_elements(msgs) with ordinality a(x, i) where i > jsonb_array_length(msgs) - (case when p_person then 12 else 40 end));
  end if;
  -- a nudge an hour later if it's still waiting for a reply; overnight ones wait until 6am
  nudge := null;
  if p_person then
    loc := (clock_timestamp() at time zone coalesce(nullif(z, ''), 'UTC'));
    nudge := date_trunc('minute', loc + interval '1 hour');
    if extract(hour from nudge) >= 22 then nudge := date_trunc('day', nudge) + interval '1 day 6 hours';
    elsif extract(hour from nudge) < 6 then nudge := date_trunc('day', nudge) + interval '6 hours';
    end if;
  end if;
  insert into public.items (user_id, id, kind, data, deleted)
  values (u, k, 'task', jsonb_build_object(
      'id', substr(k, 6), 'type', 'msg', 'title', (case when p_person then 'Reply to ' else '' end) || who,
      'listId', 'inbox', 'due', null, 'time', null, 'recur', null, 'priority', null, 'myDay', null,
      'done', false, 'doneAt', null, 'notes', '', 'steps', '[]'::jsonb, 'projectId', null,
      'createdAt', coalesce((cur->>'createdAt')::bigint, now_ms),
      'reminder', case when nudge is null then null else to_char(nudge, 'YYYY-MM-DD"T"HH24:MI') end,
      'src', src, 'from', left(coalesce(p_from, ''), 80), 'name', who, 'person', p_person,
      'msgs', msgs, 'last', now_ms), false)
  on conflict (user_id, id) do update set data = excluded.data, deleted = false;
  return 'added';
end $$;
revoke all on function public.msg_in(text, text, text, text, text, boolean) from public;
grant execute on function public.msg_in(text, text, text, text, text, boolean) to anon, authenticated;
