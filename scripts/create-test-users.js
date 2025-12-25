// Script to create test users using Supabase Admin API
// Run with: node scripts/create-test-users.js YOUR_SERVICE_ROLE_KEY

const SUPABASE_URL = 'https://qvjaousosjmuupyrxjqp.supabase.co';

// Get service role key from command line argument
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: Please provide your Supabase service_role key as an argument');
  console.error('   Usage: node scripts/create-test-users.js YOUR_SERVICE_ROLE_KEY');
  console.error('');
  console.error('   You can find this in your Supabase Dashboard:');
  console.error('   Project Settings → API → service_role (secret)');
  process.exit(1);
}

const testUsers = [
  {
    email: 'adaeze.okonkwo@test.com',
    password: 'TestPass123!',
    full_name: 'Adaeze Okonkwo',
    university: 'University of Lagos',
    bio: 'Final year Computer Science student passionate about using technology to solve African problems. Currently building an EdTech solution for rural schools.',
    skills: ['Python', 'React', 'Machine Learning', 'Mobile Development', 'UI/UX Design'],
    interests: ['EdTech', 'FinTech', 'Social Impact', 'AI/ML'],
    role: 'Tech/Engineering'
  },
  {
    email: 'kwame.asante@test.com',
    password: 'TestPass123!',
    full_name: 'Kwame Asante',
    university: 'University of Ghana',
    bio: 'MBA candidate with 3 years experience in consulting. Looking to co-found a startup that bridges the gap between African farmers and international markets.',
    skills: ['Business Strategy', 'Financial Modeling', 'Market Research', 'Negotiations', 'Project Management'],
    interests: ['AgriTech', 'Supply Chain', 'B2B', 'Export'],
    role: 'Business/Strategy'
  },
  {
    email: 'amina.moyo@test.com',
    password: 'TestPass123!',
    full_name: 'Amina Moyo',
    university: 'University of Cape Town',
    bio: 'Digital marketing specialist with a focus on growth hacking for startups. Previously scaled a student marketplace to 50,000 users.',
    skills: ['Digital Marketing', 'SEO/SEM', 'Social Media', 'Content Strategy', 'Analytics'],
    interests: ['E-commerce', 'Marketplace', 'Consumer Tech', 'Growth'],
    role: 'Marketing/Sales'
  },
  {
    email: 'tariq.hassan@test.com',
    password: 'TestPass123!',
    full_name: 'Tariq Hassan',
    university: 'Cairo University',
    bio: 'Backend engineer specializing in scalable systems. Built payment infrastructure handling millions of transactions. Interested in FinTech revolution in Africa.',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'AWS', 'System Design', 'Blockchain'],
    interests: ['FinTech', 'Payments', 'Crypto', 'Infrastructure'],
    role: 'Tech/Engineering'
  },
  {
    email: 'fatou.diallo@test.com',
    password: 'TestPass123!',
    full_name: 'Fatou Diallo',
    university: 'Université Cheikh Anta Diop',
    bio: 'Product designer passionate about creating inclusive digital experiences. Focused on designing for low-bandwidth environments and feature phones.',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    interests: ['HealthTech', 'Social Impact', 'Accessibility', 'Mobile-First'],
    role: 'Design/Creative'
  },
  {
    email: 'tendai.moyo@test.com',
    password: 'TestPass123!',
    full_name: 'Tendai Moyo',
    university: 'University of Zimbabwe',
    bio: 'Finance graduate with experience in microfinance. Passionate about financial inclusion and helping SMEs access capital across Africa.',
    skills: ['Financial Analysis', 'Excel/Modeling', 'Risk Assessment', 'Fundraising', 'Operations'],
    interests: ['FinTech', 'Microfinance', 'SME', 'Investment'],
    role: 'Finance/Operations'
  },
  {
    email: 'chiamaka.eze@test.com',
    password: 'TestPass123!',
    full_name: 'Chiamaka Eze',
    university: 'University of Ibadan',
    bio: 'Full-stack developer and AI enthusiast. Working on NLP solutions for African languages. Won multiple hackathons across Nigeria.',
    skills: ['JavaScript', 'Python', 'TensorFlow', 'NLP', 'Full-Stack Development'],
    interests: ['AI/ML', 'Language Tech', 'EdTech', 'Developer Tools'],
    role: 'Tech/Engineering'
  },
  {
    email: 'samuel.okello@test.com',
    password: 'TestPass123!',
    full_name: 'Samuel Okello',
    university: 'Makerere University',
    bio: 'Serial entrepreneur with 2 previous startups. Currently researching logistics and last-mile delivery challenges in East Africa.',
    skills: ['Business Development', 'Sales', 'Partnerships', 'Logistics', 'Team Building'],
    interests: ['Logistics', 'E-commerce', 'Last-Mile', 'Delivery'],
    role: 'Business/Strategy'
  },
  {
    email: 'zainab.wanjiku@test.com',
    password: 'TestPass123!',
    full_name: 'Zainab Wanjiku',
    university: 'University of Nairobi',
    bio: 'Communications major with a passion for storytelling. Experience in PR for tech startups. Want to help African startups tell their stories to the world.',
    skills: ['Public Relations', 'Copywriting', 'Brand Strategy', 'Community Building', 'Event Management'],
    interests: ['Media', 'Content', 'Community', 'Startup PR'],
    role: 'Marketing/Sales'
  },
  {
    email: 'ahmed.ibrahim@test.com',
    password: 'TestPass123!',
    full_name: 'Ahmed Ibrahim',
    university: 'University of Khartoum',
    bio: 'Hardware and IoT engineer focused on solar energy solutions. Building affordable solar-powered devices for off-grid communities.',
    skills: ['IoT', 'Embedded Systems', 'Hardware Design', 'Solar Energy', 'Arduino/Raspberry Pi'],
    interests: ['CleanTech', 'Energy', 'Hardware', 'Sustainability'],
    role: 'Tech/Engineering'
  }
];

