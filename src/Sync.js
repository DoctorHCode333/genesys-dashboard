SELECT *
FROM (
    SELECT your_columns,  -- replace with actual column names
           timestamp_column,
           ROW_NUMBER() OVER (PARTITION BY TRUNC(timestamp_column) ORDER BY timestamp_column DESC) AS rn
    FROM your_table
)
WHERE rn = 1;
