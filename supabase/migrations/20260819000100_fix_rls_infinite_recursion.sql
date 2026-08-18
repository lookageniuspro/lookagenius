-- ============================================================
-- FIX: RLS infinite recursion on public.profiles
-- Symptom: REST API returns 42P17 "infinite recursion detected in policy for relation profiles"
-- Cause: policies on profiles query profiles themselves (role = 'admin' subquery)
-- Fix: SECURITY DEFINER function breaks the recursion loop
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());