async function createUser(user) {
  // First, check if user exists using a direct database query
  const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_by_email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_email: user.email })
  });

  // Try to delete user by listing all users and finding the match
  try {
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    });

    if (listResponse.ok) {
      const data = await listResponse.json();
      const existingUser = data.users?.find(u => u.email === user.email);
      if (existingUser) {
        const deleteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY
          }
        });
        if (deleteResponse.ok) {
          console.log(`  Deleted existing user: ${user.email}`);
          // Wait a moment for deletion to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  } catch (e) {
    // Ignore errors when checking/deleting
  }

  // Create new user
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        university: user.university
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create user ${user.email}: ${error}`);
  }

  const createdUser = await response.json();
  
  // Update profile with additional details
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${createdUser.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      role: user.role,
      is_onboarded: true
    })
  });

  if (!profileResponse.ok) {
    console.warn(`  Warning: Could not update profile for ${user.email}`);
  }

  return createdUser;
}

async function main() {
  console.log('🚀 Creating test users for AfriStart...\n');

  const createdUsers = [];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.full_name} (${user.email})`);
      const created = await createUser(user);
      createdUsers.push({ ...user, id: created.id });
      console.log(`  ✅ Created successfully (ID: ${created.id})\n`);
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }

  // Add sample connections
  if (createdUsers.length >= 6) {
    console.log('\n📬 Creating sample connections...');
    
    const connections = [
      { requester: 0, receiver: 1, status: 'accepted' }, // Adaeze -> Kwame
      { requester: 0, receiver: 4, status: 'accepted' }, // Adaeze -> Fatou
      { requester: 2, receiver: 3, status: 'accepted' }, // Amina -> Tariq
      { requester: 6, receiver: 0, status: 'pending' },  // Chiamaka -> Adaeze
      { requester: 7, receiver: 5, status: 'pending' },  // Samuel -> Tendai
      { requester: 8, receiver: 2, status: 'accepted' }  // Zainab -> Amina
    ];

    for (const conn of connections) {
      if (createdUsers[conn.requester] && createdUsers[conn.receiver]) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/connections`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'apikey': SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              requester_id: createdUsers[conn.requester].id,
              receiver_id: createdUsers[conn.receiver].id,
              status: conn.status
            })
          });
          console.log(`  ✅ ${createdUsers[conn.requester].full_name} -> ${createdUsers[conn.receiver].full_name} (${conn.status})`);
        } catch (e) {
          console.log(`  ⚠️ Connection failed: ${e.message}`);
        }
      }
    }
  }

  // Add sample messages
  if (createdUsers.length >= 5) {
    console.log('\n💬 Creating sample messages...');
    
    const messages = [
      { sender: 0, receiver: 1, content: 'Hey Kwame! Great to connect. I think there could be interesting synergies between EdTech and AgriTech.' },
      { sender: 1, receiver: 0, content: 'Absolutely! Agricultural education is a big gap. Lets schedule a call?' },
      { sender: 0, receiver: 1, content: 'Perfect! How about Thursday at 3pm GMT?' },
      { sender: 0, receiver: 4, content: 'Hi Fatou! Your focus on low-bandwidth design is exactly what we need for EduBridge.' },
      { sender: 4, receiver: 0, content: 'Thanks Adaeze! I would love to help design an app that works for everyone.' }
    ];

    for (const msg of messages) {
      if (createdUsers[msg.sender] && createdUsers[msg.receiver]) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'apikey': SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              sender_id: createdUsers[msg.sender].id,
              receiver_id: createdUsers[msg.receiver].id,
              content: msg.content,
              is_read: true
            })
          });
          console.log(`  ✅ ${createdUsers[msg.sender].full_name} -> ${createdUsers[msg.receiver].full_name}`);
        } catch (e) {
          console.log(`  ⚠️ Message failed: ${e.message}`);
        }
      }
    }
  }

  // Add sample goals
  if (createdUsers.length >= 8) {
    console.log('\n🎯 Creating sample goals...');
    
    const goals = [
      { user: 0, title: 'Complete MVP prototype', description: 'Finish the first working version of the EdTech platform', status: 'in-progress' },
      { user: 0, title: 'User interviews', description: 'Conduct 20 user interviews with teachers', status: 'pending' },
      { user: 1, title: 'Market research report', description: 'Complete analysis of AgriTech market in West Africa', status: 'in-progress' },
      { user: 3, title: 'API documentation', description: 'Document all payment API endpoints', status: 'completed' },
      { user: 6, title: 'Train NLP model', description: 'Fine-tune model for Yoruba language', status: 'pending' }
    ];

    for (const goal of goals) {
      if (createdUsers[goal.user]) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/goals`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'apikey': SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: createdUsers[goal.user].id,
              title: goal.title,
              description: goal.description,
              status: goal.status,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
          });
          console.log(`  ✅ ${createdUsers[goal.user].full_name}: ${goal.title}`);
        } catch (e) {
          console.log(`  ⚠️ Goal failed: ${e.message}`);
        }
      }
    }
  }

  // Add sample startup ideas
  if (createdUsers.length >= 10) {
    console.log('\n💡 Creating sample startup ideas...');
    
    const ideas = [
      { user: 0, title: 'EduBridge Africa', description: 'A mobile-first learning platform that works offline, designed for students in rural areas with limited internet connectivity.', industry: 'EdTech', stage: 'mvp', looking_for: ['Backend Developer', 'Content Creator', 'Marketing'] },
      { user: 1, title: 'FarmConnect', description: 'B2B marketplace connecting African farmers directly with international buyers, cutting out middlemen and ensuring fair prices.', industry: 'AgriTech', stage: 'validation', looking_for: ['Tech Co-founder', 'Logistics Expert', 'Sales Lead'] },
      { user: 3, title: 'PaySwift', description: 'Cross-border payment infrastructure for African businesses, enabling instant, low-cost transfers using blockchain.', industry: 'FinTech', stage: 'idea', looking_for: ['Business Development', 'Compliance Expert', 'Frontend Developer'] },
      { user: 7, title: 'DeliverEase', description: 'Last-mile delivery network using motorcycle riders and smart routing to solve the urban delivery problem.', industry: 'Logistics', stage: 'validation', looking_for: ['Tech Lead', 'Operations Manager', 'Investor Relations'] },
      { user: 9, title: 'SolarBox', description: 'Affordable, portable solar power stations for off-grid communities. Pay-as-you-go model makes clean energy accessible.', industry: 'CleanTech', stage: 'mvp', looking_for: ['Hardware Engineer', 'Business Development', 'Distribution Partner'] }
    ];

    for (const idea of ideas) {
      if (createdUsers[idea.user]) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/startup_ideas`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'apikey': SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: createdUsers[idea.user].id,
              title: idea.title,
              description: idea.description,
              industry: idea.industry,
              stage: idea.stage,
              looking_for: idea.looking_for,
              is_public: true
            })
          });
          console.log(`  ✅ ${idea.title} by ${createdUsers[idea.user].full_name}`);
        } catch (e) {
          console.log(`  ⚠️ Idea failed: ${e.message}`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST USERS CREATED SUCCESSFULLY!\n');
  console.log('You can now log in with any of these accounts:');
  console.log('Password for all accounts: TestPass123!\n');
  
  for (const user of testUsers) {
    console.log(`  📧 ${user.email}`);
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
