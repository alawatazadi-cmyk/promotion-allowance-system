-- =========================================================================
-- نظام إدارة العلاوات والترفيعات (ALAWAT) - مخطط قاعدة بيانات Supabase (PostgreSQL) المحدث
-- يدعم العناوين الأساسية (main_job_titles) والعناوين الفرعية حسب الدرجة (job_titles)
-- قم بنسخ هذا الكود بالكامل ولصقه في SQL Editor في لوحة تحكم Supabase واضغط RUN
-- =========================================================================

-- تمكين إضافة توليد المعرفات الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول العناوين الأساسية (main_job_titles)
CREATE TABLE IF NOT EXISTS public.main_job_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. جدول العناوين الفرعية حسب الدرجة الوظيفية (job_titles)
CREATE TABLE IF NOT EXISTS public.job_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    main_title_id UUID NOT NULL REFERENCES public.main_job_titles(id) ON DELETE CASCADE,
    title_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT unique_main_grade UNIQUE (main_title_id, grade)
);

-- في حال وجود أعمدة سابقة في job_titles نقوم بتعديلها لتتوافق
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_titles' AND column_name='main_title_id') THEN
        ALTER TABLE public.job_titles ADD COLUMN main_title_id UUID REFERENCES public.main_job_titles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. جدول الموظفين (employees) مع العنوان الأساسي والفرعي وتواريخ آخر استحقاق
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number TEXT,
    full_name TEXT NOT NULL,
    main_job_title_id UUID REFERENCES public.main_job_titles(id) ON DELETE SET NULL,
    job_title_id UUID REFERENCES public.job_titles(id) ON DELETE SET NULL,
    job_stage TEXT DEFAULT 'المرحلة 1',
    hire_date DATE NOT NULL,
    last_promotion_date DATE,
    last_allowance_date DATE,
    current_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ضمان وجود الأعمدة في حال الجداول المنشأة سابقاً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='main_job_title_id') THEN
        ALTER TABLE public.employees ADD COLUMN main_job_title_id UUID REFERENCES public.main_job_titles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='last_promotion_date') THEN
        ALTER TABLE public.employees ADD COLUMN last_promotion_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='last_allowance_date') THEN
        ALTER TABLE public.employees ADD COLUMN last_allowance_date DATE;
    END IF;
END $$;

-- 4. جدول سجل العلاوات والترفيعات (allowances_promotions_history)
CREATE TABLE IF NOT EXISTS public.allowances_promotions_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('علاوة', 'ترفيع')),
    decision_date DATE NOT NULL,
    previous_salary NUMERIC(12, 2) NOT NULL,
    new_salary NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 5. جدول كتب الشكر والتقدير (appreciation_letters)
CREATE TABLE IF NOT EXISTS public.appreciation_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_number TEXT NOT NULL,
    letter_date DATE NOT NULL,
    issuer TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 6. جدول ربط كتب الشكر بالموظفين (letter_employees)
CREATE TABLE IF NOT EXISTS public.letter_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID NOT NULL REFERENCES public.appreciation_letters(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT unique_letter_employee UNIQUE (letter_id, employee_id)
);

-- فهارس لتحسين سرعة الاستعلامات والبحث
CREATE INDEX IF NOT EXISTS idx_main_job_titles_name ON public.main_job_titles(name);
CREATE INDEX IF NOT EXISTS idx_job_titles_main_id ON public.job_titles(main_title_id);
CREATE INDEX IF NOT EXISTS idx_job_titles_grade ON public.job_titles(grade);
CREATE INDEX IF NOT EXISTS idx_emp_number ON public.employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_emp_full_name ON public.employees(full_name);
CREATE INDEX IF NOT EXISTS idx_emp_main_title_id ON public.employees(main_job_title_id);
CREATE INDEX IF NOT EXISTS idx_emp_job_title_id ON public.employees(job_title_id);
CREATE INDEX IF NOT EXISTS idx_history_employee_id ON public.allowances_promotions_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_history_decision_date ON public.allowances_promotions_history(decision_date);
CREATE INDEX IF NOT EXISTS idx_letters_number ON public.appreciation_letters(letter_number);
CREATE INDEX IF NOT EXISTS idx_letter_employees_letter ON public.letter_employees(letter_id);
CREATE INDEX IF NOT EXISTS idx_letter_employees_emp ON public.letter_employees(employee_id);

-- سياسات الأمان RLS
ALTER TABLE public.main_job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowances_promotions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciation_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on main_job_titles" ON public.main_job_titles;
CREATE POLICY "Public access on main_job_titles" ON public.main_job_titles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on job_titles" ON public.job_titles;
CREATE POLICY "Public access on job_titles" ON public.job_titles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on employees" ON public.employees;
CREATE POLICY "Public access on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on allowances_promotions_history" ON public.allowances_promotions_history;
CREATE POLICY "Public access on allowances_promotions_history" ON public.allowances_promotions_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on appreciation_letters" ON public.appreciation_letters;
CREATE POLICY "Public access on appreciation_letters" ON public.appreciation_letters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on letter_employees" ON public.letter_employees;
CREATE POLICY "Public access on letter_employees" ON public.letter_employees FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- بيانات أولية نموذجية للمعاينة والاختبار
-- =========================================================================

