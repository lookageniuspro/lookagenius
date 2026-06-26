-- ============================================================
-- LookaGenius — Full Supabase Schema
-- Run this entire file in Supabase SQL Editor once
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. USERS TABLE (linked to auth.users via UUID)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    specialties TEXT[] DEFAULT '{}',
    phone TEXT DEFAULT '',
    country TEXT DEFAULT '',
    education_stage TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: everyone can read own profile; admins read all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. COURSES TABLE
-- ============================================================
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    long_description TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'tech',
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    prerequisites TEXT[] DEFAULT '{}',
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_end_date TIMESTAMPTZ,
    instructor_id UUID REFERENCES public.profiles(id) NOT NULL,
    total_duration INT DEFAULT 0,
    lessons_count INT DEFAULT 0,
    students_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'ar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_published" ON public.courses FOR SELECT
    USING (is_published = true AND is_approved = true);

CREATE POLICY "courses_select_own" ON public.courses FOR SELECT
    USING (instructor_id = auth.uid());

CREATE POLICY "courses_select_admin" ON public.courses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "courses_insert_teacher" ON public.courses FOR INSERT
    WITH CHECK (instructor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE
    USING (instructor_id = auth.uid())
    WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "courses_update_admin" ON public.courses FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE
    USING (instructor_id = auth.uid());

CREATE POLICY "courses_delete_admin" ON public.courses FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Students who are enrolled can view their paid courses
CREATE POLICY "courses_select_enrolled" ON public.courses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = courses.id
        AND enrollments.student_id = auth.uid()
    ));

-- ============================================================
-- 3. MODULES TABLE
-- ============================================================
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select_published" ON public.modules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id
        AND (courses.is_published = true AND courses.is_approved = true)
    ));

CREATE POLICY "modules_select_enrolled" ON public.modules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.enrollments WHERE enrollments.course_id = modules.course_id AND enrollments.student_id = auth.uid()
    ));

CREATE POLICY "modules_select_own" ON public.modules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "modules_select_admin" ON public.modules FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "modules_insert_teacher" ON public.modules FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "modules_update_teacher" ON public.modules FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "modules_delete_teacher" ON public.modules FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid()
    ));

-- ============================================================
-- 4. LESSONS TABLE
-- ============================================================
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    video_duration INT DEFAULT 0,
    content TEXT DEFAULT '',
    attachments JSONB DEFAULT '[]',
    duration INT DEFAULT 0,
    order_index INT NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons inherit module visibility
CREATE POLICY "lessons_select_published" ON public.lessons FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.modules JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id
        AND courses.is_published = true AND courses.is_approved = true
    ));

CREATE POLICY "lessons_select_enrolled" ON public.lessons FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.enrollments ON enrollments.course_id = modules.course_id
        WHERE modules.id = lessons.module_id AND enrollments.student_id = auth.uid()
    ));

CREATE POLICY "lessons_select_own" ON public.lessons FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "lessons_select_admin" ON public.lessons FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "lessons_insert_teacher" ON public.lessons FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "lessons_update_teacher" ON public.lessons FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "lessons_delete_teacher" ON public.lessons FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    ));

-- ============================================================
-- 5. ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    progress_percentage INT DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    UNIQUE(student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "enrollments_select_teacher" ON public.enrollments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = enrollments.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "enrollments_select_admin" ON public.enrollments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "enrollments_update_own" ON public.enrollments FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 6. LESSON PROGRESS TABLE
-- ============================================================
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    watch_seconds INT DEFAULT 0,
    UNIQUE(student_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lp_select_own" ON public.lesson_progress FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "lp_select_teacher" ON public.lesson_progress FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = lesson_progress.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "lp_insert_own" ON public.lesson_progress FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "lp_update_own" ON public.lesson_progress FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 7. ASSESSMENTS TABLE
-- ============================================================
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('quiz', 'final_exam')) DEFAULT 'quiz',
    time_limit INT DEFAULT 30,
    passing_score DECIMAL(5,2) DEFAULT 70,
    total_score DECIMAL(5,2) DEFAULT 100,
    questions_count INT DEFAULT 0,
    attempts_allowed INT DEFAULT 3,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_select_published" ON public.assessments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.is_published = true AND courses.is_approved = true
    ) AND is_published = true);

CREATE POLICY "assessments_select_enrolled" ON public.assessments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.enrollments WHERE enrollments.course_id = assessments.course_id AND enrollments.student_id = auth.uid()
    ));

CREATE POLICY "assessments_select_own" ON public.assessments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "assessments_select_admin" ON public.assessments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "assessments_insert_teacher" ON public.assessments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "assessments_update_teacher" ON public.assessments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.instructor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "assessments_delete_teacher" ON public.assessments FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = assessments.course_id AND courses.instructor_id = auth.uid()
    ));

-- ============================================================
-- 8. QUESTIONS TABLE
-- ============================================================
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'fill_blank')),
    options JSONB DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    score DECIMAL(5,2) DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_enrolled" ON public.questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.enrollments ON enrollments.course_id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND enrollments.student_id = auth.uid()
    ));

CREATE POLICY "questions_select_teacher" ON public.questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "questions_select_admin" ON public.questions FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "questions_insert_teacher" ON public.questions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "questions_update_teacher" ON public.questions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "questions_delete_teacher" ON public.questions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
    ));

