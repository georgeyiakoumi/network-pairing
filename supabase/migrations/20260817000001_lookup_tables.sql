-- ─────────────────────────────────────────────────────────────
-- Migration: lookup tables
-- Creates all reference/lookup tables. No FKs to other tables.
-- Adding new options = INSERT, no schema change needed.
-- ─────────────────────────────────────────────────────────────

-- locations
create table public.locations (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  sort_order integer not null default 0,
  active     boolean not null default true
);

insert into public.locations (label, sort_order) values
  ('Western Cape',  1),
  ('Gauteng',       2),
  ('KwaZulu-Natal', 3),
  ('Eastern Cape',  4),
  ('Limpopo',       5),
  ('Mpumalanga',    6),
  ('North West',    7),
  ('Free State',    8),
  ('Northern Cape', 9),
  ('International', 10);

-- professions
create table public.professions (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  role       text not null,
  sort_order integer not null default 0,
  active     boolean not null default true,
  unique (category, role)
);

insert into public.professions (category, role, sort_order) values
  -- Design & Creative
  ('Design & Creative', 'Product Designer', 10),
  ('Design & Creative', 'UX Researcher', 20),
  ('Design & Creative', 'UI Designer', 30),
  ('Design & Creative', 'Brand / Visual Designer', 40),
  ('Design & Creative', 'Motion Designer', 50),
  ('Design & Creative', 'Illustrator', 60),
  ('Design & Creative', 'Photographer', 70),
  ('Design & Creative', 'Videographer', 80),
  ('Design & Creative', 'Creative Director', 90),
  ('Design & Creative', 'Art Director', 100),
  ('Design & Creative', 'Graphic Designer', 110),
  ('Design & Creative', 'Content Creator', 120),
  -- Engineering & Technology
  ('Engineering & Technology', 'Frontend Developer', 10),
  ('Engineering & Technology', 'Backend Developer', 20),
  ('Engineering & Technology', 'Full-Stack Developer', 30),
  ('Engineering & Technology', 'Mobile Developer (iOS/Android)', 40),
  ('Engineering & Technology', 'DevOps / Infrastructure', 50),
  ('Engineering & Technology', 'Cloud Architect', 60),
  ('Engineering & Technology', 'Data Engineer', 70),
  ('Engineering & Technology', 'Data Scientist', 80),
  ('Engineering & Technology', 'Machine Learning / AI Engineer', 90),
  ('Engineering & Technology', 'Cybersecurity Specialist', 100),
  ('Engineering & Technology', 'QA / Test Engineer', 110),
  ('Engineering & Technology', 'Solutions Architect', 120),
  ('Engineering & Technology', 'CTO / Tech Lead', 130),
  ('Engineering & Technology', 'Embedded Systems Engineer', 140),
  -- Product & Strategy
  ('Product & Strategy', 'Product Manager', 10),
  ('Product & Strategy', 'Business Analyst', 20),
  ('Product & Strategy', 'Strategy Consultant', 30),
  ('Product & Strategy', 'Operations Manager', 40),
  ('Product & Strategy', 'Chief of Staff', 50),
  ('Product & Strategy', 'Programme Manager', 60),
  ('Product & Strategy', 'Scrum Master / Agile Coach', 70),
  -- Business & Entrepreneurship
  ('Business & Entrepreneurship', 'Founder / CEO', 10),
  ('Business & Entrepreneurship', 'Co-founder', 20),
  ('Business & Entrepreneurship', 'Business Development', 30),
  ('Business & Entrepreneurship', 'Sales', 40),
  ('Business & Entrepreneurship', 'Partnerships & Alliances', 50),
  ('Business & Entrepreneurship', 'Franchise Owner', 60),
  ('Business & Entrepreneurship', 'Social Entrepreneur', 70),
  -- Marketing & Growth
  ('Marketing & Growth', 'Marketing Manager', 10),
  ('Marketing & Growth', 'Growth Marketer', 20),
  ('Marketing & Growth', 'Content Strategist', 30),
  ('Marketing & Growth', 'SEO Specialist', 40),
  ('Marketing & Growth', 'Social Media Manager', 50),
  ('Marketing & Growth', 'Copywriter', 60),
  ('Marketing & Growth', 'PR & Communications', 70),
  ('Marketing & Growth', 'Brand Strategist', 80),
  ('Marketing & Growth', 'Digital Marketing Specialist', 90),
  ('Marketing & Growth', 'Influencer / Creator Economy', 100),
  -- Finance & FinTech
  ('Finance & FinTech', 'Financial Analyst', 10),
  ('Finance & FinTech', 'Accountant', 20),
  ('Finance & FinTech', 'CFO', 30),
  ('Finance & FinTech', 'Investment Analyst', 40),
  ('Finance & FinTech', 'FinTech Specialist', 50),
  ('Finance & FinTech', 'Actuary', 60),
  ('Finance & FinTech', 'Tax Specialist', 70),
  ('Finance & FinTech', 'Compliance Officer', 80),
  ('Finance & FinTech', 'Auditor', 90),
  -- Legal
  ('Legal', 'Lawyer / Legal Counsel', 10),
  ('Legal', 'Corporate Attorney', 20),
  ('Legal', 'IP / Patent Attorney', 30),
  ('Legal', 'Compliance Specialist', 40),
  ('Legal', 'Legal Advisor', 50),
  -- Healthcare & Life Sciences
  ('Healthcare & Life Sciences', 'Doctor / Physician', 10),
  ('Healthcare & Life Sciences', 'Nurse', 20),
  ('Healthcare & Life Sciences', 'Pharmacist', 30),
  ('Healthcare & Life Sciences', 'Biotech Researcher', 40),
  ('Healthcare & Life Sciences', 'Health Tech Specialist', 50),
  ('Healthcare & Life Sciences', 'Psychologist / Therapist', 60),
  ('Healthcare & Life Sciences', 'Public Health Specialist', 70),
  -- Energy & Climate
  ('Energy & Climate', 'Renewable Energy Engineer', 10),
  ('Energy & Climate', 'Environmental Consultant', 20),
  ('Energy & Climate', 'Sustainability Specialist', 30),
  ('Energy & Climate', 'Climate Policy Analyst', 40),
  ('Energy & Climate', 'Energy Project Manager', 50),
  -- AgriTech & Food
  ('AgriTech & Food', 'Agricultural Scientist', 10),
  ('AgriTech & Food', 'AgriTech Specialist', 20),
  ('AgriTech & Food', 'Food Systems Entrepreneur', 30),
  ('AgriTech & Food', 'Supply Chain Manager (Agri)', 40),
  -- Education & EdTech
  ('Education & EdTech', 'Teacher / Educator', 10),
  ('Education & EdTech', 'EdTech Specialist', 20),
  ('Education & EdTech', 'Curriculum Designer', 30),
  ('Education & EdTech', 'Academic / Researcher', 40),
  ('Education & EdTech', 'Learning & Development Specialist', 50),
  ('Education & EdTech', 'Tutor / Coach', 60),
  -- Logistics & Supply Chain
  ('Logistics & Supply Chain', 'Logistics Manager', 10),
  ('Logistics & Supply Chain', 'Supply Chain Analyst', 20),
  ('Logistics & Supply Chain', 'Transport & Mobility Specialist', 30),
  ('Logistics & Supply Chain', 'E-commerce Operations', 40),
  -- People & Talent
  ('People & Talent', 'HR Manager', 10),
  ('People & Talent', 'Talent Acquisition', 20),
  ('People & Talent', 'Recruiter', 30),
  ('People & Talent', 'Executive Coach', 40),
  ('People & Talent', 'Organisational Development', 50),
  -- Media & Journalism
  ('Media & Journalism', 'Journalist', 10),
  ('Media & Journalism', 'Editor', 20),
  ('Media & Journalism', 'Broadcaster', 30),
  ('Media & Journalism', 'Podcast Producer', 40),
  ('Media & Journalism', 'Documentary Filmmaker', 50),
  -- Public Sector & NGO
  ('Public Sector & NGO', 'Government Official', 10),
  ('Public Sector & NGO', 'Policy Analyst', 20),
  ('Public Sector & NGO', 'NGO / Non-profit Leader', 30),
  ('Public Sector & NGO', 'Community Development', 40),
  ('Public Sector & NGO', 'International Development', 50),
  -- Real Estate & Property
  ('Real Estate & Property', 'Property Developer', 10),
  ('Real Estate & Property', 'Real Estate Agent', 20),
  ('Real Estate & Property', 'Architect', 30),
  ('Real Estate & Property', 'Urban Planner', 40),
  ('Real Estate & Property', 'Quantity Surveyor', 50);

