import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Example: Fetch data from Supabase
    const { data, error } = await supabase.from('your_table_name').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    // Example: Insert data into Supabase
    const { body } = req;
    try {
      console.log('Request Body:', body);
      const tableName = 'reservations';
      console.log('Inserting into table:', tableName);
      const { data, error } = await supabase.from(tableName).insert([body]);
      if (error) {
        console.error('Supabase Insert Error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Supabase Insert Response:', data);
      } catch (err) {
      console.error('Unexpected Error:', err);
      return res.status(500).json({ error: 'Unexpected server error' });
    }
    return res.status(200).json({ message: 'Data inserted successfully' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