-- ============================================================
-- 9. ATTEMPTS TABLE
-- ============================================================
CREATE TABLE public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    score DECIMAL(5,2),
    is_passed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '[]',
    attempt_number INT DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent INT DEFAULT 0
);

ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attempts_select_own" ON public.attempts FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "attempts_select_teacher" ON public.attempts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = attempts.assessment_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "attempts_select_admin" ON public.attempts FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "attempts_insert_own" ON public.attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 10. CERTIFICATES TABLE
-- ============================================================
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    certificate_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    pdf_url TEXT DEFAULT '',
    verification_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "certificates_select_teacher" ON public.certificates FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = certificates.course_id AND courses.instructor_id = auth.uid()
    ));

CREATE POLICY "certificates_select_admin" ON public.certificates FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Anyone can verify a certificate by token
CREATE POLICY "certificates_select_verify" ON public.certificates FOR SELECT
    USING (true);

CREATE POLICY "certificates_insert_teacher" ON public.certificates FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses WHERE courses.id = certificates.course_id AND courses.instructor_id = auth.uid()
    ));

-- ============================================================
-- 11. REVENUES TABLE
-- ============================================================
CREATE TABLE public.revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id),
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    enrollment_id UUID REFERENCES public.enrollments(id),
    amount DECIMAL(10,2) NOT NULL,
    academy_share DECIMAL(10,2) NOT NULL,
    teacher_share DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenues_select_own_teacher" ON public.revenues FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "revenues_select_admin" ON public.revenues FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "revenues_insert_system" ON public.revenues FOR INSERT
    WITH CHECK (true);

CREATE POLICY "revenues_update_admin" ON public.revenues FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 12. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================
-- 13. WITHDRAWAL_REQUESTS (teacher payout requests)
-- ============================================================
CREATE TABLE public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bank_details JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wr_select_own" ON public.withdrawal_requests FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "wr_select_admin" ON public.withdrawal_requests FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "wr_insert_own" ON public.withdrawal_requests FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "wr_update_admin" ON public.withdrawal_requests FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 14. VIDEO ACCESS TOKENS (DRM)
-- ============================================================
CREATE TABLE public.video_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hours',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "va_select_own" ON public.video_access FOR SELECT
    USING (user_id = auth.uid() AND expires_at > NOW());

CREATE POLICY "va_insert_own" ON public.video_access FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 15. REVIEWS / RATINGS
-- ============================================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select" ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 16. SETTINGS TABLE (site-wide config)
-- ============================================================
CREATE TABLE public.settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    site_name TEXT DEFAULT 'LookaGenius',
    site_description TEXT DEFAULT 'Educational Platform',
    logo_url TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    email TEXT DEFAULT '',
    currency TEXT DEFAULT '$',
    academy_share_percent DECIMAL(5,2) DEFAULT 30,
    bot_prompt TEXT DEFAULT '',
    bot_auto_replies JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select" ON public.settings FOR SELECT
    USING (true);

CREATE POLICY "settings_update_admin" ON public.settings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_published ON public.courses(is_published, is_approved);
CREATE INDEX idx_courses_title_trgm ON public.courses USING gin (title gin_trgm_ops);
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_modules_order ON public.modules(course_id, order_index);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_lessons_order ON public.lessons(module_id, order_index);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_lp_student ON public.lesson_progress(student_id);
CREATE INDEX idx_lp_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_assessments_course ON public.assessments(course_id);
CREATE INDEX idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX idx_attempts_student ON public.attempts(student_id);
CREATE INDEX idx_attempts_assessment ON public.attempts(assessment_id);
CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX idx_revenues_teacher ON public.revenues(teacher_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_reviews_course ON public.reviews(course_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_modules BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_lessons BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_assessments BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================
-- FUNCTION: auto-calculate lesson_progress on lesson completion
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalc_course_progress(p_student_id UUID, p_course_id UUID)
RETURNS INT AS $$
DECLARE
    total_lessons INT;
    completed_lessons INT;
    pct INT;
BEGIN
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    WHERE m.course_id = p_course_id;

    IF total_lessons = 0 THEN RETURN 0; END IF;

    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_progress lp
    JOIN public.lessons l ON l.id = lp.lesson_id
    JOIN public.modules m ON m.id = l.module_id
    WHERE m.course_id = p_course_id AND lp.student_id = p_student_id AND lp.is_completed = true;

    pct := (completed_lessons * 100) / total_lessons;

    UPDATE public.enrollments
    SET progress_percentage = pct,
        is_completed = (pct >= 100),
        completed_at = CASE WHEN pct >= 100 AND is_completed = false THEN NOW() ELSE completed_at END
    WHERE student_id = p_student_id AND course_id = p_course_id;

    RETURN pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: auto-update course students_count + rating
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_course_stats(p_course_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.courses
    SET students_count = (SELECT COUNT(*) FROM public.enrollments WHERE course_id = p_course_id),
        rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE course_id = p_course_id), 0)
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA (optional — run once for testing)
-- ============================================================
INSERT INTO public.settings (site_name, site_description, academy_share_percent)
VALUES ('LookaGenius', 'Educational Platform', 30)
ON CONFLICT (id) DO NOTHING;

-- Note: actual user accounts must be created via Supabase Auth UI or signup
-- After creating users, run these INSERTs with real UUIDs:
-- INSERT INTO public.courses (title, description, category, level, instructor_id, price, is_published, is_approved)
-- VALUES ('Arabic: Foundation & Eloquence', '...', 'languages', 'beginner', '<teacher-uuid>', 25, true, true);
