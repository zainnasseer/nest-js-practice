-- Drop everything and let TypeORM recreate from scratch
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS public.users_usertype_enum CASCADE;
