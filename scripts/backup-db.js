const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Fehler: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlen.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws,
  },
});

async function backup() {
  console.log('🚀 Starte Datenbank-Backup...');

  try {
    // 1. Community Reviews abrufen
    const { data: reviews, error: reviewsError } = await supabase
      .from('community_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewsError) throw reviewsError;
    console.log(`✅ ${reviews.length} Reviews geladen.`);

    // 2. Spot Likes abrufen
    const { data: likes, error: likesError } = await supabase
      .from('review_spot_likes')
      .select('*');

    if (likesError) throw likesError;
    console.log(`✅ ${likes.length} Likes geladen.`);

    // 3. Kommentare abrufen
    const { data: comments, error: commentsError } = await supabase
      .from('review_comments')
      .select('*');

    if (commentsError) throw commentsError;
    console.log(`✅ ${comments.length} Kommentare geladen.`);

    // Backup-Objekt erstellen
    const backupData = {
      info: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        description: 'Automatisches Backup der Supabase-Tabellen'
      },
      data: {
        community_reviews: reviews,
        review_spot_likes: likes,
        review_comments: comments
      }
    };

    // Speicherpfad auflösen
    const backupPath = path.resolve(__dirname, '../assets/data/db-backup.json');
    
    // Sicherstellen, dass das Verzeichnis existiert
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Datei schreiben
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    console.log(`\n🎉 Backup erfolgreich! Gespeichert unter: ${backupPath}`);
  } catch (error) {
    console.error('❌ Fehler beim Backup:', error.message);
    process.exit(1);
  }
}

backup();
