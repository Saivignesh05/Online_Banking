-- ============================================================
-- ONLINE BANKING SYSTEM — PostgreSQL Schema v3.0 (lowercase)
-- 14 tables | lowercase version | no quotes needed
-- ============================================================

-- ===============================
-- MODULE 1 — USER & ROLE
-- ===============================

create table role (
role_id serial primary key,
role_name varchar(50) not null unique,
description text
);

insert into role (role_name, description) values
('Branch Head','Head of branch'),
('Manager','Manager'),
('Employee','Staff'),
('Account Holder','Customer');

create table user_login (
user_id serial primary key,
username varchar(100) not null unique,
password_hash varchar(255) not null,
role_id int not null
references role(role_id)
on delete restrict,
account_locked boolean not null default false,
failed_attempts int not null default 0
check (failed_attempts >= 0),
created_at timestamp not null default now()
);

-- ===============================
-- MODULE 2 — BRANCH
-- ===============================

create table branch (
branch_id serial primary key,
branch_name varchar(100) not null,
location varchar(255) not null,
contact_number varchar(15),
ifsc_code varchar(20) unique
);

create table branch_head (
branch_head_id serial primary key,
user_id int unique not null
references user_login(user_id),
branch_id int unique not null
references branch(branch_id),
appointed_date date,
status varchar(10) default 'active'
);

create table manager (
manager_id serial primary key,
user_id int unique not null
references user_login(user_id),
branch_head_id int not null
references branch_head(branch_head_id),
department varchar(100),
appointed_date date,
status varchar(10) default 'active'
);

-- ===============================
-- MODULE 3 — EMPLOYEE
-- ===============================

create table employee (
employee_id serial primary key,
user_id int unique not null
references user_login(user_id),
name varchar(100) not null,
branch_id int not null
references branch(branch_id),
manager_id int
references manager(manager_id),
phone varchar(15),
email varchar(100) unique,
hire_date date,
salary numeric(12,2),
status varchar(10) default 'active'
);

-- ===============================
-- MODULE 4 — CUSTOMER
-- ===============================

create table customer (
customer_id serial primary key,
user_id int unique not null
references user_login(user_id),
name varchar(100),
dob date,
gender varchar(10),
phone varchar(15) unique,
email varchar(100) unique,
address text,
pan_card varchar(20),
cibil_score int,
kyc_verified boolean default false,
created_at timestamp default now()
);

create table account (
account_id serial primary key,
customer_id int not null
references customer(customer_id),
branch_id int not null
references branch(branch_id),
account_number varchar(20) unique,
account_type varchar(10),
balance numeric(15,2) default 0,
status varchar(10) default 'active',
opened_date date default current_date,
daily_limit numeric(12,2) default 50000,
min_balance numeric(10,2) default 0
);

-- ===============================
-- MODULE 5 — BENEFICIARY
-- ===============================

create table beneficiary (
beneficiary_id serial primary key,
customer_id int not null
references customer(customer_id)
on delete cascade,
beneficiary_account varchar(20),
beneficiary_name varchar(100),
bank_name varchar(100),
ifsc_code varchar(20),
added_date date default current_date,
status varchar(10) default 'active'
);

-- ===============================
-- MODULE 6 — TRANSACTION
-- ===============================

create table transaction (
tx_id serial primary key,
from_account int
references account(account_id),
to_account int
references account(account_id),
amount numeric(15,2),
tx_type varchar(10),
tx_time timestamp default now(),
status varchar(10) default 'pending',
reference_no varchar(50) unique,
remarks varchar(255)
);

-- ===============================
-- MODULE 7 — LOAN
-- ===============================

create table loan (
loan_id serial primary key,
customer_id int
references customer(customer_id),
account_id int
references account(account_id),
loan_type varchar(100),
loan_amount numeric(15,2),
interest_rate numeric(5,2),
tenure_months int,
start_date date,
status varchar(20),
approved_by int
references employee(employee_id)
);

create table loan_option (
option_id serial primary key,
loan_id int
references loan(loan_id),
interest_rate numeric(5,2),
tenure_months int,
created_at timestamp default now()
);

