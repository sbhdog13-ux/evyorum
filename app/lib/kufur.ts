// Küfür/hakaret filtresi (TR + EN) — mühür ve cevap metinlerinde kullanılır.
// Yaklaşım: normalize et (türkçe karakter + leet + tekrar harf), kelime sınırında ara.
// Not: istemci filtresi %100 değildir; "Şikayet Et" butonu ikinci savunma hattıdır.

const YASAKLI = [
  // TR
  'amk','aq','mk','oc','amina','amını','amcik','amcık','yarrak','yarak','sik','sikik',
  'sikeyim','sikerim','siktir','sittir','orospu','orosbu','kahpe','pic','piç','pezevenk',
  'gavat','ibne','got','göt','gotveren','yavsak','yavşak','dallama','dangalak','serefsiz',
  'şerefsiz','pust','puşt','kaltak','sürtük','surtuk','döl','geber','gebersin',
  // EN
  'fuck','fucking','fucker','shit','bitch','asshole','bastard','cunt','dick','cock',
  'pussy','whore','slut','motherfucker','retard','faggot','nigger','nigga',
];

function normalize(m: string): string {
  return m
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİiI]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[@4]/g, 'a').replace(/[3€]/g, 'e').replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o').replace(/[5$]/g, 's').replace(/[7]/g, 't')
    .replace(/(.)\1{2,}/g, '$1$1'); // 3+ tekrar harfi 2'ye indir (siiiik → siik)
}

const NORMALIZE_YASAKLI = Array.from(new Set(YASAKLI.map(normalize)));

// true dönerse metin engellenmeli
export function kufurVarMi(metin: string): boolean {
  const n = normalize(metin || '');
  const kelimeler = n.split(/[^a-z]+/);
  for (const k of kelimeler) {
    if (!k) continue;
    if (NORMALIZE_YASAKLI.includes(k)) return true;
  }
  return false;
}
