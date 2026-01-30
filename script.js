const fs = require('fs');

async function getAllSkins() {
  try {
    // 1. Lấy phiên bản và danh sách tên tướng trước
    const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await vRes.json();
    const latest = versions[0];

    const listRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/vi_VN/champion.json`);
    const listData = await listRes.json();
    const champIds = Object.keys(listData.data); // Lấy danh sách ID như ["Aatrox", "Ahri", ...]

    console.log(`Bắt đầu lấy skin của ${champIds.length} tướng...`);

    const allSkinsData = [];

    // 2. Lặp qua từng tướng để lấy skin chi tiết
    // Dùng for...of để tránh bị Riot chặn do gửi quá nhiều request cùng lúc (Rate Limit)
    for (const id of champIds) {
      const detailRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/vi_VN/champion/${id}.json`);
      const detailData = await detailRes.json();
      const champDetail = detailData.data[id];

      const skins = champDetail.skins.map(skin => ({
        skinName: skin.name === 'default' ? `Mặc định ${champDetail.name}` : skin.name,
        // Splash Art (Ảnh nền lớn)
        splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_${skin.num}.jpg`,
        // Loading Art (Ảnh dọc lúc load trận)
        loadingUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${skin.num}.jpg`
      }));

      allSkinsData.push({
        championName: champDetail.name,
        championId: id,
        skins: skins
      });

      console.log(`Đã xong: ${champDetail.name}`);
    }

    // 3. Ghi file
    fs.writeFileSync('champion_skins.json', JSON.stringify(allSkinsData, null, 2), 'utf-8');
    console.log('--- HOÀN THÀNH: File champion_skins.json đã sẵn sàng ---');

  } catch (err) {
    console.error('Lỗi rồi:', err.message);
  }
}

getAllSkins();