-- 1. إضافة العناوين الأساسية
INSERT INTO public.main_job_titles (id, name) VALUES
('10000000-0000-0000-0000-000000000001', 'صيدلي'),
('10000000-0000-0000-0000-000000000002', 'مهندس'),
('10000000-0000-0000-0000-000000000003', 'محاسب'),
('10000000-0000-0000-0000-000000000004', 'تقني إداري')
ON CONFLICT (name) DO NOTHING;

-- 2. إضافة العناوين الفرعية حسب الدرجة لكل عنوان أساسي
INSERT INTO public.job_titles (id, main_title_id, title_name, grade) VALUES
-- صيدلي
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'معاون صيدلي', 'الدرجة الخامسة'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'صيدلي', 'الدرجة الرابعة'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'صيدلي ممارس', 'الدرجة الثالثة'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'صيدلي أقدم', 'الدرجة الثانية'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'رئيس صيادلة', 'الدرجة الأولى'),

-- مهندس
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', 'معاون مهندس', 'الدرجة السابعة'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002', 'مهندس', 'الدرجة الخامسة'),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000002', 'مهندس ممارس', 'الدرجة الرابعة'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000002', 'مهندس أقدم', 'الدرجة الثالثة'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000002', 'رئيس مهندسين أقدم', 'الدرجة الأولى'),

-- محاسب
('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000003', 'معاون محاسب', 'الدرجة السابعة'),
('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000003', 'محاسب', 'الدرجة الخامسة'),
('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000003', 'محاسب رئيسي', 'الدرجة الرابعة'),
('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000003', 'مدقق حسابات أقدم', 'الدرجة الثالثة'),

-- تقني إداري
('20000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000004', 'مساعد إداري', 'الدرجة السابعة'),
('20000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000004', 'مسؤول موارد بشرية', 'الدرجة الخامسة'),
('20000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000004', 'مدير إدارة أقدم', 'الدرجة الأولى')
ON CONFLICT (id) DO NOTHING;

-- 3. إضافة موظفين نموذجيين
INSERT INTO public.employees (id, employee_number, full_name, main_job_title_id, job_title_id, job_stage, hire_date, last_promotion_date, last_allowance_date, current_salary, department) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EMP-1001', 'أحمد محمود العبدلي', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'المرحلة 4', '2019-03-15', '2022-03-15', '2024-03-15', 1450000, 'الصحة والسلامة'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EMP-1002', 'سارة حسين التميمي', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000014', 'المرحلة 2', '2020-07-01', '2024-07-01', '2023-07-01', 1120000, 'الشؤون الهندسية'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'EMP-1003', 'حيدر كريم الجبوري', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000023', 'المرحلة 3', '2021-01-10', '2023-01-10', '2024-01-10', 890000, 'المالية والحسابات'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'EMP-1004', 'نور صادق الخفاجي', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000032', 'المرحلة 1', '2022-04-18', NULL, '2023-04-18', 690000, 'الموارد البشرية'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'EMP-1005', 'علي قاسم الربيعي', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'المرحلة 2', '2023-09-01', NULL, '2024-09-01', 590000, 'الصحة والسلامة')
ON CONFLICT (id) DO NOTHING;

-- 4. إضافة سجل علاوات وترفيعات
INSERT INTO public.allowances_promotions_history (id, employee_id, type, decision_date, previous_salary, new_salary, notes) VALUES
('99999999-9999-9999-9999-999999999991', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'علاوة', '2024-03-15', 1400000, 1450000, 'أمر إداري رقم 118 / استحقاق سنوي دوري'),
('99999999-9999-9999-9999-999999999992', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ترفيع', '2024-07-01', 1050000, 1120000, 'أمر إداري رقم 254 / ترفيع إلى الدرجة الثالثة (مهندس أقدم)')
ON CONFLICT (id) DO NOTHING;

-- 5. كتب شكر وتقدير وربطها بالموظفين
INSERT INTO public.appreciation_letters (id, letter_number, letter_date, issuer, notes) VALUES
('66666666-6666-6666-6666-666666666661', '104/وزاري/2024', '2024-05-10', 'مكتب الوزير', 'كتاب شكر وتقدير للجهود الاستثنائية في إنجاز الرقابة الدوائية (قدم شهر)'),
('66666666-6666-6666-6666-666666666662', '452/د.ع/2024', '2024-08-22', 'المدير العام', 'شكر وتقدير للإشراف المالي المتميز وإغلاق الميزانية السنوية')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letter_employees (letter_id, employee_id) VALUES
('66666666-6666-6666-6666-666666666661', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('66666666-6666-6666-6666-666666666661', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('66666666-6666-6666-6666-666666666662', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;
