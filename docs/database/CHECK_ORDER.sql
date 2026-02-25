-- Поиск транзакции по OrderId (извлечение из JSON metadata)
SELECT * 
FROM transactions 
WHERE metadata->>'OrderId' = 'BZR_20009178'
LIMIT 1;
