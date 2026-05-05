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
status varchar(10),
approved_by int
references employee(employee_id)
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
('bh1','h',1),
('mgr1','h',2),
('mgr2','h',2),
('emp1','h',3),
('emp2','h',3),
('emp3','h',3),
('c1','h',4),
('c2','h',4),
('c3','h',4),
('c4','h',4),
('c5','h',4),
('c6','h',4);

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

create or replace procedure transfer_money(
    in from_acc int,
    in to_acc int,
    in amt numeric
)
language plpgsql
as $$
declare
    bal numeric;
begin

    select balance into bal
    from account
    where account_id = from_acc;

    if bal < amt then
        raise notice 'insufficient balance';
        return;
    end if;

    update account
    set balance = balance - amt
    where account_id = from_acc;

    update account
    set balance = balance + amt
    where account_id = to_acc;

    insert into transaction
    (from_account,to_account,amount,tx_type,status)
    values
    (from_acc,to_acc,amt,'transfer','success');

    raise notice 'transfer successful';

end;
$$;

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