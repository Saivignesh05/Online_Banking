ALTER TABLE loan ADD COLUMN IF NOT EXISTS repayment_type VARCHAR(20) DEFAULT 'emi';

CREATE TABLE IF NOT EXISTS direct_payment (
    payment_id serial primary key,
    loan_id int references loan(loan_id),
    amount numeric(15,2),
    due_date date,
    paid_date date,
    payment_status varchar(50),
    penalty_amount numeric(10,2),
    tx_id int references transaction(tx_id)
);

CREATE OR REPLACE FUNCTION calculate_direct_loan_amount(loanid int) RETURNS numeric AS $$
DECLARE
    p numeric;
    r numeric;
    n int;
    total numeric;
BEGIN
    SELECT loan_amount, interest_rate, tenure_months INTO p, r, n FROM loan WHERE loan_id = loanid;
    total := p * power(1 + (r / 1200), n);
    RETURN total;
END;
$$ LANGUAGE plpgsql;
