// Script to create test users in Supabase Auth
// Run this with: npx ts-node scripts/create-test-users.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qvjaousosjmuupyrxjqp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('You can find this in your Supabase dashboard under Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'adaeze.okonkwo@test.com',
    password: 'TestPass123!',
    full_name: 'Adaeze Okonkwo',
    university: 'University of Lagos',
    bio: 'Final year Computer Science student passionate about using technology to solve African problems.',
    skills: ['Python', 'React', 'Machine Learning', 'Mobile Development', 'UI/UX Design'],
    interests: ['EdTech', 'FinTech', 'Social Impact', 'AI/ML'],
    role: 'Tech/Engineering'
  },
  {
    email: 'kwame.asante@test.com',
    password: 'TestPass123!',
    full_name: 'Kwame Asante',
    university: 'University of Ghana',
    bio: 'MBA candidate with 3 years experience in consulting. Looking to co-found AgriTech startup.',
    skills: ['Business Strategy', 'Financial Modeling', 'Market Research', 'Negotiations'],
    interests: ['AgriTech', 'Supply Chain', 'B2B', 'Export'],
    role: 'Business/Strategy'
  },
  {
    email: 'amina.moyo@test.com',
    password: 'TestPass123!',
    full_name: 'Amina Moyo',
    university: 'University of Cape Town',
    bio: 'Digital marketing specialist with a focus on growth hacking for startups.',
    skills: ['Digital Marketing', 'SEO/SEM', 'Social Media', 'Content Strategy', 'Analytics'],
    interests: ['E-commerce', 'Marketplace', 'Consumer Tech', 'Growth'],
    role: 'Marketing/Sales'
  },
  {
    email: 'tariq.hassan@test.com',
    password: 'TestPass123!',
    full_name: 'Tariq Hassan',
    university: 'Cairo University',
    bio: 'Backend engineer specializing in scalable systems and payment infrastructure.',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'AWS', 'System Design', 'Blockchain'],
    interests: ['FinTech', 'Payments', 'Crypto', 'Infrastructure'],
    role: 'Tech/Engineering'
  },
  {
    email: 'fatou.diallo@test.com',
    password: 'TestPass123!',
    full_name: 'Fatou Diallo',
    university: 'Université Cheikh Anta Diop',
    bio: 'Product designer focused on inclusive digital experiences for low-bandwidth environments.',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    interests: ['HealthTech', 'Social Impact', 'Accessibility', 'Mobile-First'],
    role: 'Design/Creative'
  },
  {
    email: 'tendai.moyo@test.com',
    password: 'TestPass123!',
    full_name: 'Tendai Moyo',
    university: 'University of Zimbabwe',
    bio: 'Finance graduate passionate about financial inclusion and helping SMEs access capital.',
    skills: ['Financial Analysis', 'Excel/Modeling', 'Risk Assessment', 'Fundraising'],
    interests: ['FinTech', 'Microfinance', 'SME', 'Investment'],
    role: 'Finance/Operations'
  },
  {
    email: 'chiamaka.eze@test.com',
    password: 'TestPass123!',
    full_name: 'Chiamaka Eze',
    university: 'University of Ibadan',
    bio: 'Full-stack developer and AI enthusiast working on NLP for African languages.',
    skills: ['JavaScript', 'Python', 'TensorFlow', 'NLP', 'Full-Stack Development'],
    interests: ['AI/ML', 'Language Tech', 'EdTech', 'Developer Tools'],
    role: 'Tech/Engineering'
  },
  {
    email: 'samuel.okello@test.com',
    password: 'TestPass123!',
    full_name: 'Samuel Okello',
    university: 'Makerere University',
    bio: 'Serial entrepreneur researching logistics and last-mile delivery in East Africa.',
    skills: ['Business Development', 'Sales', 'Partnerships', 'Logistics', 'Team Building'],
    interests: ['Logistics', 'E-commerce', 'Last-Mile', 'Delivery'],
    role: 'Business/Strategy'
  },
  {
    email: 'zainab.wanjiku@test.com',
    password: 'TestPass123!',
    full_name: 'Zainab Wanjiku',
    university: 'University of Nairobi',
    bio: 'Communications major passionate about helping African startups tell their stories.',
    skills: ['Public Relations', 'Copywriting', 'Brand Strategy', 'Community Building'],
    interests: ['Media', 'Content', 'Community', 'Startup PR'],
    role: 'Marketing/Sales'
  },
  {
    email: 'ahmed.ibrahim@test.com',
    password: 'TestPass123!',
    full_name: 'Ahmed Ibrahim',
    university: 'University of Khartoum',
    bio: 'Hardware and IoT engineer building affordable solar solutions for off-grid communities.',
    skills: ['IoT', 'Embedded Systems', 'Hardware Design', 'Solar Energy', 'Arduino'],
    interests: ['CleanTech', 'Energy', 'Hardware', 'Sustainability'],
    role: 'Tech/Engineering'
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  for (const user of testUsers) {
    try {
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          university: user.university
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⚠️  ${user.email} already exists, updating profile...`);
        } else {
          console.error(`❌ Error creating ${user.email}:`, authError.message);
          continue;
        }
      } else {
        console.log(`✅ Created auth user: ${user.email}`);
      }

      // Update the profile with full details
      const userId = authData?.user?.id;
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            bio: user.bio,
            skills: user.skills,
            interests: user.interests,
            role: user.role,
            is_onboarded: true
          })
          .eq('id', userId);

        if (profileError) {
          console.error(`❌ Error updating profile for ${user.email}:`, profileError.message);
        } else {
          console.log(`   ↳ Profile updated for ${user.full_name}`);
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err);
    }
  }

  console.log('\n✨ Done! Test users created successfully.');
  console.log('\nCredentials (all use the same password):');
  console.log('Password: TestPass123!\n');
  testUsers.forEach(u => console.log(`  📧 ${u.email}`));
}

createTestUsers();
