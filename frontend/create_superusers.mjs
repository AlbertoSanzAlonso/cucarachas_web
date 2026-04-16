import { createClient } from '@insforge/sdk';
import fs from 'fs';
import path from 'path';

// Load env vars manually for the script, looking one level up
const envContent = fs.readFileSync('../.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_INSFORGE_URL=(.+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_INSFORGE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const insforge = createClient({
  baseUrl: urlMatch[1].trim(),
  anonKey: keyMatch[1].trim(),
});

const users = [
  { email: 'info@cucarachasbarcelona.cat', password: 'Cucarachas_2026', name: 'Marc Sureda', role: 'Director Tècnic' },
  { email: 'albertosanzdev@gmail.com', password: 'Albertito_23', name: 'Alberto Sanz', role: 'Admin' },
];

async function createSuperusers() {
  for (const user of users) {
    console.log(`Creating user: ${user.email}...`);
    const { data, error } = await insforge.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
         console.log(`User ${user.email} already exists.`);
      } else {
         console.error(`Error creating ${user.email}:`, error);
      }
    } else {
      if (data && data.user) {
        console.log(`User ${user.email} created successfully! ID: ${data.user.id}`);
      } else {
        console.log(`User ${user.email} creation pending/incomplete:`, data);
      }
    }
  }
}

createSuperusers();
