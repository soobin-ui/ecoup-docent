-- 에코업 도슨트 투어 서버 (Supabase 무료 요금제) — 시안 v2(2026-11): 참가자 등록 + 선물 교환 티켓
-- 표는 RLS 로 잠그고(정책 없음 = anon 접근 불가), 아래 함수만 anon 에 엽니다.
-- 스태프 번호 설정: select docent_set_pin('1234');  (SQL 편집기에서 한 번, 관리자만)
-- 개인정보(이름·휴대폰)는 선물 지급 확인·결과 보고용, 행사 종료 후 파기: truncate docent_participants;

create extension if not exists pgcrypto;

create table if not exists docent_participants (
  no serial primary key,                    -- 티켓 번호 = 투어 완주 순번
  device_id text not null unique,           -- 휴대폰마다 무작위로 만든 기기 번호
  name text not null,
  phone text not null,                      -- 010 뒤 8자리
  who text not null,
  sat int, understand int,
  best text, fun text, career text,
  consent_at timestamptz not null default now(),
  issued_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists docent_config (key text primary key, value text not null);

alter table docent_participants enable row level security;
alter table docent_config enable row level security;

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

/* ── 참가자 ── */

-- 등록+설문 → 티켓. 같은 기기는 처음 받은 티켓 그대로(중복 발급 방지)
create or replace function docent_register(p_device text, p_name text, p_phone text, p_who text, p_survey jsonb)
returns table(no int, issued_at timestamptz, used_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_device, '')) < 16 then raise exception 'bad device'; end if;
  if p_phone !~ '^[0-9]{8}$' then raise exception 'bad phone'; end if;
  insert into docent_participants(device_id, name, phone, who, sat, understand, best, fun, career)
  values (
    p_device, left(trim(p_name), 20), p_phone, left(p_who, 20),
    nullif(p_survey->>'sat', '')::int, nullif(p_survey->>'understand', '')::int,
    (select string_agg(x, ', ') from jsonb_array_elements_text(coalesce(p_survey->'best', '[]')) x),
    (select string_agg(x, ', ') from jsonb_array_elements_text(coalesce(p_survey->'fun', '[]')) x),
    p_survey->>'career'
  )
  on conflict (device_id) do nothing;
  return query select d.no, d.issued_at, d.used_at from docent_participants d where d.device_id = p_device;
end $$;

create or replace function docent_ticket(p_device text)
returns table(no int, issued_at timestamptz, used_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.no, d.issued_at, d.used_at from docent_participants d where d.device_id = p_device;
$$;

/* ── 스태프 ── */

create or replace function docent_staff_pin(p_pin text) returns boolean
language sql stable security definer set search_path = public as $$ select docent_pin_ok(p_pin); $$;

create or replace function docent_staff_use(p_pin text, p_device text, p_no int) returns text
language plpgsql security definer set search_path = public as $$
declare v_no int; v_used timestamptz;
begin
  if not docent_pin_ok(p_pin) then return 'badpin'; end if;
  select d.no, d.used_at into v_no, v_used from docent_participants d
   where (p_device is not null and d.device_id = p_device) or (p_device is null and d.no = p_no)
   for update;
  if v_no is null then return 'notfound'; end if;
  if v_used is not null then return 'already'; end if;
  update docent_participants set used_at = now() where no = v_no;
  return 'ok';
end $$;

create or replace function docent_staff_list(p_pin text)
returns setof jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not docent_pin_ok(p_pin) then return; end if;
  return query select to_jsonb(d) - 'device_id' - 'consent_at' from docent_participants d order by d.no;
end $$;

grant execute on function docent_register(text, text, text, text, jsonb), docent_ticket(text),
  docent_staff_pin(text), docent_staff_use(text, text, int), docent_staff_list(text) to anon;
