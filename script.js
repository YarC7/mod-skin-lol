const fs = require('fs');

async function getFullSkins() {
  try {
    // 1. Lấy phiên bản mới nhất
    const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await vRes.json();
    const latest = versions[0];

    // 2. Lấy danh sách ID tướng
    const listRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`);
    const listData = await listRes.json();
    const champIds = Object.keys(listData.data);

    console.log(`🚀 Đang bắt đầu lấy dữ liệu cho ${champIds.length} tướng...`);
    const allSkinsData = [];

    for (const id of champIds) {
      // Fetch song song 2 ngôn ngữ
      const [enRes, viRes] = await Promise.all([
        fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion/${id}.json`),
        fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/vi_VN/champion/${id}.json`)
      ]);

      const enData = await enRes.json();
      const viData = await viRes.json();

      const enSkins = enData.data[id].skins;
      const viSkins = viData.data[id].skins;

      const mergedSkins = enSkins.map((enSkin, index) => {
        const viSkin = viSkins[index];
        const skinNum = enSkin.num;
        
        return {
          num: skinNum,
          name_en: enSkin.name === 'default' ? enData.data[id].name : enSkin.name,
          name_vi: viSkin.name === 'default' ? viData.data[id].name : viSkin.name,
          // Ảnh ngang (Splash Art)
          splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_${skinNum}.jpg`,
          // Ảnh dọc (Loading Screen)
          loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${skinNum}.jpg`
        };
      });

      allSkinsData.push({
        id: id,
        name_en: enData.data[id].name,
        name_vi: viData.data[id].name,
        skins: mergedSkins
      });

      console.log(`✅ Đã xong: ${id}`);
    }

    // 3. Ghi file JSON
    fs.writeFileSync('champion_skins_full.json', JSON.stringify(allSkinsData, null, 2), 'utf-8');
    console.log('\n--- HOÀN THÀNH: File champion_skins_full.json đã sẵn sàng ---');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

getFullSkins();