const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load kebabData using the same logic as the tests
const dataScriptPath = path.join(__dirname, '../assets/data/kebab-data.js');
const scriptContent = fs.readFileSync(dataScriptPath, 'utf8');

// Simple mock to extract kebabData
const context = { globalThis: {} };
const evalContent = scriptContent.replace(/^const (kebabData|upcomingSpots)/gm, 'context.globalThis.$1');
eval(evalContent);

const kebabData = context.globalThis.kebabData || [];

if (kebabData.length === 0) {
    console.error('No kebabData found!');
    process.exit(1);
}

const SUPABASE_URL = 'https://ehmrxhrfbejcaocpxfed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobXJ4aHJmYmVqY2FvY3B4ZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODc0NzAsImV4cCI6MjA5MzQ2MzQ3MH0.dBcRE6zF9Bnso3A4eDHuhlLX3Sd5pD9AQq71ScnVc1Y';

const ws = require('ws');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws }
});

function convertDate(germanDate) {
    // DD.MM.YYYY to YYYY-MM-DD
    const parts = germanDate.split('.');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return new Date().toISOString().split('T')[0];
}

async function runMigration() {
    console.log(`Starting migration of ${kebabData.length} spots...`);

    let successCount = 0;
    
    for (const spot of kebabData) {
        const payload = {
            reviewer_name: "👑 Pham (CKT)",
            spot_name: spot.name,
            city: spot.city,
            dish: spot.dish,
            preis: spot.preis || "-",
            verzehrort: spot.verzehrort || "-",
            visit_date: convertDate(spot.date),
            fleisch: spot.fleisch,
            gemuese: spot.gemuese,
            sosse: spot.sosse,
            brot: spot.brot,
            balance: spot.balance,
            auswahl: spot.auswahl,
            portion: spot.portion,
            hygiene: spot.hygiene,
            service: spot.service,
            comment_text: spot.kommentar || "Kein Kommentar.",
            image_url: spot.image || "kebab_spot_demo.png",
            is_approved: true
        };

        const { data, error } = await supabase
            .from('community_reviews')
            .insert(payload).select();

        if (error) {
            console.error(`Failed to insert ${spot.name}:`, error);
        } else {
            console.log(`Successfully inserted: ${spot.name}`);
            successCount++;
        }
    }

    console.log(`Migration complete! Successfully migrated ${successCount} spots.`);
}

runMigration();
