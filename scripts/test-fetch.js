const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const SUPABASE_URL = 'https://ehmrxhrfbejcaocpxfed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobXJ4aHJmYmVqY2FvY3B4ZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODc0NzAsImV4cCI6MjA5MzQ2MzQ3MH0.dBcRE6zF9Bnso3A4eDHuhlLX3Sd5pD9AQq71ScnVc1Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws }
});

async function test() {
    const { data, error } = await supabase
            .from('community_reviews')
            .select('id, reviewer_name, spot_name, city, dish, preis, verzehrort, visit_date, fleisch, gemuese, sosse, brot, balance, auswahl, portion, hygiene, service, comment_text, image_url, created_at')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(300);
    console.log(error ? 'Error' : 'Success', data ? data.length : 0);
}
test();
