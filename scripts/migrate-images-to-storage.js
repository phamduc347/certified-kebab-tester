/**
 * migrate-images-to-storage.js
 *
 * Findet alle community_reviews, deren image_url ein lokaler Pfad ist
 * (z.B. "assets/img/berlin_rueyam.jpeg"), lädt das Bild in Supabase Storage
 * hoch und aktualisiert den DB-Eintrag mit der öffentlichen URL.
 *
 * Ausführen:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate-images-to-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const ws = require('ws');

const SUPABASE_URL = 'https://ehmrxhrfbejcaocpxfed.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'community-review-images';
const REPO_ROOT = path.resolve(__dirname, '..');

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_SERVICE_ROLE_KEY Umgebungsvariable fehlt.');
  console.error('   Ausführen mit: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate-images-to-storage.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
  };
  return types[ext] || 'image/jpeg';
}

async function migrateImages() {
  console.log('🚀 Starte Bild-Migration zu Supabase Storage...\n');

  // Alle Reviews mit lokalen Bildpfaden abrufen (keine http-URL)
  const { data: reviews, error } = await supabase
    .from('community_reviews')
    .select('id, spot_name, image_url')
    .not('image_url', 'like', 'http%');

  if (error) {
    console.error('❌ Fehler beim Abrufen der Reviews:', error.message);
    process.exit(1);
  }

  console.log(`📋 ${reviews.length} Reviews mit lokalen Bildpfaden gefunden.\n`);

  let success = 0;
  let failed = 0;

  for (const review of reviews) {
    const localPath = path.resolve(REPO_ROOT, review.image_url);
    const filename = path.basename(localPath);
    const storagePath = `public/migrated-${review.id}-${filename}`;

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  [ID ${review.id}] Datei nicht gefunden: ${localPath}`);
      failed++;
      continue;
    }

    // Bild in Supabase Storage hochladen
    const fileBuffer = fs.readFileSync(localPath);
    const mimeType = getMimeType(localPath);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ [ID ${review.id}] Upload fehlgeschlagen: ${uploadError.message}`);
      failed++;
      continue;
    }

    // Öffentliche URL abrufen
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicData.publicUrl;

    // DB-Eintrag aktualisieren
    const { error: updateError } = await supabase
      .from('community_reviews')
      .update({ image_url: publicUrl })
      .eq('id', review.id);

    if (updateError) {
      console.error(`❌ [ID ${review.id}] DB-Update fehlgeschlagen: ${updateError.message}`);
      failed++;
      continue;
    }

    console.log(`✅ [ID ${review.id}] ${review.spot_name}: ${publicUrl}`);
    success++;
  }

  console.log(`\n🎉 Migration abgeschlossen!`);
  console.log(`   Erfolgreich: ${success}`);
  console.log(`   Fehlgeschlagen: ${failed}`);
}

migrateImages();
