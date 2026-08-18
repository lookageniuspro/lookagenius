-- ============================================================
-- FIX: RLS cross-table infinite recursion
-- Symptom: REST API returns 42P17 "infinite recursion detected in
--   policy for relation courses/enrollments/modules/lessons/..."
-- Cause: policies reference other RLS-protected tables whose
--   policies reference back (courses <-> enrollments chain)
-- Fix: SECURITY DEFINER helper functions bypass RLS and break loops
-- ============================================================

-- ------------------------------------------------------------
-- 1) Helper functions (SECURITY DEFINER bypasses RLS)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = p_course_id AND student_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_course_instructor(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id AND instructor_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_course_published(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id AND is_published = true AND is_approved = true)
$$;

CREATE OR REPLACE FUNCTION public.is_module_instructor(p_module_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.modules JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = p_module_id AND courses.instructor_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_module_enrolled(p_module_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.modules JOIN public.enrollments ON enrollments.course_id = modules.course_id
        WHERE modules.id = p_module_id AND enrollments.student_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_module_published(p_module_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.modules JOIN public.courses ON courses.id = modules.course_id
        WHERE modules.id = p_module_id AND courses.is_published = true AND courses.is_approved = true
    )
$$;

CREATE OR REPLACE FUNCTION public.is_assessment_instructor(p_assessment_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.assessments JOIN public.courses ON courses.id = assessments.course_id
        WHERE assessments.id = p_assessment_id AND courses.instructor_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_assessment_enrolled(p_assessment_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.assessments JOIN public.enrollments ON enrollments.course_id = assessments.course_id
        WHERE assessments.id = p_assessment_id AND enrollments.student_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_question_teacher(p_question_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.assessments ON assessments.id = questions.assessment_id
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE questions.id = p_question_id AND courses.instructor_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_attempt_teacher(p_attempt_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.attempts
        JOIN public.assessments ON assessments.id = attempts.assessment_id
        JOIN public.courses ON courses.id = assessments.course_id
        WHERE attempts.id = p_attempt_id AND courses.instructor_id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_certificate_teacher(p_cert_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.certificates JOIN public.courses ON courses.id = certificates.course_id
        WHERE certificates.id = p_cert_id AND courses.instructor_id = auth.uid()
    )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_instructor_or_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_course_instructor(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_course_published(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_module_instructor(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_module_enrolled(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_module_published(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_assessment_instructor(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_assessment_enrolled(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_question_teacher(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_attempt_teacher(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_certificate_teacher(uuid) TO authenticated, anon;

-- ------------------------------------------------------------
-- 2) Rebuild policies using the helpers
-- ------------------------------------------------------------

-- ============ COURSES ============
DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
DROP POLICY IF EXISTS "courses_select_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_select_enrolled" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_teacher" ON public.courses;
DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
DROP POLICY IF EXISTS "courses_update_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;

CREATE POLICY "courses_select_published" ON public.courses FOR SELECT
    USING (is_published = true AND is_approved = true);
CREATE POLICY "courses_select_own" ON public.courses FOR SELECT
    USING (instructor_id = auth.uid());
CREATE POLICY "courses_select_admin" ON public.courses FOR SELECT
    USING (public.is_admin());
CREATE POLICY "courses_select_enrolled" ON public.courses FOR SELECT
    USING (public.is_enrolled(id));
CREATE POLICY "courses_insert_teacher" ON public.courses FOR INSERT
    WITH CHECK (instructor_id = auth.uid() AND public.is_instructor_or_admin());
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE
    USING (instructor_id = auth.uid()) WITH CHECK (instructor_id = auth.uid());
CREATE POLICY "courses_update_admin" ON public.courses FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE
    USING (instructor_id = auth.uid());
CREATE POLICY "courses_delete_admin" ON public.courses FOR DELETE
    USING (public.is_admin());

-- ============ MODULES ============
DROP POLICY IF EXISTS "modules_select_published" ON public.modules;
DROP POLICY IF EXISTS "modules_select_enrolled" ON public.modules;
DROP POLICY IF EXISTS "modules_select_own" ON public.modules;
DROP POLICY IF EXISTS "modules_select_admin" ON public.modules;
DROP POLICY IF EXISTS "modules_insert_teacher" ON public.modules;
DROP POLICY IF EXISTS "modules_update_teacher" ON public.modules;
DROP POLICY IF EXISTS "modules_delete_teacher" ON public.modules;

CREATE POLICY "modules_select_published" ON public.modules FOR SELECT
    USING (public.is_module_published(id));
CREATE POLICY "modules_select_enrolled" ON public.modules FOR SELECT
    USING (public.is_module_enrolled(id));
CREATE POLICY "modules_select_own" ON public.modules FOR SELECT
    USING (public.is_module_instructor(id));
CREATE POLICY "modules_select_admin" ON public.modules FOR SELECT
    USING (public.is_admin());
CREATE POLICY "modules_insert_teacher" ON public.modules FOR INSERT
    WITH CHECK (public.is_course_instructor(course_id));
CREATE POLICY "modules_update_teacher" ON public.modules FOR UPDATE
    USING (public.is_course_instructor(course_id))
    WITH CHECK (public.is_course_instructor(course_id));
CREATE POLICY "modules_delete_teacher" ON public.modules FOR DELETE
    USING (public.is_course_instructor(course_id));

-- ============ LESSONS ============
DROP POLICY IF EXISTS "lessons_select_published" ON public.lessons;
DROP POLICY IF EXISTS "lessons_select_enrolled" ON public.lessons;
DROP POLICY IF EXISTS "lessons_select_own" ON public.lessons;
DROP POLICY IF EXISTS "lessons_select_admin" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert_teacher" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update_teacher" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete_teacher" ON public.lessons;

CREATE POLICY "lessons_select_published" ON public.lessons FOR SELECT
    USING (public.is_module_published(module_id));
CREATE POLICY "lessons_select_enrolled" ON public.lessons FOR SELECT
    USING (public.is_module_enrolled(module_id));
CREATE POLICY "lessons_select_own" ON public.lessons FOR SELECT
    USING (public.is_module_instructor(module_id));
CREATE POLICY "lessons_select_admin" ON public.lessons FOR SELECT
    USING (public.is_admin());
CREATE POLICY "lessons_insert_teacher" ON public.lessons FOR INSERT
    WITH CHECK (public.is_module_instructor(module_id));
CREATE POLICY "lessons_update_teacher" ON public.lessons FOR UPDATE
    USING (public.is_module_instructor(module_id))
    WITH CHECK (public.is_module_instructor(module_id));
CREATE POLICY "lessons_delete_teacher" ON public.lessons FOR DELETE
    USING (public.is_module_instructor(module_id));

-- ============ ENROLLMENTS ============
DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_select_teacher" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_select_admin" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;

CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT
    USING (student_id = auth.uid());
CREATE POLICY "enrollments_select_teacher" ON public.enrollments FOR SELECT
    USING (public.is_course_instructor(course_id));
CREATE POLICY "enrollments_select_admin" ON public.enrollments FOR SELECT
    USING (public.is_admin());
CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT
    WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments_update_own" ON public.enrollments FOR UPDATE
    USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ============ LESSON PROGRESS ============
DROP POLICY IF EXISTS "lp_select_own" ON public.lesson_progress;
DROP POLICY IF EXISTS "lp_select_teacher" ON public.lesson_progress;
DROP POLICY IF EXISTS "lp_insert_own" ON public.lesson_progress;
DROP POLICY IF EXISTS "lp_update_own" ON public.lesson_progress;

CREATE POLICY "lp_select_own" ON public.lesson_progress FOR SELECT
    USING (student_id = auth.uid());
CREATE POLICY "lp_select_teacher" ON public.lesson_progress FOR SELECT
    USING (public.is_course_instructor(course_id));
CREATE POLICY "lp_insert_own" ON public.lesson_progress FOR INSERT
    WITH CHECK (student_id = auth.uid());
CREATE POLICY "lp_update_own" ON public.lesson_progress FOR UPDATE
    USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ============ ASSESSMENTS ============
DROP POLICY IF EXISTS "assessments_select_published" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select_enrolled" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select_own" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select_admin" ON public.assessments;
DROP POLICY IF EXISTS "assessments_insert_teacher" ON public.assessments;
DROP POLICY IF EXISTS "assessments_update_teacher" ON public.assessments;
DROP POLICY IF EXISTS "assessments_delete_teacher" ON public.assessments;

CREATE POLICY "assessments_select_published" ON public.assessments FOR SELECT
    USING (public.is_course_published(course_id) AND is_published = true);
CREATE POLICY "assessments_select_enrolled" ON public.assessments FOR SELECT
    USING (public.is_enrolled(course_id));
CREATE POLICY "assessments_select_own" ON public.assessments FOR SELECT
    USING (public.is_course_instructor(course_id));
CREATE POLICY "assessments_select_admin" ON public.assessments FOR SELECT
    USING (public.is_admin());
CREATE POLICY "assessments_insert_teacher" ON public.assessments FOR INSERT
    WITH CHECK (public.is_course_instructor(course_id));
CREATE POLICY "assessments_update_teacher" ON public.assessments FOR UPDATE
    USING (public.is_course_instructor(course_id))
    WITH CHECK (public.is_course_instructor(course_id));
CREATE POLICY "assessments_delete_teacher" ON public.assessments FOR DELETE
    USING (public.is_course_instructor(course_id));

-- ============ QUESTIONS ============
DROP POLICY IF EXISTS "questions_select_enrolled" ON public.questions;
DROP POLICY IF EXISTS "questions_select_teacher" ON public.questions;
DROP POLICY IF EXISTS "questions_select_admin" ON public.questions;
DROP POLICY IF EXISTS "questions_insert_teacher" ON public.questions;
DROP POLICY IF EXISTS "questions_update_teacher" ON public.questions;
DROP POLICY IF EXISTS "questions_delete_teacher" ON public.questions;

CREATE POLICY "questions_select_enrolled" ON public.questions FOR SELECT
    USING (public.is_assessment_enrolled(assessment_id));
CREATE POLICY "questions_select_teacher" ON public.questions FOR SELECT
    USING (public.is_assessment_instructor(assessment_id));
CREATE POLICY "questions_select_admin" ON public.questions FOR SELECT
    USING (public.is_admin());
CREATE POLICY "questions_insert_teacher" ON public.questions FOR INSERT
    WITH CHECK (public.is_assessment_instructor(assessment_id));
CREATE POLICY "questions_update_teacher" ON public.questions FOR UPDATE
    USING (public.is_assessment_instructor(assessment_id))
    WITH CHECK (public.is_assessment_instructor(assessment_id));
CREATE POLICY "questions_delete_teacher" ON public.questions FOR DELETE
    USING (public.is_assessment_instructor(assessment_id));

-- ============ ATTEMPTS ============
DROP POLICY IF EXISTS "attempts_select_own" ON public.attempts;
DROP POLICY IF EXISTS "attempts_select_teacher" ON public.attempts;
DROP POLICY IF EXISTS "attempts_select_admin" ON public.attempts;
DROP POLICY IF EXISTS "attempts_insert_own" ON public.attempts;

CREATE POLICY "attempts_select_own" ON public.attempts FOR SELECT
    USING (student_id = auth.uid());
CREATE POLICY "attempts_select_teacher" ON public.attempts FOR SELECT
    USING (public.is_attempt_teacher(id));
CREATE POLICY "attempts_select_admin" ON public.attempts FOR SELECT
    USING (public.is_admin());
CREATE POLICY "attempts_insert_own" ON public.attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- ============ CERTIFICATES ============
DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
DROP POLICY IF EXISTS "certificates_select_teacher" ON public.certificates;
DROP POLICY IF EXISTS "certificates_select_admin" ON public.certificates;
DROP POLICY IF EXISTS "certificates_select_verify" ON public.certificates;
DROP POLICY IF EXISTS "certificates_insert_teacher" ON public.certificates;

CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT
    USING (student_id = auth.uid());
CREATE POLICY "certificates_select_teacher" ON public.certificates FOR SELECT
    USING (public.is_certificate_teacher(id));
CREATE POLICY "certificates_select_admin" ON public.certificates FOR SELECT
    USING (public.is_admin());
CREATE POLICY "certificates_select_verify" ON public.certificates FOR SELECT
    USING (true);
CREATE POLICY "certificates_insert_teacher" ON public.certificates FOR INSERT
    WITH CHECK (public.is_course_instructor(course_id));

-- ============ REVENUES ============
DROP POLICY IF EXISTS "revenues_select_own_teacher" ON public.revenues;
DROP POLICY IF EXISTS "revenues_select_admin" ON public.revenues;
DROP POLICY IF EXISTS "revenues_insert_system" ON public.revenues;
DROP POLICY IF EXISTS "revenues_update_admin" ON public.revenues;

CREATE POLICY "revenues_select_own_teacher" ON public.revenues FOR SELECT
    USING (teacher_id = auth.uid());
CREATE POLICY "revenues_select_admin" ON public.revenues FOR SELECT
    USING (public.is_admin());
CREATE POLICY "revenues_insert_system" ON public.revenues FOR INSERT
    WITH CHECK (true);
CREATE POLICY "revenues_update_admin" ON public.revenues FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ WITHDRAWAL REQUESTS ============
DROP POLICY IF EXISTS "wr_select_own" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "wr_select_admin" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "wr_insert_own" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "wr_update_admin" ON public.withdrawal_requests;

CREATE POLICY "wr_select_own" ON public.withdrawal_requests FOR SELECT
    USING (teacher_id = auth.uid());
CREATE POLICY "wr_select_admin" ON public.withdrawal_requests FOR SELECT
    USING (public.is_admin());
CREATE POLICY "wr_insert_own" ON public.withdrawal_requests FOR INSERT
    WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "wr_update_admin" ON public.withdrawal_requests FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SCHOLARSHIPS ============
DROP POLICY IF EXISTS "scholarships_select" ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_insert_admin" ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_update_admin" ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_delete_admin" ON public.scholarships;

CREATE POLICY "scholarships_select" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "scholarships_insert_admin" ON public.scholarships FOR INSERT
    WITH CHECK (public.is_admin());
CREATE POLICY "scholarships_update_admin" ON public.scholarships FOR UPDATE
    USING (public.is_admin());
CREATE POLICY "scholarships_delete_admin" ON public.scholarships FOR DELETE
    USING (public.is_admin());

-- ============ COLLABORATION REQUESTS ============
DROP POLICY IF EXISTS "collab_select_admin" ON public.collaboration_requests;
DROP POLICY IF EXISTS "collab_insert_public" ON public.collaboration_requests;
DROP POLICY IF EXISTS "collab_update_admin" ON public.collaboration_requests;

CREATE POLICY "collab_select_admin" ON public.collaboration_requests FOR SELECT
    USING (public.is_admin());
CREATE POLICY "collab_insert_public" ON public.collaboration_requests FOR INSERT
    WITH CHECK (true);
CREATE POLICY "collab_update_admin" ON public.collaboration_requests FOR UPDATE
    USING (public.is_admin());

-- ============ SETTINGS ============
DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_update_admin" ON public.settings;

CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_update_admin" ON public.settings FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());