-- ============================================================================
-- ACCOUNTIX - Professional Accounting & Business Management Engine
-- Microsoft SQL Server (MSSQL 2019 / 2022 / Azure SQL) DDL Schema
-- Optimized for Double-Entry Accounting, Dual-Role Parties & Hybrid Inventory
-- ============================================================================

-- USE [ACCOUNTIX_DB];
-- GO

-- 1. COMPANIES & FISCAL CONTROL
IF OBJECT_ID('dbo.Companies', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Companies (
        CompanyId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyCode NVARCHAR(20) NOT NULL UNIQUE,
        CompanyName NVARCHAR(150) NOT NULL,
        LegalTradeName NVARCHAR(200) NOT NULL,
        TaxId NVARCHAR(50) NOT NULL, -- GSTIN / VAT / Sales Tax ID
        CurrencyCode CHAR(3) NOT NULL DEFAULT 'USD',
        CurrencySymbol NVARCHAR(5) NOT NULL DEFAULT '$',
        AddressLine NVARCHAR(250) NOT NULL,
        City NVARCHAR(100) NOT NULL,
        StateRegion NVARCHAR(100) NOT NULL,
        Country NVARCHAR(100) NOT NULL,
        PostalCode NVARCHAR(20) NOT NULL,
        Phone NVARCHAR(30) NULL,
        Email NVARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Companies PRIMARY KEY CLUSTERED (CompanyId)
    );
END;
GO

IF OBJECT_ID('dbo.FinancialYears', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FinancialYears (
        FinancialYearId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        YearCode NVARCHAR(20) NOT NULL, -- e.g. '2026-2027'
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        IsLocked BIT NOT NULL DEFAULT 0,
        IsCurrent BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_FinancialYears PRIMARY KEY CLUSTERED (FinancialYearId),
        CONSTRAINT FK_FinancialYears_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
    );
END;
GO

-- 2. CHART OF ACCOUNTS (DOUBLE-ENTRY HIERARCHY)
IF OBJECT_ID('dbo.Accounts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Accounts (
        AccountId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        AccountCode NVARCHAR(20) NOT NULL, -- '1010', '2010', etc.
        AccountName NVARCHAR(150) NOT NULL,
        Category NVARCHAR(20) NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
        SubType NVARCHAR(50) NOT NULL,  -- 'Cash & Bank', 'Sundry Debtors', 'Sundry Creditors', etc.
        ParentAccountId UNIQUEIDENTIFIER NULL,
        OpeningBalance DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        CurrentBalance DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        IsDebitNormal BIT NOT NULL, -- 1 for Asset/Expense, 0 for Liability/Equity/Revenue
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Accounts PRIMARY KEY CLUSTERED (AccountId),
        CONSTRAINT FK_Accounts_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Accounts_ParentAccount FOREIGN KEY (ParentAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT UQ_Company_AccountCode UNIQUE (CompanyId, AccountCode)
    );
END;
GO

-- 3. PARTIES (DUAL-ROLE ARCHITECTURE: CAN BE CUSTOMER, SUPPLIER, OR BOTH)
IF OBJECT_ID('dbo.Parties', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Parties (
        PartyId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        PartyCode NVARCHAR(30) NOT NULL,
        PartyName NVARCHAR(150) NOT NULL,
        LegalTradeName NVARCHAR(200) NULL,
        TaxRegistrationNumber NVARCHAR(50) NULL,
        
        -- DUAL-ROLE FLAGS & SEPARATED LEDGER ACCOUNT LINKS
        IsCustomer BIT NOT NULL DEFAULT 0,
        IsSupplier BIT NOT NULL DEFAULT 0,
        CustomerAccountId UNIQUEIDENTIFIER NULL, -- Subledger account in Accounts Receivable (Assets)
        SupplierAccountId UNIQUEIDENTIFIER NULL, -- Subledger account in Accounts Payable (Liabilities)
        
        CreditPeriodDays INT NOT NULL DEFAULT 30,
        CreditLimit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
        ContactPerson NVARCHAR(100) NULL,
        Phone NVARCHAR(30) NULL,
        Email NVARCHAR(100) NULL,
        BillingAddress NVARCHAR(300) NULL,
        ShippingAddress NVARCHAR(300) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Parties PRIMARY KEY CLUSTERED (PartyId),
        CONSTRAINT FK_Parties_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Parties_CustomerAccount FOREIGN KEY (CustomerAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT FK_Parties_SupplierAccount FOREIGN KEY (SupplierAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT UQ_Company_PartyCode UNIQUE (CompanyId, PartyCode)
    );
END;
GO

-- 4. INVENTORY: CATEGORIES, UNITS, PRODUCTS & SERVICES (HYBRID ARCHITECTURE)
IF OBJECT_ID('dbo.ItemCategories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ItemCategories (
        CategoryId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        CategoryCode NVARCHAR(20) NOT NULL,
        CategoryName NVARCHAR(100) NOT NULL,
        ApplicableType NVARCHAR(20) NOT NULL DEFAULT 'BOTH', -- 'PRODUCT', 'SERVICE', 'BOTH'
        CONSTRAINT PK_ItemCategories PRIMARY KEY CLUSTERED (CategoryId),
        CONSTRAINT FK_ItemCategories_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
    );
END;
GO

IF OBJECT_ID('dbo.UnitsOfMeasurement', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UnitsOfMeasurement (
        UnitId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        UnitCode NVARCHAR(10) NOT NULL, -- 'PCS', 'LTR', 'KGS'
        UnitName NVARCHAR(50) NOT NULL,
        DecimalPlaces TINYINT NOT NULL DEFAULT 0,
        CONSTRAINT PK_UnitsOfMeasurement PRIMARY KEY CLUSTERED (UnitId),
        CONSTRAINT FK_Units_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
    );
END;
GO

IF OBJECT_ID('dbo.Items', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Items (
        ItemId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        ItemCode NVARCHAR(30) NOT NULL,
        ItemName NVARCHAR(150) NOT NULL,
        
        -- ITEM CLASSIFICATION: PRODUCT (PHYSICAL) vs SERVICE (NO PHYSICAL STOCK)
        ItemType NVARCHAR(20) NOT NULL, -- 'PRODUCT' OR 'SERVICE'
        CategoryId UNIQUEIDENTIFIER NOT NULL,
        UnitId UNIQUEIDENTIFIER NULL,   -- Required for Product, NULL or 'SRV' for Service
        
        PurchaseRate DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        SaleRate DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        TaxPercent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        
        -- INVENTORY STOCK CONTROL (Only for PRODUCT type; SERVICE does NOT track stock)
        TracksInventory BIT NOT NULL DEFAULT 1,
        OpeningStock DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        CurrentStock DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        ReorderLevel DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        StoreLocation NVARCHAR(100) NULL,
        
        -- REVENUE & INVENTORY LEDGER LINKAGES
        RevenueAccountId UNIQUEIDENTIFIER NOT NULL, -- Accounts link for Sales / Service Income
        InventoryAccountId UNIQUEIDENTIFIER NULL,  -- Current Asset link (Only for Products)
        CogsAccountId UNIQUEIDENTIFIER NULL,       -- COGS link (Only for Products)
        
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Items PRIMARY KEY CLUSTERED (ItemId),
        CONSTRAINT FK_Items_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryId) REFERENCES dbo.ItemCategories(CategoryId),
        CONSTRAINT FK_Items_Unit FOREIGN KEY (UnitId) REFERENCES dbo.UnitsOfMeasurement(UnitId),
        CONSTRAINT FK_Items_RevenueAccount FOREIGN KEY (RevenueAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT FK_Items_InventoryAccount FOREIGN KEY (InventoryAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT FK_Items_CogsAccount FOREIGN KEY (CogsAccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT UQ_Company_ItemCode UNIQUE (CompanyId, ItemCode),
        -- Constraint: Services must NEVER track inventory stock
        CONSTRAINT CHK_Service_NoInventory CHECK (
            (ItemType = 'SERVICE' AND TracksInventory = 0 AND CurrentStock = 0) OR
            (ItemType = 'PRODUCT')
        )
    );
END;
GO

-- 5. TRANSACTIONS: VOUCHERS & DOUBLE-ENTRY JOURNAL ENTRIES
IF OBJECT_ID('dbo.Vouchers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Vouchers (
        VoucherId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        FinancialYearId UNIQUEIDENTIFIER NOT NULL,
        VoucherNo NVARCHAR(50) NOT NULL,
        VoucherType NVARCHAR(30) NOT NULL, -- 'SALE_INVOICE', 'PURCHASE_INVOICE', 'CASH_RECEIPT', 'CASH_PAYMENT', 'JOURNAL', 'CONTRA'
        VoucherDate DATE NOT NULL,
        ReferenceNo NVARCHAR(50) NULL,
        PartyId UNIQUEIDENTIFIER NULL,
        Narration NVARCHAR(500) NOT NULL,
        TotalAmount DECIMAL(18, 4) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'POSTED', -- 'DRAFT', 'POSTED', 'CANCELLED'
        CreatedBy NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Vouchers PRIMARY KEY CLUSTERED (VoucherId),
        CONSTRAINT FK_Vouchers_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Vouchers_FinancialYears FOREIGN KEY (FinancialYearId) REFERENCES dbo.FinancialYears(FinancialYearId),
        CONSTRAINT FK_Vouchers_Parties FOREIGN KEY (PartyId) REFERENCES dbo.Parties(PartyId),
        CONSTRAINT UQ_Company_FY_VoucherNo UNIQUE (CompanyId, FinancialYearId, VoucherNo)
    );
END;
GO

-- DOUBLE-ENTRY GL LEDGER POSTINGS
IF OBJECT_ID('dbo.VoucherEntries', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VoucherEntries (
        EntryId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        VoucherId UNIQUEIDENTIFIER NOT NULL,
        AccountId UNIQUEIDENTIFIER NOT NULL,
        DebitAmount DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        CreditAmount DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        PartyId UNIQUEIDENTIFIER NULL,
        LineNarration NVARCHAR(250) NULL,
        CONSTRAINT PK_VoucherEntries PRIMARY KEY CLUSTERED (EntryId),
        CONSTRAINT FK_VoucherEntries_Vouchers FOREIGN KEY (VoucherId) REFERENCES dbo.Vouchers(VoucherId) ON DELETE CASCADE,
        CONSTRAINT FK_VoucherEntries_Accounts FOREIGN KEY (AccountId) REFERENCES dbo.Accounts(AccountId),
        CONSTRAINT FK_VoucherEntries_Parties FOREIGN KEY (PartyId) REFERENCES dbo.Parties(PartyId),
        CONSTRAINT CHK_NonNegative_Amounts CHECK (DebitAmount >= 0 AND CreditAmount >= 0),
        CONSTRAINT CHK_EitherDebitOrCredit CHECK (
            (DebitAmount > 0 AND CreditAmount = 0) OR
            (CreditAmount > 0 AND DebitAmount = 0)
        )
    );
END;
GO

-- HYBRID LINE ITEMS FOR SALES & PURCHASES (SUPPORTS PRODUCTS & SERVICES TOGETHER)
IF OBJECT_ID('dbo.VoucherLineItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VoucherLineItems (
        LineItemId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        VoucherId UNIQUEIDENTIFIER NOT NULL,
        ItemId UNIQUEIDENTIFIER NOT NULL,
        ItemType NVARCHAR(20) NOT NULL, -- 'PRODUCT' OR 'SERVICE'
        Quantity DECIMAL(18, 4) NOT NULL,
        Rate DECIMAL(18, 4) NOT NULL,
        DiscountPercent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        TaxPercent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        TaxAmount DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
        LineTotal DECIMAL(18, 4) NOT NULL,
        RevenueAccountId UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_VoucherLineItems PRIMARY KEY CLUSTERED (LineItemId),
        CONSTRAINT FK_VoucherLineItems_Vouchers FOREIGN KEY (VoucherId) REFERENCES dbo.Vouchers(VoucherId) ON DELETE CASCADE,
        CONSTRAINT FK_VoucherLineItems_Items FOREIGN KEY (ItemId) REFERENCES dbo.Items(ItemId),
        CONSTRAINT FK_VoucherLineItems_RevenueAccount FOREIGN KEY (RevenueAccountId) REFERENCES dbo.Accounts(AccountId)
    );
END;
GO

-- 6. COMBINED PARTY LEDGER VIEW (UNIFIES CUSTOMER AND SUPPLIER TRANSACTION RECORDS)
IF OBJECT_ID('dbo.vw_CombinedPartyLedger', 'V') IS NOT NULL
    DROP VIEW dbo.vw_CombinedPartyLedger;
GO

CREATE VIEW dbo.vw_CombinedPartyLedger
AS
SELECT 
    v.CompanyId,
    v.FinancialYearId,
    p.PartyId,
    p.PartyCode,
    p.PartyName,
    v.VoucherDate,
    v.VoucherNo,
    v.VoucherType,
    CASE 
        WHEN ve.AccountId = p.CustomerAccountId THEN 'CUSTOMER'
        WHEN ve.AccountId = p.SupplierAccountId THEN 'SUPPLIER'
        ELSE 'OTHER'
    END AS RoleContext,
    v.Narration,
    ve.DebitAmount,
    ve.CreditAmount,
    -- Net position: Positive indicates Net Receivable (Asset), Negative indicates Net Payable (Liability)
    (ve.DebitAmount - ve.CreditAmount) AS NetImpact
FROM dbo.Vouchers v
INNER JOIN dbo.VoucherEntries ve ON v.VoucherId = ve.VoucherId
INNER JOIN dbo.Parties p ON (ve.PartyId = p.PartyId OR v.PartyId = p.PartyId)
WHERE v.Status = 'POSTED';
GO
