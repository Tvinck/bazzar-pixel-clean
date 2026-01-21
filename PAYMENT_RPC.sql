-- 1. Списание средств
-- Возвращает TRUE если успешно списало, FALSE если не хватает денег
create or replace function public.charge_user_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer
as $$
declare
  current_bal int;
begin
  -- Блокируем строку для избежания гонки
  select balance into current_bal from profiles where id = p_user_id for update;
  
  if current_bal is null or current_bal < p_amount then
    return false;
  end if;

  update profiles 
  set balance = balance - p_amount 
  where id = p_user_id;

  -- Логируем транзакцию (опционально, создайте таблицу transactions если её нет)
  -- insert into transactions (user_id, amount, type) values (p_user_id, -p_amount, 'spend');
  
  return true;
end;
$$;

-- 2. Получение цены модели (безопасно)
create or replace function public.get_model_cost(p_model_id text)
returns int
language plpgsql
security definer
as $$
declare
  v_cost int;
begin
  select cost into v_cost from ai_models where id = p_model_id;
  return coalesce(v_cost, 4); -- 4 кредита по умолчанию, если модель не найдена
end;
$$;

-- 3. Возврат средств (Refund)
create or replace function public.refund_user_credits(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles 
  set balance = balance + p_amount 
  where id = p_user_id;
end;
$$;
