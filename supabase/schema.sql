-- 에코업 도슨트 투어 서버 (Supabase 무료 요금제)
-- 표는 RLS 로 잠그고(정책 없음 = anon 접근 불가), 아래 함수만 anon 에 엽니다.
-- 스태프 번호는 docent_config 에 해시로 저장: select docent_set_pin('1234');  (SQL 편집기에서 한 번)

create extension if not exists pgcrypto;

create table if not exists docent_responses (
  id bigserial primary key,
  device_id text not null unique,          -- 휴대폰마다 무작위로 만든 기기 번호(개인정보 아님)
  day date not null,
  code text not null unique,               -- 교환 번호 A-0001 (날짜 글자 + 그날 순번)
  nickname text not null default '',
  who text, understand text, best text, career text, came text,
  booking_filter text, booking_led text,
  created_at timestamptz not null default now(),
  exchanged_at timestamptz
);

create table if not exists docent_slots (
  program text not null,
  day date not null,
  time text not null,
  closed boolean not null default true,
  primary key (program, day, time)
);

create table if not exists docent_config (key text primary key, value text not null);

alter table docent_responses enable row level security;
alter table docent_slots enable row level security;
alter table docent_config enable row level security;

-- 스태프 번호 설정(관리자가 SQL 편집기에서 실행)
create or replace function docent_set_pin(p_pin text) returns void
language sql security definer set search_path = public, extensions as $$
  insert into docent_config(key, value) values ('staff_pin', crypt(p_pin, gen_salt('bf')))
  on conflict (key) do update set value = excluded.value;
$$;
revoke all on function docent_set_pin(text) from public, anon, authenticated;

create or replace function docent_pin_ok(p_pin text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists(select 1 from docent_config where key = 'staff_pin' and value = crypt(coalesce(p_pin, ''), value));
$$;
revoke all on function docent_pin_ok(text) from public, anon, authenticated;

-- 날짜 → 교환 번호 앞글자
create or replace function docent_letter(p_day date) returns text
language sql immutable as $$
  select case p_day when date '2026-11-18' then 'A' when date '2026-11-19' then 'B'
                    when date '2026-11-20' then 'C' when date '2026-11-21' then 'D' else 'T' end;
$$;

/* ── 참가자 ── */

-- 설문 제출: 같은 기기는 처음 받은 번호를 그대로 돌려줌(닉네임을 바꿔도 같은 번호)
create or replace function docent_submit(p_device text, p_day date, p_nickname text, p_answers jsonb, p_bookings jsonb)
returns table(code text, exchanged boolean)
language plpgsql security definer set search_path = public as $$
declare v_code text; v_seq int;
begin
  if length(coalesce(p_device, '')) < 16 then raise exception 'bad device'; end if;
  select r.code into v_code from docent_responses r where r.device_id = p_device;
  if v_code is null then
    perform pg_advisory_xact_lock(hashtext('docent_seq_' || p_day::text));
    select count(*) + 1 into v_seq from docent_responses r where r.day = p_day;
    v_code := docent_letter(p_day) || '-' || lpad(v_seq::text, 4, '0');
    insert into docent_responses(device_id, day, code, nickname, who, understand, best, career, came, booking_filter, booking_led)
    values (p_device, p_day, v_code, left(coalesce(p_nickname, ''), 12),
            p_answers->>'who', p_answers->>'understand', p_answers->>'best', p_answers->>'career', p_answers->>'came',
            p_bookings->>'filter', p_bookings->>'led');
  end if;
  return query select r.code, r.exchanged_at is not null from docent_responses r where r.device_id = p_device;
end $$;

create or replace function docent_status(p_device text)
returns table(code text, exchanged boolean)
language sql stable security definer set search_path = public as $$
  select r.code, r.exchanged_at is not null from docent_responses r where r.device_id = p_device;
$$;

create or replace function docent_closed_slots(p_day date)
returns table(program text, day date, "time" text)
language sql stable security definer set search_path = public as $$
  select s.program, s.day, s.time from docent_slots s where s.day = p_day and s.closed;
$$;

/* ── 스태프 ── */

create or replace function docent_staff_pin(p_pin text) returns boolean
language sql stable security definer set search_path = public as $$ select docent_pin_ok(p_pin); $$;

create or replace function docent_staff_exchange(p_pin text, p_code text, p_device text) returns text
language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_done timestamptz;
begin
  if not docent_pin_ok(p_pin) then return 'badpin'; end if;
  select id, exchanged_at into v_id, v_done from docent_responses
   where (p_device is not null and device_id = p_device) or (p_device is null and upper(code) = upper(p_code))
   for update;
  if v_id is null then return 'notfound'; end if;
  if v_done is not null then return 'already'; end if;
  update docent_responses set exchanged_at = now() where id = v_id;
  return 'ok';
end $$;

create or replace function docent_staff_set_slot(p_pin text, p_program text, p_day date, p_time text, p_closed boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not docent_pin_ok(p_pin) then return false; end if;
  if p_closed then
    insert into docent_slots(program, day, time, closed) values (p_program, p_day, p_time, true)
    on conflict (program, day, time) do update set closed = true;
  else
    delete from docent_slots where program = p_program and day = p_day and time = p_time;
  end if;
  return true;
end $$;

create or replace function docent_staff_responses(p_pin text)
returns setof jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not docent_pin_ok(p_pin) then return; end if;
  return query select to_jsonb(r) - 'device_id' - 'id' from docent_responses r order by r.id;
end $$;

grant execute on function docent_submit(text, date, text, jsonb, jsonb), docent_status(text), docent_closed_slots(date),
  docent_staff_pin(text), docent_staff_exchange(text, text, text), docent_staff_set_slot(text, text, date, text, boolean),
  docent_staff_responses(text) to anon;