-- offers
create table public.offers (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  sort_order integer not null default 0,
  active     boolean not null default true
);

-- needs
create table public.needs (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  sort_order integer not null default 0,
  active     boolean not null default true
);

insert into public.offers (label, sort_order) values
  ('Mentorship', 10),
  ('Technical skills (my profession)', 20),
  ('Industry introductions', 30),
  ('Investment / funding access', 40),
  ('Co-founder search', 50),
  ('Career advice', 60),
  ('Business strategy advice', 70),
  ('Hiring / talent access', 80),
  ('Feedback on my work', 90),
  ('Accountability partner', 100);

insert into public.needs (label, sort_order) values
  ('A mentor', 10),
  ('Technical skills (specific profession)', 20),
  ('Industry introductions', 30),
  ('Investment / funding', 40),
  ('A co-founder', 50),
  ('Career advice', 60),
  ('Business strategy advice', 70),
  ('Help getting hired', 80),
  ('Feedback on my work', 90),
  ('Accountability partner', 100);

-- Enable RLS (read-only for authenticated users — lookup data is public within the app)
alter table public.locations enable row level security;
alter table public.professions enable row level security;
alter table public.offers enable row level security;
alter table public.needs enable row level security;

create policy "Authenticated users can read locations"
  on public.locations for select to authenticated using (true);

create policy "Authenticated users can read professions"
  on public.professions for select to authenticated using (true);

create policy "Authenticated users can read offers"
  on public.offers for select to authenticated using (true);

create policy "Authenticated users can read needs"
  on public.needs for select to authenticated using (true);
