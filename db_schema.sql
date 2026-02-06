
-- Database: PostgreSQL
-- Currency Trading Management System Schema

-- 1. Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    current_balance NUMERIC(18, 2) DEFAULT 0,
    total_in NUMERIC(18, 2) DEFAULT 0,
    total_out NUMERIC(18, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Supplier Ledger Table
CREATE TABLE supplier_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    type VARCHAR(50) NOT NULL, -- PURCHASE, SALE, ADJUSTMENT
    payment_method VARCHAR(50), -- CASH, BANK, E_WALLET
    amount_in NUMERIC(18, 2) DEFAULT 0,
    amount_out NUMERIC(18, 2) DEFAULT 0,
    balance_after NUMERIC(18, 2) NOT NULL,
    unit_price NUMERIC(18, 4),
    total_value NUMERIC(18, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(100),
    image_url TEXT,
    notes TEXT,
    operator_name VARCHAR(100)
);

-- 4. Purchase Transactions
CREATE TABLE purchase_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    quantity NUMERIC(18, 2) NOT NULL,
    unit_price NUMERIC(18, 4) NOT NULL,
    total_price NUMERIC(18, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sales Transactions
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    client_id UUID REFERENCES clients(id),
    quantity NUMERIC(18, 2) NOT NULL,
    unit_price NUMERIC(18, 4) NOT NULL,
    purchase_price_at_time NUMERIC(18, 4),
    total_price NUMERIC(18, 2) NOT NULL,
    profit NUMERIC(18, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
