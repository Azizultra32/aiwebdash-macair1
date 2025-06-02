const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.BFF_SUPABASE_URL;
const supabaseKey = process.env.BFF_SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/transcripts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transcripts2')
      .select()
      .order('id', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/createTranscript', async (req, res) => {
  try {
    const transcript = req.body;
    const { error } = await supabase.from('transcripts2').insert([transcript]);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ mid: transcript.mid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.BFF_PORT || 3001;
app.listen(port, () => {
  console.log(`BFF server listening on port ${port}`);
});