create table emi_payment (
emi_id serial primary key,
loan_id int
references loan(loan_id),
emi_amount numeric(12,2),
due_date date,
paid_date date,
payment_status varchar(50),
penalty_amount numeric(10,2),
tx_id int
references transaction(tx_id)
);

-- ===============================
-- MODULE 8 — LOGS
-- ===============================

create table login_log (
login_id serial primary key,
user_id int
references user_login(user_id),
user_type varchar(50),
login_time timestamp default now(),
logout_time timestamp,
ip_address varchar(45),
device varchar(100),
status varchar(10)
);

create table audit_log (
audit_id serial primary key,
user_id int
references user_login(user_id),
user_role varchar(50),
action varchar(100),
table_name varchar(100),
record_id int,
old_value text,
new_value text,
action_time timestamp default now(),
ip_address varchar(45)
);

-- =========================================
-- SAMPLE DATA (~50 rows)
-- Works with lowercase schema
-- =========================================

-- ROLE already inserted in schema

-- =========================
-- USER_LOGIN (12)
-- =========================

insert into user_login (username,password_hash,role_id) values
('bh1','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',1),
('mgr1','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',2),
('mgr2','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',2),
('emp1','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',3),
('emp2','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',3),
('emp3','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',3),
('c1','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4),
('c2','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4),
('c3','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4),
('c4','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4),
('c5','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4),
('c6','$2b$10$QZNf/xY9SXcudBjcDDGGCepV1D/X4diFN9GgQgQDVvsRTCRlMLvhC',4);

-- =========================
-- BRANCH (2)
-- =========================

insert into branch (branch_name,location,ifsc_code) values
('kottayam','kerala','ifsc1'),
('kochi','kerala','ifsc2');

-- =========================
-- BRANCH_HEAD (1)
-- =========================

insert into branch_head (user_id,branch_id)
values (1,1);

-- =========================
-- MANAGER (2)
-- =========================

insert into manager (user_id,branch_head_id,department)
values
(2,1,'loans'),
(3,1,'accounts');

-- =========================
-- EMPLOYEE (3)
-- =========================

insert into employee
(user_id,name,branch_id,manager_id,hire_date,salary)
values
(4,'emp a',1,1,'2024-01-01',20000),
(5,'emp b',1,1,'2024-01-01',21000),
(6,'emp c',2,2,'2024-01-01',22000);

-- =========================
-- CUSTOMER (6)
-- =========================

insert into customer
(user_id,name,dob,gender,phone,email,address,cibil_score,kyc_verified)
values
(7,'a','1998-01-01','M','9001','a@mail','k',750,true),
(8,'b','1998-01-01','M','9002','b@mail','k',720,true),
(9,'c','1998-01-01','M','9003','c@mail','k',710,true),
(10,'d','1998-01-01','M','9004','d@mail','k',700,true),
(11,'e','1998-01-01','M','9005','e@mail','k',690,true),
(12,'f','1998-01-01','M','9006','f@mail','k',680,true);

-- =========================
-- ACCOUNT (8)
-- =========================

insert into account
(customer_id,branch_id,account_number,account_type,balance)
values
(1,1,'ac1','savings',1000),
(2,1,'ac2','savings',2000),
(3,1,'ac3','current',3000),
(4,2,'ac4','savings',4000),
(5,2,'ac5','savings',5000),
(6,2,'ac6','fixed',6000),
(1,1,'ac7','savings',7000),
(2,1,'ac8','current',8000);

-- =========================
-- BENEFICIARY (5)
-- =========================

insert into beneficiary
(customer_id,beneficiary_account,beneficiary_name)
values
(1,'ac2','b'),
(2,'ac3','c'),
(3,'ac4','d'),
(4,'ac5','e'),
(5,'ac6','f');

-- =========================
-- TRANSACTION (10)
-- =========================

insert into transaction
(from_account,to_account,amount,tx_type,status,reference_no)
values
(null,1,100,'credit','success','t1'),
(1,null,50,'debit','success','t2'),
(1,2,200,'transfer','success','t3'),
(null,3,300,'credit','success','t4'),
(3,4,400,'transfer','success','t5'),
(4,null,100,'debit','success','t6'),
(null,5,200,'credit','success','t7'),
(5,6,150,'transfer','success','t8'),
(6,null,100,'debit','success','t9'),
(null,2,500,'credit','success','t10');

-- =========================
-- LOAN (4)
-- =========================

insert into loan
(customer_id,account_id,loan_type,loan_amount,interest_rate,tenure_months,start_date,status,approved_by)
values
(1,1,'home',100000,8,60,'2024-01-01','active',1),
(2,2,'car',50000,9,36,'2024-01-01','active',2),
(3,3,'edu',30000,7,24,'2024-01-01','active',3),
(4,4,'home',80000,8,48,'2024-01-01','active',1);

-- =========================
-- EMI (4)
-- =========================

insert into emi_payment
(loan_id,emi_amount,due_date,paid_date,payment_status)
values
(1,2000,'2024-02-01','2024-02-01','paid'),
(2,1500,'2024-02-01','2024-02-01','paid'),
(3,1000,'2024-02-01','2024-02-01','paid'),
(4,1800,'2024-02-01','2024-02-01','paid');

-- =========================
-- LOGIN_LOG (6)
-- =========================

insert into login_log (user_id,user_type,status) values
(7,'customer','success'),
(8,'customer','success'),
(9,'customer','success'),
(4,'employee','success'),
(5,'employee','success'),
(1,'branch_head','success');

-- =========================
-- AUDIT_LOG (6)
-- =========================

insert into audit_log
(user_id,user_role,action,table_name,record_id)
values
(4,'employee','insert','account',1),
(2,'manager','approve','loan',1),
(1,'branch_head','update','employee',1),
(3,'manager','delete','beneficiary',1),
(5,'employee','insert','transaction',2),
(6,'employee','update','account',3);

create or replace procedure create_account(
    in cust_id int,
    in br_id int,
    in acc_no varchar,
    in acc_type varchar,
    in init_balance numeric
)
language plpgsql
as $$
begin

    insert into account
    (customer_id, branch_id, account_number, account_type, balance)
    values
    (cust_id, br_id, acc_no, acc_type, init_balance);

    raise notice 'account created successfully';

end;
$$;

-- 1. Secure Transfer Procedure with Full Atomicity
CREATE OR REPLACE PROCEDURE transfer_money(
    IN p_from_account INT,
    IN p_to_account INT,
    IN p_amount NUMERIC,
    IN p_reference_no VARCHAR,
    IN p_remarks VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    -- Lock the row for update to prevent concurrent race conditions
    SELECT balance INTO v_balance FROM account WHERE account_id = p_from_account FOR UPDATE;
    
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance for transfer (Account ID: %)', p_from_account;
    END IF;

    -- Deduct from sender
    UPDATE account SET balance = balance - p_amount WHERE account_id = p_from_account;
    
    -- Add to receiver
    UPDATE account SET balance = balance + p_amount WHERE account_id = p_to_account;

    -- Log transaction
    INSERT INTO transaction (from_account, to_account, amount, tx_type, status, reference_no, remarks)
    VALUES (p_from_account, p_to_account, p_amount, 'transfer', 'success', p_reference_no, p_remarks);

    COMMIT;
END;
$$;


-- 2. Secure Credit Procedure
CREATE OR REPLACE PROCEDURE credit_account(
    IN p_to_account INT,
    IN p_amount NUMERIC,
    IN p_reference_no VARCHAR,
    IN p_remarks VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Lock the account row
    PERFORM balance FROM account WHERE account_id = p_to_account FOR UPDATE;

    -- Add funds
    UPDATE account SET balance = balance + p_amount WHERE account_id = p_to_account;

    -- Log transaction
    INSERT INTO transaction (from_account, to_account, amount, tx_type, status, reference_no, remarks)
    VALUES (NULL, p_to_account, p_amount, 'credit', 'success', p_reference_no, p_remarks);

    COMMIT;
END;
$$;


-- 3. Secure Debit Procedure
CREATE OR REPLACE PROCEDURE debit_account(
    IN p_from_account INT,
    IN p_amount NUMERIC,
    IN p_reference_no VARCHAR,
    IN p_remarks VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    -- Lock the row to prevent concurrent debits from bypassing the limit
    SELECT balance INTO v_balance FROM account WHERE account_id = p_from_account FOR UPDATE;
    
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance for debit (Account ID: %)', p_from_account;
    END IF;

    -- Deduct funds
    UPDATE account SET balance = balance - p_amount WHERE account_id = p_from_account;

    -- Log transaction
    INSERT INTO transaction (from_account, to_account, amount, tx_type, status, reference_no, remarks)
    VALUES (p_from_account, NULL, p_amount, 'debit', 'success', p_reference_no, p_remarks);

    COMMIT;
END;
$$;


-- 4. Calculate EMI Function
create or replace function calculate_emi(
    loanid int
)
returns numeric
language plpgsql
as $$
declare
    p numeric;
    r numeric;
    n int;
    emi numeric;
begin

    select loan_amount, interest_rate, tenure_months
    into p,r,n
    from loan
    where loan_id = loanid;

    r := r / 1200;

    emi := p * r * power(1+r,n)
           / (power(1+r,n) - 1);

    return emi;

end;
$$;

-- 5. Get Balance Function
create or replace function get_balance(
    accid int
)
returns numeric
language plpgsql
as $$
declare
    bal numeric;
begin

    select balance into bal
    from account
    where account_id = accid;

    return bal;

end;
$$;


-- ============================================================
-- ONLINE BANKING SYSTEM — Database Optimizations (Views & Indices)
-- ============================================================

-- ─── 1. VIEWS ───────────────────────────────────────────────────

-- View for a comprehensive Customer Profile including total balance
CREATE OR REPLACE VIEW v_customer_profile AS
SELECT 
    c.customer_id,
    u.username,
    c.name,
    c.email,
    c.phone,
    c.kyc_verified,
    COUNT(a.account_id) AS total_accounts,
    COALESCE(SUM(a.balance), 0) AS total_balance,
    c.cibil_score,
    c.created_at AS member_since
FROM customer c
JOIN user_login u ON c.user_id = u.user_id
LEFT JOIN account a ON c.customer_id = a.customer_id
GROUP BY c.customer_id, u.username, c.name, c.email, c.phone, c.kyc_verified, c.cibil_score, c.created_at;

-- View for readable Transaction History (shows names instead of IDs)
CREATE OR REPLACE VIEW v_transaction_history AS
SELECT 
    t.tx_id,
    t.reference_no,
    t.tx_time,
    t.amount,
    t.tx_type,
    t.status,
    t.remarks,
    fa.account_number AS from_account_no,
    fc.name AS sender_name,
    ta.account_number AS to_account_no,
    tc.name AS receiver_name
FROM transaction t
LEFT JOIN account fa ON t.from_account = fa.account_id
LEFT JOIN customer fc ON fa.customer_id = fc.customer_id
LEFT JOIN account ta ON t.to_account = ta.account_id
LEFT JOIN customer tc ON ta.customer_id = tc.customer_id;

-- View for Branch Performance Summary
CREATE OR REPLACE VIEW v_branch_summary AS
SELECT 
    b.branch_id,
    b.branch_name,
    b.location,
    b.ifsc_code,
    (SELECT COUNT(*) FROM account a WHERE a.branch_id = b.branch_id) AS total_accounts,
    (SELECT COALESCE(SUM(balance), 0) FROM account a WHERE a.branch_id = b.branch_id) AS total_deposits,
    (SELECT COUNT(*) FROM employee e WHERE e.branch_id = b.branch_id AND e.status = 'active') AS active_staff
FROM branch b;

-- View for Staff to track pending KYC applications
CREATE OR REPLACE VIEW v_pending_kyc AS
SELECT 
    customer_id,
    name,
    email,
    phone,
    pan_card,
    created_at AS application_date
FROM customer
WHERE kyc_verified = false;

-- View for Loan Tracking with repayment progress
CREATE OR REPLACE VIEW v_loan_status AS
SELECT 
    l.loan_id,
    c.name AS customer_name,
    l.loan_type,
    l.loan_amount,
    l.interest_rate,
    l.tenure_months,
    l.status,
    COALESCE(SUM(e.emi_amount), 0) AS total_paid_to_date,
    (l.loan_amount - COALESCE(SUM(e.emi_amount), 0)) AS remaining_balance
FROM loan l
JOIN customer c ON l.customer_id = c.customer_id
LEFT JOIN emi_payment e ON l.loan_id = e.loan_id AND e.payment_status = 'paid'
GROUP BY l.loan_id, c.name, l.loan_type, l.loan_amount, l.interest_rate, l.tenure_months, l.status;


-- ─── 2. INDICES ─────────────────────────────────────────────────

-- Performance for transaction history and statements
CREATE INDEX IF NOT EXISTS idx_tx_time ON transaction(tx_time DESC);
CREATE INDEX IF NOT EXISTS idx_tx_accounts ON transaction(from_account, to_account);

-- Faster lookups for customers and login verification
CREATE INDEX IF NOT EXISTS idx_customer_name ON customer USING btree (name);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);

-- Performance for audit and security logs
CREATE INDEX IF NOT EXISTS idx_login_log_user_time ON login_log(user_id, login_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(table_name, record_id);

-- Optimized tracking for overdue EMIs (Partial Index)
CREATE INDEX IF NOT EXISTS idx_emi_due_pending ON emi_payment(due_date) 
WHERE payment_status = 'pending';


-- ============================================================
-- ONLINE BANKING SYSTEM — Database Security Triggers
-- ============================================================

-- ─── 1. Prevent Transaction Tampering (Immutability) ────────

CREATE OR REPLACE FUNCTION prevent_tx_tampering() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'CRITICAL SECURITY ALERT: Transactions cannot be modified or deleted once created. This constitutes financial tampering.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_no_tx_tampering
BEFORE UPDATE OR DELETE ON transaction
FOR EACH ROW EXECUTE FUNCTION prevent_tx_tampering();


-- ─── 2. Prevent Deletion of Active / Non-Zero Accounts ──────

CREATE OR REPLACE FUNCTION prevent_active_acc_deletion() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.balance > 0 THEN
        RAISE EXCEPTION 'Cannot delete an account with a positive balance (Account ID: %). Transfer funds to 0 first.', OLD.account_id;
    END IF;
    IF OLD.status = 'active' THEN
        RAISE EXCEPTION 'Cannot delete an active account (Account ID: %). Change status to closed first.', OLD.account_id;
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_safe_acc_delete
BEFORE DELETE ON account
FOR EACH ROW EXECUTE FUNCTION prevent_active_acc_deletion();


-- ─── 3. Automatic Account Audit Logging ─────────────────────

CREATE OR REPLACE FUNCTION log_account_changes() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- If balance manually changes (bypassing normal procedures) or status changes
    IF OLD.balance IS DISTINCT FROM NEW.balance OR OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_log (user_role, action, table_name, record_id, old_value, new_value)
        VALUES (
            'SYSTEM', 
            'UPDATE', 
            'account', 
            NEW.account_id, 
            CONCAT('Balance: ', OLD.balance, ', Status: ', OLD.status),
            CONCAT('Balance: ', NEW.balance, ', Status: ', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_account_changes
AFTER UPDATE ON account
FOR EACH ROW EXECUTE FUNCTION log_account_changes();


-- ─── 4. Auto-Lock Account on Too Many Failed Attempts ──────

CREATE OR REPLACE FUNCTION auto_lock_user_account()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If failed attempts reach 5, automatically lock the account
    IF NEW.failed_attempts >= 5 THEN
        NEW.account_locked := true;
    END IF;
    
    -- If an admin or successful login resets attempts to 0, automatically unlock
    IF NEW.failed_attempts = 0 AND OLD.failed_attempts > 0 THEN
        NEW.account_locked := false;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_lock_account
BEFORE UPDATE ON user_login
FOR EACH ROW EXECUTE FUNCTION auto_lock_user_account();


-- ─── 5. Enforce Minimum Balance Constraint ─────────────────

CREATE OR REPLACE FUNCTION enforce_minimum_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reject any balance update that drops below the required minimum
    IF NEW.balance < NEW.min_balance THEN
        RAISE EXCEPTION 'Transaction declined. Account balance (%) cannot drop below the minimum required balance (%).', NEW.balance, NEW.min_balance;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_min_balance
BEFORE UPDATE ON account
FOR EACH ROW EXECUTE FUNCTION enforce_minimum_balance();
