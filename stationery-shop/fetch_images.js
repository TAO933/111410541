const fs = require('fs');

const requests = [
  // 1
  { name: '三菱UNI-BALL ONE F 兔子便利商店聯名筆', req_id: '55a65ce32a0f9d7015e5755b7e11e3b534b683e27c5058a7534724729bd3026c9ca84e2073a4db250b63eb1ecf252007' },
  { name: 'PILOT 按鍵魔擦筆0.5-Waai', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5ed73ea1419910ef806f1d41f412776dc' },
  { name: 'PILOT螢光魔擦筆-Waai 獨家墨水', req_id: '55a65ce32a0f9d7015e5755b7e11e3b51b8fb03cade0975eb2fbb7cc6ec0b8fe' },
  { name: 'SDI iPUSH輕鬆按修正帶替換帶', req_id: '55a65ce32a0f9d7015e5755b7e11e3b55f205470d8acbe2c4755d0d0f641956e' },
  { name: 'SDI iPUSH輕鬆按修正帶 CT系列', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5a19b5876278576659cfb5a3835556ee9' },
  { name: 'PILOT 超級果汁筆(0.4) LJP-20S4', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5ce2e843a7f21db309a127c6df15cec1d' },
  { name: '雄獅No.600酒精性奇異筆', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5b3ab8be8f22fc800adb3124ae911733a' },
  { name: 'OB 自動中性筆0.5 OB-200A', req_id: '55a65ce32a0f9d7015e5755b7e11e3b599ef633d649217a311b789e5c7f6a40a' },
  { name: 'MENIU DP05 水滴筆0.5', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5eb8bb60e393f4906262cddb2899cc881' },
  { name: 'PLUS 智慧型滾輪修正帶', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5e0090a2d81b8011a44d3941bd2ed24af' },

  // 11
  { name: 'LIHIT多用途收納袋 追星裝備', req_id: '55a65ce32a0f9d7015e5755b7e11e3b50c6025966561ca4406bb0e88db68a957212521c182423f01328885cc07f323ba' },
  { name: 'LIHIT伸縮筆筒可愛爆棚', req_id: '55a65ce32a0f9d7015e5755b7e11e3b54a412853210aec4cb0ef22f39613b6dceeeec7059d833ef1f31c67ea5fd503bf' },
  { name: '(KING JIM) ALL IN CLIPBOARD', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5e658853e222edf599c7906c9d2799113ab8097b19afe6bbb911b89e015a6615a' },
  { name: '自強 美式三孔夾 520 圓型3孔', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5bf754f216808aa02f835a23eb416150973e9f32a95f91e9dc19afd84fe08e583' },
  { name: 'A4-EZ防滑資料袋(100入)', req_id: '55a65ce32a0f9d7015e5755b7e11e3b52233d393172cc7165c6b3037ba848bcd' },
  { name: 'DATABANK L型多功能A4文件夾(12入)', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5ad2e316736dc7b861ced791cd55281ce' },
  { name: '自強 西式2孔A4檔案夾 46S', req_id: '55a65ce32a0f9d7015e5755b7e11e3b510cdad456b63f2573b20c9b53f00be33' },
  { name: '台灣聯合 開放式圓孔雜誌箱', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5e6997918cde63132006bb76a59fe551d' },
  { name: '史努比 100K透明大網格袋', req_id: '55a65ce32a0f9d7015e5755b7e11e3b58ed8f6fd778fafb1a820cfd13155cd3e' },
  { name: 'KOKUYO GB_2x2收納活頁夾', req_id: '55a65ce32a0f9d7015e5755b7e11e3b523ab956e113ffb53b707f2fcdc1eaa01' },

  // 21
  { name: '3M 強力防水防水膠帶', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5557b023b32807178cdf8b5390a4a76f2' },
  { name: 'KOKUYO 好黏貼便利貼限定壽司款', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5f3f288f9e162188fc49405477060d9f9' },
  { name: 'TOMBOW PiT 辦公用強力口紅膠', req_id: '55a65ce32a0f9d7015e5755b7e11e3b577b6350d0555c3f8d82f9648a4448213' },
  { name: '四維鹿頭牌 優韌膠帶18mmX40Y', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5cd83b80aab59ff8d338a421ebb24ce7c' },
  { name: '四維鹿頭牌 雙面膠帶', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5034c8c1c17222d5c0a0389ec9bd01164' },
  { name: '疊疊便利貼', req_id: '55a65ce32a0f9d7015e5755b7e11e3b53e6fecf53c9bf67c9e92988c2375ca10' },
  { name: 'PINK&VEN 16K固頁筆記本', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5c15fb2c04c8ed670474ab54937965427' },
  { name: 'DOUBLE A 影印紙 A4 - 80g/70g', req_id: '55a65ce32a0f9d7015e5755b7e11e3b55639786bb75b53bd334c7dbf6a0e1ba8' },
  { name: 'Excell雙軌桌上型膠台 ET-227', req_id: '55a65ce32a0f9d7015e5755b7e11e3b525cdc1ef7293b7311efba873937bd126' },
  { name: '貓咪造型 桌上除塵清潔器', req_id: '55a65ce32a0f9d7015e5755b7e11e3b5fb8d5e75c03062cffae93a42017a4c2d' }
];

async function updateDbFile() {
    let dbContent = fs.readFileSync('lib/db.js', 'utf8');
    
    for (let item of requests) {
        try {
            const res = await fetch('https://www.9x9.tw/mod/product/index.php?REQUEST_ID=' + item.req_id);
            const html = await res.text();
            
            // Extract the og:image meta tag
            const match = html.match(/<meta property="og:image"\s+content="([^"]+)"/);
            if (match && match[1]) {
                const imgUrl = match[1];
                console.log('Fetched image for:', item.name, '->', imgUrl);
                
                // Replace the unsplash URL with the true URL in dbContent
                // We'll search for the line that contains the item name.
                
                // Find index of the item name
                const idx = dbContent.indexOf(item.name);
                if(idx !== -1) {
                    const startIdx = dbContent.lastIndexOf('{', idx);
                    const endIdx = dbContent.indexOf('}', idx);
                    const block = dbContent.slice(startIdx, endIdx);
                    
                    // Replace image: 'https://images.unsplash...' -> image: 'imgUrl'
                    // Find the single quoted URL after image: 
                    const updatedBlock = block.replace(/image:\s*'[^']+'/, `image: '${imgUrl}'`);
                    
                    dbContent = dbContent.slice(0, startIdx) + updatedBlock + dbContent.slice(endIdx);
                }
            } else {
                console.log('No image found for:', item.name);
            }
        } catch (e) {
            console.error('Error on', item.name, e);
        }
    }
    
    fs.writeFileSync('lib/db.js', dbContent);
    console.log('Finished updating lib/db.js');
}

updateDbFile();
