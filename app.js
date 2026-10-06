// 鹿児島旅行アプリ メインスクリプト（リアルタイム天気＆桜島公式データ連携版）

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initTabs();
  initSchedule();
  initChecklist();
  initGourmet();
  initWeatherEvents();
  initSakurajimaEvents();
  loadData();
});

// 鹿児島市の座標（市役所・中心市街地付近）
const KAGOSHIMA_COORDS = {
  lat: 31.5969,
  lon: 130.5571
};

// 旅行日カウントダウン
function initCountdown() {
  const targetDate = new Date("2026-10-22T00:00:00+09:00");
  const today = new Date();
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const badge = document.getElementById("countdown-badge");
  if (!badge) return;

  if (diffDays > 0) {
    badge.textContent = `🎯 旅行（10/22）まで あと ${diffDays} 日！`;
  } else if (diffDays === 0) {
    badge.textContent = `🎉 旅行初日です！ 鹿児島へようこそ！`;
  } else if (diffDays >= -2) {
    badge.textContent = `✈️ 旅行中です！ 素敵な時間をお過ごしください！`;
  } else {
    badge.textContent = `✈️ 旅行は終了しました`;
  }
}

// タブ切り替え
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabTarget = btn.getAttribute("data-tab");

      buttons.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetContent = document.getElementById(tabTarget);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // URLハッシュによる初期タブ切り替え（例: #tab-gourmet）
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
    if (targetBtn) {
      targetBtn.click();
    }
  }
}

// 天気更新イベントの登録
function initWeatherEvents() {
  const refreshBtns = document.querySelectorAll(".weather-refresh-btn");
  refreshBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.textContent = "⏳ 更新中...";
      btn.disabled = true;
      await fetchLiveWeather();
      btn.textContent = "🔄 天気を更新";
      btn.disabled = false;
    });
  });
}

// 桜島更新イベントの登録
function initSakurajimaEvents() {
  const refreshBtn = document.getElementById("sakurajima-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      refreshBtn.textContent = "⏳ 更新中...";
      refreshBtn.disabled = true;
      await fetchLiveSakurajima();
      refreshBtn.textContent = "🔄 最新情報に更新";
      refreshBtn.disabled = false;
    });
  }
}

// データの読み込み
async function loadData() {
  let staticData = window.FALLBACK_DATA || {};
  try {
    const res = await fetch("data.json");
    if (res.ok) {
      staticData = await res.json();
    }
  } catch (err) {
    console.warn("ローカルdata.jsonの取得をスキップし、組み込みデータを使用します", err);
  }

  // 基本情報（中央駅・天文館・アドバイスなど）を表示
  renderStaticInfo(staticData);

  // 1. 最新天気を自動取得
  await fetchLiveWeather();

  // 2. 桜島・フェリーの最新公式情報を自動取得
  await fetchLiveSakurajima();
}

// ==========================================
// 桜島・フェリー公式情報の取得＆レンダリング
// update_sakurajima.pyで保存されたローカルデータを優先
// ==========================================
async function fetchLiveSakurajima() {
  const container = document.getElementById("sakurajima-content");
  const timeBadge = document.getElementById("sakurajima-fetch-time");
  
  if (timeBadge) {
    timeBadge.textContent = "確認中...";
  }

  let loadedData = null;

  // 1. HTTP環境の場合は sakurajima.json のfetchを試行
  if (window.location.protocol.startsWith("http")) {
    try {
      const res = await fetch(`sakurajima.json?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === "success") {
          loadedData = json;
        }
      }
    } catch (e) {
      console.warn("HTTP経由のsakurajima.json取得をスキップ:", e);
    }
  }

  // 2. fetchが使えない場合（file://直接起動時など）は、sakurajima.js の window.SAKURAJIMA_DATA を利用
  if (!loadedData && window.SAKURAJIMA_DATA) {
    if (window.SAKURAJIMA_DATA.status === "success") {
      loadedData = window.SAKURAJIMA_DATA;
    } else {
      // 保存データ自体がエラーの場合
      renderSakurajimaError(window.SAKURAJIMA_DATA.errorMessage || "公式データ取得エラー");
      return;
    }
  }

  // 3. データの判定
  if (loadedData) {
    renderSakurajima(loadedData);
  } else {
    // どちらからも取得できない場合
    console.error("桜島最新公式データが取得できませんでした");
    renderSakurajimaError("ローカル公式データ（sakurajima.json / sakurajima.js）が見つかりません。update_sakurajima.py を実行してください。");
  }
}

// 桜島公式情報の正常表示
function renderSakurajima(data) {
  const container = document.getElementById("sakurajima-content");
  const timeBadge = document.getElementById("sakurajima-fetch-time");
  if (timeBadge) {
    timeBadge.textContent = `最終取得: ${data.fetchedAtDisplay || "最新"}`;
  }

  if (!container) return;

  const v = data.volcano || {};
  const f = data.ferry || {};
  const b = data.bus || {};
  const links = data.officialLinks || {};

  // 噴火観測報のテキスト
  let eruptionHtml = "";
  if (v.latestEruption) {
    const e = v.latestEruption;
    eruptionHtml = `
      <div style="background: #ffffff; border: 1px solid #ffe0b2; border-radius: 6px; padding: 10px; margin-top: 8px;">
        <div style="font-weight: bold; color: #d84315;">🌋 気象庁 火山観測報（最新発表）:</div>
        <div style="font-size: 0.9rem; margin-top: 4px; white-space: pre-line;">${e.text}</div>
        <div style="font-size: 0.78rem; color: #888; margin-top: 4px;">発表日時: ${e.reportTime}</div>
      </div>
    `;
  }

  // 降灰予報のテキスト
  let ashfallHtml = "";
  if (v.ashfallForecast) {
    const a = v.ashfallForecast;
    ashfallHtml = `
      <div style="background: #ffffff; border: 1px solid #ffe0b2; border-radius: 6px; padding: 10px; margin-top: 8px;">
        <div style="font-weight: bold; color: #d84315;">💨 気象庁 降灰予報（最新）:</div>
        <div style="font-size: 0.9rem; margin-top: 4px;">${a.text}</div>
        <div style="font-size: 0.78rem; color: #888; margin-top: 4px;">発表日時: ${a.reportTime}</div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- 警戒レベルボックス -->
    <div class="volcano-alert-box">
      <div class="alert-header">
        <span>🌋 桜島 噴火警戒状況: <strong>${v.alertLevel || "レベル3（入山規制）"}</strong></span>
      </div>
      <p style="font-size: 0.95rem; margin-bottom: 8px;">
        気象庁の火山防災情報に基づく最新ステータスです。南岳山頂火口および昭和火口から概ね2km以内は立ち入りが規制されています。
      </p>
      ${eruptionHtml}
      ${ashfallHtml}
    </div>

    <!-- 詳細案内リスト -->
    <ul class="info-list">
      <li class="info-item" style="background: #fdfdfe; border-radius: 8px; padding: 14px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
        <div class="info-item-title" style="margin-bottom: 8px;">
          <span>🚢 桜島フェリー 運航情報</span>
          <span class="badge ${f.badge || 'info'}">${f.status || '最新の運航状況は公式SNSで確認してください'}</span>
        </div>
        <div class="info-item-desc" style="line-height: 1.6;">
          <p><strong>【鹿児島市船舶局公式案内】</strong> ${f.note || '運航の再開や見合わせ、車両乗船待ちなどのリアルタイム運航状況は公式SNS（X）にて発信されています。'}</p>
          <p style="font-size: 0.8rem; color: #777; margin-top: 6px;">
            🕒 公式サイト確認日時: <strong>${f.checkedAt || data.fetchedAtDisplay || '確認済'}</strong>
            （※機械的推測を行わず、公式の案内方針に従い最新の運航状況は公式SNSのご確認をお願いしています）
          </p>
        </div>
        <!-- フェリー直通ボタン -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
          <a href="${f.officialUrl || 'https://www.city.kagoshima.lg.jp/sakurajima-ferry/'}" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.85rem; padding: 7px 12px;">
            🚢 桜島フェリー 公式サイトを開く
          </a>
          <a href="${f.officialSns || 'https://x.com/sakurajimaf2525/'}" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.85rem; padding: 7px 12px; border-color: #0b63b6; color: #0b63b6; font-weight: bold;">
            📱 桜島フェリー 公式X(運航速報)を開く
          </a>
        </div>
      </li>
      <li class="info-item">
        <div class="info-item-title">
          <span>🚌 周遊観光バス（サクラジマアイランドビュー）</span>
          <span class="badge ${b.badge || 'success'}">${b.status || '通常運行中'}</span>
        </div>
        <div class="info-item-desc">${b.detail || ''} 運行時間: ${b.hours || '9:30〜16:30'}</div>
      </li>
      <li class="info-item">
        <div class="info-item-title">👀 観光スポットへの影響</div>
        <div class="info-item-desc">${v.touristImpact || '湯之平展望所や有村溶岩展望所など主要観光地は規制外のため観光可能です。'}</div>
      </li>
      <li class="info-item">
        <div class="info-item-title">🕶️ 旅行者のための降灰対策</div>
        <div class="info-item-desc">${v.tips || '降灰時はメガネ着用推奨。目薬やマスクがあると安心です。'}</div>
      </li>
    </ul>

    <!-- 鹿児島市公式 桜島フェリー時刻表セクション -->
    <div class="timetable-section" id="ferry-timetable-section">
      <div class="timetable-header">
        <div>
          <h3 style="font-size: 1.15rem; color: var(--primary-color); display: flex; align-items: center; gap: 6px;">
            🚢 桜島フェリー 定期航路時刻表（鹿児島市公式）
          </h3>
          <p style="font-size: 0.82rem; color: #666; margin-top: 2px;">
            令和7年10月1日改定ダイヤ対応（平日94便／土日祝日104便）
          </p>
        </div>
        <div class="timetable-type-tabs">
          <button type="button" class="timetable-tab-btn active" id="btn-timetable-weekday" onclick="switchTimetable('weekday')">
            📅 平日ダイヤ (10/22・23)
          </button>
          <button type="button" class="timetable-tab-btn" id="btn-timetable-weekend" onclick="switchTimetable('weekend')">
            🎉 土日祝ダイヤ (10/24)
          </button>
        </div>
      </div>

      <!-- 注意事項 -->
      <div class="timetable-notice-box">
        <strong>💡 ご利用のポイント:</strong>
        <ul>
          <li><strong>所要時間:</strong> 片道約15分（気象・海況等により約20分となる場合があります。着岸後下船まで約2〜3分）。</li>
          <li><strong>旅行日程への適用:</strong> 10月22日(木)・23日(金)は<strong>「平日ダイヤ」</strong>、10月24日(土)は<strong>「土日祝ダイヤ」</strong>となります。</li>
          <li><strong>深夜運航の見直し:</strong> 令和7年10月1日より深夜帯（0時〜3時台）は運航休止となっております。始発・最終時刻にご注意ください。</li>
        </ul>
      </div>

      <!-- 時刻表本体コンテナ -->
      <div id="timetable-tables-container">
        <!-- JSで動的描画 -->
      </div>

      <!-- 公式時刻表・PDF直通ボタン -->
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color); display: flex; flex-wrap: wrap; gap: 8px;">
        <a href="https://www.city.kagoshima.lg.jp/sakurajima-ferry/koro-jikoku/timetable.html" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="background:#f0f7ff;">
          🔗 鹿児島市 桜島フェリー公式時刻表ページを開く
        </a>
        <a href="https://www.city.kagoshima.lg.jp/sakurajima-ferry/koro-jikoku/documents/202510heijitujikokuhyou2.pdf" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          📄 平日ダイヤ時刻表（公式PDF）
        </a>
        <a href="https://www.city.kagoshima.lg.jp/sakurajima-ferry/koro-jikoku/documents/202510donitishukujikokuhyou2.pdf" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          📄 土日祝ダイヤ時刻表（公式PDF）
        </a>
      </div>
    </div>

    <!-- 公式ページ直通ボタン -->
    <div class="official-link-section">
      <div class="official-link-title">🔗 気象庁・鹿児島市 公式ページ直通リンク</div>
      <p style="font-size: 0.85rem; color: #666; margin-bottom: 10px;">
        より詳細なリアルタイム監視カメラ映像や詳細電文、フェリーの運行速報は公式ページより確認できます：
      </p>
      <div class="official-btn-grid">
        <a href="${links.jmaVolcano || 'https://www.data.jma.go.jp/svd/vois/data/tokyo/506_Sakurajima/506_index.html'}" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          🏛️ 気象庁 桜島火山情報
        </a>
        <a href="${links.jmaAshfall || 'https://www.jma.go.jp/bosai/map.html#5/31.593/130.639/&elem=ash&contents=volcano_ash'}" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          💨 気象庁 降灰予報マップ
        </a>
        <a href="${links.cityFerry || 'https://www.city.kagoshima.lg.jp/sakurajima-ferry/'}" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          🚢 鹿児島市 桜島フェリー公式
        </a>
        <a href="${links.cityFerryX || 'https://x.com/sakurajimaf2525/'}" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          📱 桜島フェリー公式X(運航速報)
        </a>
      </div>
    </div>
  `;

  // 初期表示として平日ダイヤを描画
  renderTimetableTables('weekday');
}

// 取得失敗時の表示（古い情報を装わず「取得できません」と明示）
function renderSakurajimaError(errDetail) {
  const container = document.getElementById("sakurajima-content");
  const timeBadge = document.getElementById("sakurajima-fetch-time");
  if (timeBadge) {
    timeBadge.textContent = "取得エラー";
  }

  if (!container) return;

  container.innerHTML = `
    <div class="error-fetch-box">
      <div class="error-fetch-title">⚠️ 最新情報を取得できません</div>
      <p style="font-size: 0.95rem; margin-bottom: 8px;">
        気象庁および鹿児島市の最新公式サーバーからデータを取得できませんでした。
      </p>
      <p style="font-size: 0.88rem; color: #666; margin-bottom: 14px;">
        ※旅行の安全を最優先するため、古い過去の情報を最新情報として表示することはいたしません。お手数ですが、以下のボタンから気象庁および鹿児島市の公式ページにて直接ご確認ください。
      </p>
      <div style="font-size: 0.8rem; background: #fff; padding: 6px 10px; border-radius: 4px; border: 1px solid #ffcdd2; margin-bottom: 12px; color: #999;">
        エラー詳細: ${errDetail || "接続失敗"}
      </div>
      <button class="weather-refresh-btn" onclick="fetchLiveSakurajima()" style="margin-bottom: 16px;">
        🔄 再試行する
      </button>
    </div>

    <!-- 公式ページ直通ボタン -->
    <div class="official-link-section">
      <div class="official-link-title">🔗 気象庁・鹿児島市 公式ページ直通リンク（こちらから確認できます）</div>
      <div class="official-btn-grid">
        <a href="https://www.data.jma.go.jp/svd/vois/data/tokyo/506_Sakurajima/506_index.html" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          🏛️ 気象庁 桜島火山情報
        </a>
        <a href="https://www.jma.go.jp/bosai/map.html#5/31.593/130.639/&elem=ash&contents=volcano_ash" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          💨 気象庁 降灰予報マップ
        </a>
        <a href="https://www.city.kagoshima.lg.jp/sakurajima-ferry/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          🚢 鹿児島市 桜島フェリー公式
        </a>
        <a href="https://x.com/sakurajimaf2525/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
          📱 桜島フェリー公式X(運航速報)
        </a>
      </div>
    </div>
  `;
}

// ==========================================
// インターネットからの最新天気リアルタイム自動取得
// ==========================================
async function fetchLiveWeather() {
  const statusTags = document.querySelectorAll(".weather-status-tag");
  statusTags.forEach(el => el.innerHTML = `<span>⏳ 最新気象データ取得中...</span>`);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${KAGOSHIMA_COORDS.lat}&longitude=${KAGOSHIMA_COORDS.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=16`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API HTTP ${response.status}`);
    
    const weatherData = await response.json();
    renderLiveWeather(weatherData);

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    statusTags.forEach(el => {
      el.innerHTML = `<span>🟢 気象庁・Open-Meteo 連携中 (${timeStr} 更新)</span>`;
      el.style.background = "#e8f5e9";
      el.style.color = "#2e7d32";
    });
  } catch (error) {
    console.warn("最新天気のオンライン取得に失敗:", error);
    statusTags.forEach(el => {
      el.innerHTML = `<span>⚠️ オフライン表示中</span>`;
      el.style.background = "#fff3e0";
      el.style.color = "#e65100";
    });
  }
}

function parseWeatherCode(code) {
  if (code === 0) return { text: "快晴", icon: "☀️" };
  if (code === 1) return { text: "晴れ", icon: "🌤️" };
  if (code === 2) return { text: "一部曇り", icon: "⛅" };
  if (code === 3) return { text: "曇り", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "霧", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "霧雨", icon: "🌦️" };
  if (code >= 61 && code <= 65) return { text: "雨", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { text: "にわか雨", icon: "🌧️" };
  if (code >= 95) return { text: "雷雨", icon: "⛈️" };
  return { text: "晴れ時々曇り", icon: "🌤️" };
}

function generateClothingAdvice(maxTemp, minTemp, rainProb) {
  const diff = maxTemp - minTemp;
  let advice = "";
  let umbrella = "不要";

  if (maxTemp >= 28) {
    advice = "日中は半袖で快適に過ごせます。";
  } else if (maxTemp >= 23) {
    advice = "日中は長袖シャツや薄手のカットソー1枚で快適です。";
  } else {
    advice = "日中も少し肌寒いため、長袖にジャケットなどが必要です。";
  }

  if (diff >= 9) {
    advice += `朝晩は${minTemp}℃まで冷え込み寒暖差（${diff}℃差）が大きいため、カーディガンや羽織りものが必須です。`;
  } else {
    advice += `朝晩は${minTemp}℃前後です。`;
  }

  if (rainProb >= 50) {
    umbrella = "必要（雨具をお持ちください）";
  } else if (rainProb >= 30) {
    umbrella = "折りたたみ傘があると安心";
  } else {
    umbrella = "不要（雨の心配はほぼありません）";
  }

  return { advice, umbrella };
}

function renderLiveWeather(data) {
  const daily = data.daily;
  if (!daily || !daily.time || daily.time.length === 0) return;

  const todayCode = daily.weathercode[0];
  const todayMax = Math.round(daily.temperature_2m_max[0]);
  const todayMin = Math.round(daily.temperature_2m_min[0]);
  const todayRain = daily.precipitation_probability_max[0] ?? 10;
  const todayWeatherInfo = parseWeatherCode(todayCode);
  const adviceInfo = generateClothingAdvice(todayMax, todayMin, todayRain);

  const todayDateObj = new Date(daily.time[0]);
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = `${todayDateObj.getMonth() + 1}月${todayDateObj.getDate()}日(${weekDays[todayDateObj.getDay()]})`;

  const weatherContainer = document.getElementById("weather-today-box");
  if (weatherContainer) {
    weatherContainer.innerHTML = `
      <div class="weather-header">
        <span class="weather-date">${dateStr}（本日）</span>
        <span class="badge ${todayRain >= 40 ? 'warning' : 'success'}">降水確率 ${todayRain}%</span>
      </div>
      <div style="font-size: 1.4rem; font-weight: bold; margin: 6px 0;">
        ${todayWeatherInfo.icon} ${todayWeatherInfo.text}
      </div>
      <div class="temp-display">
        <span class="temp-max">最高 ${todayMax}℃</span>
        <span class="temp-min">最低 ${todayMin}℃</span>
      </div>
      <div class="weather-detail">
        <p><strong>👔 服装の目安:</strong> ${adviceInfo.advice}</p>
        <p style="margin-top:4px;"><strong>☂️ 傘の必要性:</strong> ${adviceInfo.umbrella}</p>
      </div>
    `;
  }

  const travelIndexes = [];
  daily.time.forEach((dateString, index) => {
    if (dateString >= "2026-10-22" && dateString <= "2026-10-24") {
      travelIndexes.push(index);
    }
  });

  const tpContainer = document.getElementById("weather-travel-box");
  if (tpContainer) {
    if (travelIndexes.length > 0) {
      let travelDaysHtml = travelIndexes.map(idx => {
        const dObj = new Date(daily.time[idx]);
        const wInfo = parseWeatherCode(daily.weathercode[idx]);
        const tMax = Math.round(daily.temperature_2m_max[idx]);
        const tMin = Math.round(daily.temperature_2m_min[idx]);
        const rProb = daily.precipitation_probability_max[idx] ?? 20;
        return `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; margin-top:6px; font-size:0.88rem;">
            <strong>${dObj.getMonth() + 1}/${dObj.getDate()}(${weekDays[dObj.getDay()]}):</strong> 
            ${wInfo.icon} ${wInfo.text} | <span style="color:#d32f2f;">${tMax}℃</span> / <span style="color:#1976d2;">${tMin}℃</span> (降水 ${rProb}%)
          </div>
        `;
      }).join("");

      tpContainer.innerHTML = `
        <div class="weather-header">
          <span class="weather-date">2026年10月22日(木)〜24日(土)</span>
          <span class="badge success">★最新オンライン予測</span>
        </div>
        <div style="margin-top:4px;">${travelDaysHtml}</div>
        <div class="weather-detail" style="margin-top:8px;">
          <p><strong>💡 アドバイス:</strong> 朝晩の寒暖差対策として薄手のアウターをご用意ください。</p>
        </div>
      `;
    } else {
      tpContainer.innerHTML = `
        <div class="weather-header">
          <span class="weather-date">2026年10月22日(木)〜24日(土)</span>
          <span class="badge warning">事前平年予測</span>
        </div>
        <div style="font-size: 1.1rem; font-weight: bold; margin: 6px 0;">🍂 例年秋晴れが多い季節</div>
        <div class="temp-display">
          <span class="temp-max">平年最高 22〜24℃</span>
          <span class="temp-min">平年最低 13〜15℃</span>
        </div>
        <div class="weather-detail">
          <p><strong>💡 アドバイス:</strong> 日別予報は旅行7日前頃よりさらに精度高く順次自動反映されます。</p>
        </div>
      `;
    }
  }

  const weeklyGrid = document.getElementById("weekly-weather-grid");
  if (weeklyGrid) {
    const displayCount = Math.min(daily.time.length, 7);
    let itemsHtml = "";
    for (let i = 0; i < displayCount; i++) {
      const dObj = new Date(daily.time[i]);
      const wInfo = parseWeatherCode(daily.weathercode[i]);
      const maxT = Math.round(daily.temperature_2m_max[i]);
      const minT = Math.round(daily.temperature_2m_min[i]);
      const rP = daily.precipitation_probability_max[i] ?? 10;
      const isToday = i === 0;

      itemsHtml += `
        <div class="weather-day-item" style="${isToday ? 'border-color: var(--primary-color); background: #f0f7ff;' : ''}">
          <div style="font-weight:bold; font-size:0.85rem; color:${dObj.getDay() === 0 ? '#d32f2f' : dObj.getDay() === 6 ? '#1976d2' : '#333'};">
            ${dObj.getMonth() + 1}/${dObj.getDate()}(${weekDays[dObj.getDay()]}) ${isToday ? '今日' : ''}
          </div>
          <div style="font-size:1.6rem; margin:4px 0;">${wInfo.icon}</div>
          <div style="font-size:0.82rem; font-weight:600;">${wInfo.text}</div>
          <div style="font-size:0.82rem; margin-top:4px;">
            <span style="color:#d32f2f; font-weight:bold;">${maxT}℃</span> / <span style="color:#1976d2;">${minT}℃</span>
          </div>
          <div style="font-size:0.75rem; color:#666; margin-top:2px;">降水 ${rP}%</div>
        </div>
      `;
    }
    weeklyGrid.innerHTML = itemsHtml;
  }
}

// ==========================================
// 静的情報のレンダリング（中央駅・天文館・アドバイス）
// ==========================================
function renderStaticInfo(data) {
  const updateEl = document.getElementById("last-updated");
  if (updateEl && data.updatedAt) {
    const date = new Date(data.updatedAt);
    updateEl.textContent = `基本情報更新: ${date.toLocaleDateString("ja-JP")} ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
  }

  if (data.transitStatus) {
    const transitContainer = document.getElementById("transit-list");
    if (transitContainer) {
      transitContainer.innerHTML = data.transitStatus.map(t => `
        <div class="transit-item">
          <div class="transit-name">
            <span>${t.name}</span>
            <span class="badge ${t.badge}">${t.status}</span>
          </div>
          <div class="transit-note">${t.note}</div>
        </div>
      `).join("");
    }
  }

  if (data.tenmonkan) {
    const t = data.tenmonkan;
    // 天文館グルメカードの初期レンダリング（全件表示）
    renderGourmetList('all');

    const eventsContainer = document.getElementById("tenmonkan-events");
    if (eventsContainer && t.events) {
      eventsContainer.innerHTML = t.events.map(ev => `
        <li class="info-item">
          <div class="info-item-title">🎪 ${ev.title} <span class="badge warning" style="margin-left: 8px;">${ev.date}</span></div>
          <div class="info-item-desc">${ev.desc}</div>
        </li>
      `).join("");
    }
  }

  if (data.chuoStation) {
    const stationContainer = document.getElementById("chuo-content");
    if (stationContainer) {
      stationContainer.innerHTML = `
        <!-- 初日到着ナビゲーションバナー -->
        <div class="station-arrival-steps">
          <h3 style="font-size: 1.15rem; color: #0b63b6; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            🚅 2026年10月22日(木) 旅行初日 到着スムーズナビ
          </h3>
          <p style="font-size: 0.88rem; color: #4a5568;">
            新幹線や特急で鹿児島中央駅に到着したら、まずこの順序で行動するとスムーズに観光をスタートできます！
          </p>
          <div class="step-card-grid">
            <div class="step-card">
              <span class="step-number">STEP 1</span>
              <div style="font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">観光案内所へ</div>
              <div style="font-size: 0.82rem; color: #666;">改札正面の「総合観光案内所」で最新マップとパンフレットを無料入手。</div>
            </div>
            <div class="step-card">
              <span class="step-number">STEP 2</span>
              <div style="font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">手荷物を預ける</div>
              <div style="font-size: 0.82rem; color: #666;">東口広場案内所（1日700円）または駅構内コインロッカーに荷物を預けて身軽に。</div>
            </div>
            <div class="step-card">
              <span class="step-number">STEP 3</span>
              <div style="font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">1日乗車券を購入</div>
              <div style="font-size: 0.82rem; color: #666;">市電・市バス・シティビュー共通1日乗車券（700円）で観光施設割引もGET！</div>
            </div>
            <div class="step-card">
              <span class="step-number">STEP 4</span>
              <div style="font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">観光へ出発！</div>
              <div style="font-size: 0.82rem; color: #666;">東口「東4番のりば」からカゴシマシティビューに乗って市内めぐりへ。</div>
            </div>
          </div>
        </div>

        <!-- 2つの公式観光案内所（比較・詳細） -->
        <h3 style="font-size: 1.2rem; color: var(--primary-color); margin: 20px 0 10px; display: flex; align-items: center; gap: 6px;">
          🏢 鹿児島中央駅の公式観光案内所（2か所）
        </h3>
        <p style="font-size: 0.88rem; color: #666; margin-bottom: 12px;">
          駅構内改札前と、東口駅前広場の2か所に観光案内スタッフが常駐する公式窓口があります。
        </p>
        <div class="info-center-grid">
          <!-- 案内所1: 総合観光案内所 -->
          <div class="info-center-card" style="border-top: 4px solid #0b63b6;">
            <div class="info-center-name">
              <span>🏛️ 鹿児島中央駅 総合観光案内所</span>
            </div>
            <div style="font-size: 0.82rem; background: #e8f0fe; color: #0b63b6; padding: 3px 8px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 8px;">
              改札直結（2階コンコース）
            </div>
            <ul style="font-size: 0.88rem; list-style: none; line-height: 1.7; color: #333;">
              <li><strong>📍 場所:</strong> JR鹿児島中央駅構内（新幹線改札口正面）</li>
              <li><strong>🕒 営業時間:</strong> <strong>8:00〜19:00</strong>（年中無休）</li>
              <li><strong>📞 電話:</strong> 099-253-2500</li>
              <li><strong>📖 サービス:</strong>
                <br>・観光案内スタッフ常駐
                <br>・<strong>観光パンフレット・地図の無料配布</strong>
                <br>・市電・市バス・シティビュー1日乗車券の販売
                <br>・観光施設や宿泊先への道案内
              </li>
            </ul>
            <div style="margin-top: 10px;">
              <a href="https://www.kagoshima-yokanavi.jp/spot/20080" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.82rem; padding: 6px 12px; width: 100%;">
                🔗 公式よかナビ 詳細情報を見る
              </a>
            </div>
          </div>

          <!-- 案内所2: 東口駅前広場観光案内所 -->
          <div class="info-center-card" style="border-top: 4px solid #00897b;">
            <div class="info-center-name">
              <span>🌳 東口駅前広場 観光案内所</span>
            </div>
            <div style="font-size: 0.82rem; background: #e0f2f1; color: #00796b; padding: 3px 8px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 8px;">
              手荷物預かり対応（駅前広場）
            </div>
            <ul style="font-size: 0.88rem; list-style: none; line-height: 1.7; color: #333;">
              <li><strong>📍 場所:</strong> 鹿児島中央駅東口 駅前広場（バスターミナル隣）</li>
              <li><strong>🕒 営業時間:</strong> <strong>8:00〜18:00</strong>（年中無休）</li>
              <li><strong>📞 電話:</strong> 099-286-4700</li>
              <li><strong>🧳 手荷物一時預かり:</strong> <strong>1個あたり1日 700円</strong>（有人預かり）</li>
              <li><strong>📖 サービス:</strong>
                <br>・観光案内スタッフ常駐・交通案内
                <br>・<strong>観光パンフレット無料配布</strong>
                <br>・市電・市バス・シティビュー1日乗車券販売
                <br>・公衆Wi-Fi完備
              </li>
            </ul>
            <div style="margin-top: 10px;">
              <a href="https://www.kagoshima-yokanavi.jp/spot/20080" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.82rem; padding: 6px 12px; width: 100%;">
                🔗 公式よかナビ 詳細情報を見る
              </a>
            </div>
          </div>
        </div>

        <!-- 手荷物預かり・コインロッカー詳細 -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 1.05rem; color: var(--primary-color); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            🧳 手荷物預かり・コインロッカーガイド
          </h4>
          <div style="font-size: 0.9rem; line-height: 1.7;">
            <p><strong>① 東口駅前広場観光案内所（有人預かり）:</strong><br>
            スーツケースなどの大型荷物も安心。<strong>1個1日 700円</strong>（8:00〜18:00受付・引取）。ロッカーに入らないサイズでも預けられます。</p>
            <p style="margin-top: 8px;"><strong>② 駅構内コインロッカー:</strong><br>
            JR改札口横（みやげ横丁付近）、新幹線改札内、地下通路連絡口など各所に多数設置（標準400円〜特大800円前後、交通系ICカード対応機あり）。</p>
          </div>
        </div>

        <!-- 1日乗車券について -->
        <div style="background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 1.05rem; color: #2e7d32; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            🎫 市電・市バス・カゴシマシティビュー共通1日乗車券（鹿児島市交通局）
          </h4>
          <p style="font-size: 0.9rem; margin-bottom: 10px;">
            鹿児島市内の主要観光スポットを巡るなら、絶対に持っておきたいお得なフリーきっぷです！
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
            <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #dcedc8;">
              <div style="font-weight: bold; color: #2e7d32; font-size: 0.9rem;">共通1日乗車券</div>
              <div style="font-size: 1.1rem; font-weight: bold; margin: 4px 0;">大人 700円 / 小児 350円</div>
              <div style="font-size: 0.78rem; color: #666;">利用当日の終日乗り放題</div>
            </div>
            <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #dcedc8;">
              <div style="font-weight: bold; color: #2e7d32; font-size: 0.9rem;">共通24時間乗車券</div>
              <div style="font-size: 1.1rem; font-weight: bold; margin: 4px 0;">大人 900円 / 小児 450円</div>
              <div style="font-size: 0.78rem; color: #666;">利用開始時刻から24時間有効</div>
            </div>
          </div>
          <div style="font-size: 0.88rem; line-height: 1.6;">
            <p><strong>🎁 観光施設割引特典:</strong> 券面提示で、<strong>維新ふるさと館、仙巌園、かごしま水族館</strong>などの主要観光施設で入館料割引サービスが受けられます。</p>
            <p style="margin-top: 4px;"><strong>🛒 購入場所:</strong> 鹿児島中央駅総合観光案内所、東口駅前広場観光案内所、市電・市バス車内、スマートフォンアプリ「乗換案内」デジタル券。</p>
          </div>
          <div style="margin-top: 10px;">
            <a href="https://www.kotsu-city-kagoshima.jp/" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="background:#fff; font-size:0.82rem; padding:6px 12px;">
              🔗 鹿児島市交通局 1日乗車券公式案内を見る
            </a>
          </div>
        </div>

        <!-- 乗り換え案内（カゴシマシティビュー、市電、空港連絡バス） -->
        <h3 style="font-size: 1.2rem; color: var(--primary-color); margin: 24px 0 10px; display: flex; align-items: center; gap: 6px;">
          🚏 鹿児島中央駅からの乗り換え案内（のりば・行き方）
        </h3>
        <p style="font-size: 0.88rem; color: #666; margin-bottom: 12px;">
          初日の移動で迷わないための公式のりば位置ガイドです。
        </p>
        <div class="transit-guide-grid">
          <!-- カゴシマシティビュー -->
          <div class="transit-guide-card">
            <h4 style="font-size: 1.05rem; color: var(--primary-color);">🚌 カゴシマシティビュー（観光周遊バス）</h4>
            <span class="transit-platform-badge">東口バスターミナル「東4番」のりば</span>
            <p style="font-size: 0.88rem; line-height: 1.6; margin-top: 6px;">
              改札を出て東口（桜島口）エスカレーターを下りて正面のバスターミナル。<strong>城山、仙巌園、かごしま水族館、天文館</strong>などを約80分で循環運行。30分間隔で発車します。
            </p>
          </div>

          <!-- 市電（路面電車） -->
          <div class="transit-guide-card">
            <h4 style="font-size: 1.05rem; color: var(--primary-color);">🚋 鹿児島市電（路面電車）</h4>
            <span class="transit-platform-badge">東口正面「鹿児島中央駅前」電停</span>
            <p style="font-size: 0.88rem; line-height: 1.6; margin-top: 6px;">
              東口（桜島口）からペデストリアンデッキまたは地下道を通って正面へ。<strong>2系統（郡元〜鹿児島駅前）</strong>で天文館・水族館口（桜島フェリー口）方面へ直通（日中約5分間隔で頻発）。
            </p>
          </div>

          <!-- 空港連絡バス -->
          <div class="transit-guide-card" style="border-top-color: #e65100;">
            <h4 style="font-size: 1.05rem; color: #e65100;">✈️ 鹿児島空港連絡バス</h4>
            <span class="transit-platform-badge" style="background: #ffe0b2; color: #e65100;">
              道路向かい「鹿児島中央ターミナルビル1F（東21番）」
            </span>
            <p style="font-size: 0.88rem; line-height: 1.6; margin-top: 6px;">
              <strong>⚠️ 注意:</strong> 駅前ロータリーからは発着しません！東口を出て横断歩道または地下道で向かいのビル（ソラリア西鉄ホテル1F「南国交通バスターミナル」東21番のりば）へお進みください。
            </p>
          </div>
        </div>

        <!-- アミュプラザ鹿児島 ＆ 観覧車アミュラン -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 1.05rem; color: var(--primary-color); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            🎡 アミュプラザ鹿児島 ＆ 大観覧車「アミュラン」
          </h4>
          <p style="font-size: 0.88rem; color: #555; margin-bottom: 10px;">
            駅直結のランドマーク。本館6階屋上にある大観覧車「アミュラン」からは、地上約91mから雄大な桜島や錦江湾、鹿児島市内を一望できます。
          </p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 0.88rem; line-height: 1.7;">
            <p><strong>🕒 観覧車営業時間:</strong> 平日 12:00〜19:45 ／ 土日祝 10:00〜19:45（最終搭乗）</p>
            <p><strong>💰 料金:</strong> 大人（高校生以上）800円 ／ 中高生 500円 ／ 小人（3歳〜小学生）300円 ／ 1ゴンドラ貸切 2,000円</p>
            <p><strong>💡 ポイント:</strong> 透明なシースルーゴンドラ（2台）もありスリル満点！日中の桜島鑑賞はもちろん、夜景もおすすめです。</p>
          </div>
          <div style="margin-top: 10px;">
            <a href="https://www.jrkagoshimacity.com/" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.82rem; padding: 6px 12px;">
              🔗 アミュプラザ鹿児島 公式サイトを見る
            </a>
          </div>
        </div>

        <!-- 駅周辺・みやげ横丁 お土産情報 -->
        <h3 style="font-size: 1.2rem; color: var(--primary-color); margin: 24px 0 10px; display: flex; align-items: center; gap: 6px;">
          🛍️ 鹿児島中央駅周辺 お土産＆名物グルメ
        </h3>
        <p style="font-size: 0.88rem; color: #666; margin-bottom: 8px;">
          JR改札口正面の「みやげ横丁」「ぐるめ横丁」、駅直結ビル「Li-Ka1920」に鹿児島の銘菓・特産品が集結しています。
        </p>
        <div class="souvenir-grid">
          <div class="souvenir-card">
            <div style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem; margin-bottom: 4px;">🍠 薩摩銘菓「かるかん」</div>
            <p style="font-size: 0.85rem; color: #555; line-height: 1.6;">
              自然薯（山芋）を使った伝統銘菓「明石屋」や、カスタード入りの「かすたどん」で有名な「薩摩蒸氣屋」の直営店がみやげ横丁にあります。
            </p>
          </div>
          <div class="souvenir-card">
            <div style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem; margin-bottom: 4px;">🐟 本場「さつま揚げ」</div>
            <p style="font-size: 0.85rem; color: #555; line-height: 1.6;">
              「月揚庵」「揚立屋」「勘場蒲鉾店」など名店が勢揃い。実演揚げたての温かいさつま揚げを新幹線のお供やホテルのおつまみに購入できます。
            </p>
          </div>
          <div class="souvenir-card">
            <div style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem; margin-bottom: 4px;">🍶 薩摩本格焼酎</div>
            <p style="font-size: 0.85rem; color: #555; line-height: 1.6;">
              鹿児島県内各地の蔵元から数百銘柄がラインナップ。お土産用のミニボトルセットや限定ラベルも充実しています。
            </p>
          </div>
          <div class="souvenir-card">
            <div style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem; margin-bottom: 4px;">🏮 かごっまふるさと屋台村</div>
            <p style="font-size: 0.85rem; color: #555; line-height: 1.6;">
              駅直結「Li-Ka1920」1階とターミナル地下1階「バスチカ」で営業中。地元料理と焼酎を一人でも気軽に楽しめます。
            </p>
          </div>
        </div>

        <!-- 公式サイトリンク集ボタン -->
        <div class="official-link-section" style="margin-top: 24px;">
          <div class="official-link-title">🔗 鹿児島県・鹿児島市・交通事業者 公式サイト集</div>
          <p style="font-size: 0.85rem; color: #666; margin-bottom: 12px;">
            最新の観光パンフレットダウンロードや交通ダイヤ詳細は、以下の公式リンクからご確認いただけます：
          </p>
          <div class="official-btn-grid">
            <a href="https://www.kagoshima-kankou.com/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
              🏛️ 鹿児島県観光サイト（鹿児島県観光連盟）
            </a>
            <a href="https://www.kagoshima-yokanavi.jp/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
              🌴 鹿児島市公式観光サイト（よかとこ かごしまナビ）
            </a>
            <a href="https://www.kotsu-city-kagoshima.jp/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
              🚌 鹿児島市交通局（市電・バス・シティビュー公式）
            </a>
            <a href="https://www.jrkagoshimacity.com/" target="_blank" rel="noopener noreferrer" class="official-link-btn">
              🏢 アミュプラザ鹿児島 公式サイト
            </a>
          </div>
        </div>
      `;
    }
  }

  if (data.todayAdvice) {
    const adviceContainer = document.getElementById("today-advice-list");
    if (adviceContainer) {
      adviceContainer.innerHTML = data.todayAdvice.map(a => `<li>${a}</li>`).join("");
    }
  }
}

// ==========================================
// 持ち物チェックリスト機能（2泊3日 スカイマーク・ホテルタイセイ・一人旅特化）
// ==========================================
function initChecklist() {
  const container = document.getElementById("checklist-container");
  if (!container) return;

  const data = window.CHECKLIST_DATA || {
    profile: {
      title: "鹿児島 2泊3日 一人旅 パッキングガイド",
      dates: "2026年10月22日(木)〜10月24日(土)",
      flight: "スカイマーク（羽田/各地 ⇄ 鹿児島空港）",
      hotel: "ホテルタイセイ（鹿児島中央駅東口より徒歩約5分）",
      style: "背負いバッグ（リュック）中心・機内持ち込みコンパクト旅行（10kg以内）"
    },
    hotelInfo: {
      name: "ホテルタイセイ",
      providedAmenities: [
        "バスタオル・フェイスタオル",
        "歯磨きセット（歯ブラシ・歯磨き粉）",
        "シャンプー・リンス・ボディソープ",
        "ドライヤー",
        "スリッパ",
        "湯沸かしポット・湯茶セット",
        "冷蔵庫（空）"
      ],
      facilities: ["コインランドリー（有料・館内設置）", "1階ロビー フリードリンクコーナー"],
      tip: "タオル、ドライヤー、歯ブラシ、シャンプー類は客室に完備されているため持参不要です。背負いバッグを大幅に軽量化できます。"
    },
    flightRules: {
      airline: "スカイマーク（SKYMARK）公式ルール",
      carryOnSize: "合計10kg以内 / 3辺の合計115cm以内（55×40×25cm以内） / 身の回り品＋手荷物計2個まで",
      powerBank: "【受託手荷物（預け入れ）は禁止❌・必ず機内持ち込み⭕️】リチウムイオン電池は発火リスク防止のため預け入れ不可。160Wh以下。",
      knives: "【機内持ち込み禁止❌】ハサミ・カッター・小型ナイフ等の刃物類は手荷物不可。手荷物のみの旅行では持参しないよう注意。",
      lighter: "【預入不可❌・機内持ち込み1人1個のみ⭕️】喫煙用ライターは1人1個まで身につけて持ち込み可。",
      liquids: "【国内線ルール】お茶や水などのペットボトル飲料は保安検査場で検査を受ければ持ち込み可能です。",
      officialUrl: "https://www.skymark.co.jp/ja/baggage/"
    },
    categories: []
  };

  const saved = JSON.parse(localStorage.getItem("kagoshima_checklist") || "{}");

  // カテゴリーカードのHTML生成
  const categoriesHtml = (data.categories || []).map(cat => {
    const itemsHtml = cat.items.map(item => {
      const isChecked = !!saved[item.id];
      return `
        <div class="checklist-item-row ${isChecked ? 'is-checked' : ''}" data-id="${item.id}">
          <input type="checkbox" class="checklist-item-checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
          <div class="checklist-item-body">
            <div class="checklist-item-name">${item.name}</div>
            <div class="checklist-item-note">${item.note}</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="checklist-category-card">
        <div class="checklist-category-header">
          <div class="checklist-category-title">
            <span>${cat.icon}</span> ${cat.name}
          </div>
          <span class="checklist-category-badge">${cat.items.length} 項目</span>
        </div>
        <div class="checklist-category-desc">${cat.desc}</div>
        <div class="checklist-item-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  // コンテナ全体のHTML構築
  container.innerHTML = `
    <!-- 旅行概要バナー -->
    <div class="checklist-profile-box">
      <div style="font-weight: bold; font-size: 1rem; color: #1e293b;">
        🎒 2泊3日 鹿児島一人旅 パッキング仕様
      </div>
      <div class="checklist-profile-tags">
        <span class="checklist-profile-tag">📅 日程: 2026年10月22日(木)〜24日(土)</span>
        <span class="checklist-profile-tag">✈️ 航空会社: スカイマーク利用</span>
        <span class="checklist-profile-tag">🏨 宿泊: ホテルタイセイ（中央駅東口徒歩5分）</span>
        <span class="checklist-profile-tag">🎒 荷物: 背負いバッグ中心（10kg以内・預け荷物なし）</span>
      </div>
    </div>

    <!-- 準備完了率・プログレスカード -->
    <div class="checklist-progress-card">
      <div class="checklist-progress-header">
        <div class="checklist-progress-rate">
          <span id="checklist-rate-text">準備完了率 0%</span>
        </div>
        <div class="checklist-progress-count" id="checklist-count-text">
          0 / 0 項目完了
        </div>
      </div>
      <div class="checklist-progress-bar-bg">
        <div class="checklist-progress-bar-fill" id="checklist-progress-fill"></div>
      </div>
      <div class="checklist-control-bar">
        <button type="button" class="checklist-btn checklist-btn-reset" onclick="resetAllChecklist()">
          🗑️ すべて解除
        </button>
        <button type="button" class="checklist-btn checklist-btn-checkall" onclick="checkAllChecklist()">
          ✅ すべて完了にする
        </button>
      </div>
    </div>

    <!-- ホテルタイセイ 備品・アメニティ案内（持参不要で荷物削減！） -->
    <div class="checklist-info-card checklist-hotel-card">
      <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
        🏨 ホテルタイセイ 客室設備・アメニティ（公式確認済）
      </div>
      <p style="margin-bottom: 6px;">
        客室に以下の備品が完備されているため、<strong>持参不要</strong>です。背負いバッグのスペースと重量を大幅に節約できます！
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;">
        ${(data.hotelInfo.providedAmenities || []).map(a => `
          <span style="background: #ffffff; border: 1px solid #a7f3d0; border-radius: 4px; padding: 3px 8px; font-size: 0.8rem; font-weight: 600;">
            ✓ ${a}
          </span>
        `).join("")}
      </div>
      <div style="font-size: 0.82rem; color: #047857; margin-top: 6px;">
        💡 館内に<strong>コインランドリー（有料）</strong>もあるため、下着・衣類を洗濯して使い回すことでさらに荷物を削減可能です。
      </div>
    </div>

    <!-- スカイマーク 飛行機手荷物ルール＆制限品注意 -->
    <div class="checklist-info-card checklist-flight-card">
      <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
        ✈️ スカイマーク手荷物制限・注意事項（公式確認済）
      </div>
      <ul style="padding-left: 18px; margin: 6px 0; font-size: 0.84rem; line-height: 1.6;">
        <li><strong>機内持ち込み規定:</strong> 合計10kg以内、3辺合計115cm以内（55×40×25cm以内）、身の回り品1個＋手荷物1個の計2個まで。</li>
        <li><strong>⚠️ モバイルバッテリー:</strong> <strong>【預け入れ荷物は法律で禁止❌・必ず機内持ち込み⭕️】</strong>（160Wh以下。端子のショート防止措置を推奨）。</li>
        <li><strong>⚠️ 刃物類:</strong> ハサミ、カッター、小型ナイフ等は<strong>機内持ち込み禁止❌</strong>。手荷物のみのパッキング時はカバンに入れないよう注意。</li>
        <li><strong>⚠️ ライター:</strong> 喫煙用は<strong>1人1個まで身につけて機内持ち込みのみ可⭕️</strong>（預け入れ不可❌）。</li>
        <li><strong>🥤 飲料・液体物:</strong> 国内線のため、ペットボトル飲料は保安検査機で検査を受ければ機内持ち込み可能です。</li>
      </ul>
      <div style="margin-top: 8px;">
        <a href="${data.flightRules.officialUrl}" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="font-size: 0.82rem; padding: 5px 12px; display: inline-block;">
          🔗 スカイマーク公式 手荷物案内を見る
        </a>
      </div>
    </div>

    <!-- カテゴリー別チェックリスト一覧 -->
    <div id="checklist-categories-container">
      ${categoriesHtml}
    </div>
  `;

  // イベントリスナーの登録
  setupChecklistEvents();
  updateChecklistProgress();
}

// チェックボックスおよび行クリックイベントの設定
function setupChecklistEvents() {
  const container = document.getElementById("checklist-container");
  if (!container) return;

  const rows = container.querySelectorAll(".checklist-item-row");
  rows.forEach(row => {
    const cb = row.querySelector(".checklist-item-checkbox");
    if (!cb) return;

    // 行全体のクリックでチェックボックスをトグル
    row.addEventListener("click", (e) => {
      if (e.target !== cb) {
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event("change"));
      }
    });

    // チェックボックスの状態変化時の処理
    cb.addEventListener("change", () => {
      const saved = JSON.parse(localStorage.getItem("kagoshima_checklist") || "{}");
      saved[cb.id] = cb.checked;
      localStorage.setItem("kagoshima_checklist", JSON.stringify(saved));

      if (cb.checked) {
        row.classList.add("is-checked");
      } else {
        row.classList.remove("is-checked");
      }

      updateChecklistProgress();
    });
  });
}

// 準備完了率・プログレスバーの更新
function updateChecklistProgress() {
  const container = document.getElementById("checklist-container");
  if (!container) return;

  const checkboxes = container.querySelectorAll(".checklist-item-checkbox");
  const total = checkboxes.length;
  let checked = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) checked++;
  });

  const rate = total > 0 ? Math.round((checked / total) * 100) : 0;

  const rateEl = document.getElementById("checklist-rate-text");
  const countEl = document.getElementById("checklist-count-text");
  const fillEl = document.getElementById("checklist-progress-fill");

  if (rateEl) {
    rateEl.textContent = `準備完了率 ${rate}%`;
    if (rate === 100) {
      rateEl.innerHTML = `🎉 準備完了率 100%（パッキング完了！）`;
      rateEl.style.color = "#059669";
    } else {
      rateEl.style.color = "#059669";
    }
  }

  if (countEl) {
    countEl.textContent = `${checked} / ${total} 項目完了`;
  }

  if (fillEl) {
    fillEl.style.width = `${rate}%`;
  }
}

// すべて解除
window.resetAllChecklist = function() {
  if (!confirm("チェック状態をすべて解除してもよろしいですか？")) return;

  localStorage.removeItem("kagoshima_checklist");

  const container = document.getElementById("checklist-container");
  if (!container) return;

  container.querySelectorAll(".checklist-item-checkbox").forEach(cb => {
    cb.checked = false;
  });

  container.querySelectorAll(".checklist-item-row").forEach(row => {
    row.classList.remove("is-checked");
  });

  updateChecklistProgress();
};

// すべて完了
window.checkAllChecklist = function() {
  const container = document.getElementById("checklist-container");
  if (!container) return;

  const saved = {};
  container.querySelectorAll(".checklist-item-checkbox").forEach(cb => {
    cb.checked = true;
    saved[cb.id] = true;
  });

  container.querySelectorAll(".checklist-item-row").forEach(row => {
    row.classList.add("is-checked");
  });

  localStorage.setItem("kagoshima_checklist", JSON.stringify(saved));
  updateChecklistProgress();
};

// ==========================================
// 桜島フェリー時刻表の表示制御（平日・土日祝切り替え）
// ==========================================
function switchTimetable(type) {
  const btnWeekday = document.getElementById("btn-timetable-weekday");
  const btnWeekend = document.getElementById("btn-timetable-weekend");

  if (type === 'weekday') {
    if (btnWeekday) btnWeekday.classList.add("active");
    if (btnWeekend) btnWeekend.classList.remove("active");
  } else {
    if (btnWeekday) btnWeekday.classList.remove("active");
    if (btnWeekend) btnWeekend.classList.add("active");
  }

  renderTimetableTables(type);
}

function renderTimetableTables(type) {
  const container = document.getElementById("timetable-tables-container");
  if (!container) return;

  // 内蔵・フォールバック時刻表データ
  const defaultTimetable = {
    weekday: {
      label: "平日ダイヤ（10月22日・23日適用 / 1日94便）",
      kagoshima: {
        4: ["30"], 5: ["30"], 6: ["00", "30"],
        7: ["00", "20", "40"], 8: ["00", "20", "40"], 9: ["00", "20", "40"],
        10: ["00", "20", "40"], 11: ["00", "20", "40"], 12: ["00", "20", "40"],
        13: ["00", "20", "40"], 14: ["00", "20", "40"], 15: ["00", "20", "40"],
        16: ["00", "20", "40"], 17: ["00", "20", "40"], 18: ["00", "20", "40"],
        19: ["00", "30"], 20: ["00", "30"], 21: ["30"], 22: ["30"], 23: ["30"]
      },
      sakurajima: {
        4: ["00"], 5: ["00"], 6: ["05", "25", "45"],
        7: ["05", "25", "45"], 8: ["05", "25", "45"], 9: ["05", "25", "45"],
        10: ["05", "25", "45"], 11: ["05", "25", "45"], 12: ["05", "25", "45"],
        13: ["05", "25", "45"], 14: ["05", "25", "45"], 15: ["05", "25", "45"],
        16: ["05", "25", "45"], 17: ["05", "25", "45"], 18: ["05", "25", "45"],
        19: ["05", "30"], 20: ["00"], 21: ["00"], 22: ["00"], 23: ["00"]
      }
    },
    weekend: {
      label: "土日祝日ダイヤ（10月24日適用 / 1日104便）",
      kagoshima: {
        4: ["30"], 5: ["30"], 6: ["00", "30"],
        7: ["00", "20", "40"], 8: ["00", "20", "40"], 9: ["00", "20", "40"],
        10: ["00", "20", "40"], 11: ["00", "20", "40"], 12: ["00", "20", "40"],
        13: ["00", "20", "40"],
        14: ["00", "15", "30", "45"], 15: ["00", "15", "30", "45"],
        16: ["00", "15", "30", "45"], 17: ["00", "15", "30", "45"], 18: ["00", "15", "30", "45"],
        19: ["00", "30"], 20: ["00", "30"], 21: ["30"], 22: ["30"], 23: ["30"]
      },
      sakurajima: {
        4: ["00"], 5: ["00"], 6: ["05", "25", "45"],
        7: ["05", "25", "45"], 8: ["05", "25", "45"], 9: ["05", "25", "45"],
        10: ["05", "25", "45"], 11: ["05", "25", "45"], 12: ["05", "25", "45"],
        13: ["05", "25", "45"], 14: ["05", "15", "30", "45"],
        15: ["00", "15", "30", "45"], 16: ["00", "15", "30", "45"],
        17: ["00", "15", "30", "45"], 18: ["00", "15", "30", "45"],
        19: ["05", "30"], 20: ["00"], 21: ["00"], 22: ["00"], 23: ["00"]
      }
    }
  };

  const timetableSource = (window.FERRY_TIMETABLE_DATA && window.FERRY_TIMETABLE_DATA[type]) 
    ? window.FERRY_TIMETABLE_DATA[type] 
    : defaultTimetable[type];

  const kagoshimaData = timetableSource.kagoshima;
  const sakurajimaData = timetableSource.sakurajima;

  const hours = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  function makeRows(dataMap) {
    return hours.map(h => {
      const minutes = dataMap[h] || [];
      const isDaytime = (h >= 7 && h <= 18);
      const minTags = minutes.map(m => {
        const isFrequent = isDaytime;
        return `<span class="time-minute-tag ${isFrequent ? 'peak' : ''}">${m}分</span>`;
      }).join("");

      return `
        <tr>
          <th>${h}時</th>
          <td><div class="timetable-minutes">${minTags}</div></td>
        </tr>
      `;
    }).join("");
  }

  container.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; color: var(--primary-color);">
      📌 現在表示中: ${type === 'weekday' ? '【平日ダイヤ】10/22(木)・10/23(金) 旅行初日＆2日目' : '【土日祝ダイヤ】10/24(土) 旅行最終日（午後は15分間隔に増便）'}
    </div>
    <div class="timetable-columns">
      <!-- 鹿児島港発 -->
      <div class="timetable-col-card">
        <div class="timetable-col-title">
          <span>🚩 鹿児島港発（鹿児島市内 → 桜島）</span>
          <span style="font-size:0.8rem; color:#666;">始発 4:30 / 最終 23:30</span>
        </div>
        <table class="timetable-table">
          <thead>
            <tr>
              <th style="width: 55px;">時間</th>
              <th>出港時刻（分）</th>
            </tr>
          </thead>
          <tbody>
            ${makeRows(kagoshimaData)}
          </tbody>
        </table>
      </div>

      <!-- 桜島港発 -->
      <div class="timetable-col-card">
        <div class="timetable-col-title">
          <span>🌋 桜島港発（桜島 → 鹿児島市内）</span>
          <span style="font-size:0.8rem; color:#666;">始発 4:00 / 最終 23:00</span>
        </div>
        <table class="timetable-table">
          <thead>
            <tr>
              <th style="width: 55px;">時間</th>
              <th>出港時刻（分）</th>
            </tr>
          </thead>
          <tbody>
            ${makeRows(sakurajimaData)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// 天文館グルメ フィルター＆カード生成（一人旅特化）
// ==========================================
function initGourmet() {
  renderGourmetList('all');
}

function filterGourmet(filterType) {
  const buttons = document.querySelectorAll(".gourmet-filter-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-filter") === filterType) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderGourmetList(filterType);
}

function renderGourmetList(filterType = 'all') {
  const container = document.getElementById("gourmet-cards-container");
  const countEl = document.getElementById("gourmet-count-display");
  if (!container) return;

  const list = window.GOURMET_DATA || [];
  let filtered = list;

  if (filterType === 'solo') {
    filtered = list.filter(item => item.soloFriendly);
  } else if (filterType !== 'all') {
    filtered = list.filter(item => item.category === filterType);
  }

  if (countEl) {
    const filterNames = {
      'all': 'すべての店舗',
      'solo': '今夜のおすすめ（一人旅向け）',
      'kurobuta': '黒豚（とんかつ・しゃぶ）',
      'local': '郷土料理',
      'ramen': 'ラーメン',
      'sweets': '白熊・スイーツ',
      'satsumaage': 'さつま揚げ'
    };
    countEl.innerHTML = `表示中: <strong>${filterNames[filterType] || filterType}</strong>（全 ${filtered.length} 件）`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: #fff; border-radius: 8px;">
        <p style="color: #666;">該当する店舗が見つかりませんでした。</p>
      </div>
    `;
    return;
  }

  const fmt = (str) => (str ? String(str).replace(/\n/g, '<br>') : '要確認');

  container.innerHTML = filtered.map(item => `
    <div class="gourmet-card">
      <div>
        <div class="gourmet-card-header">
          <h4 class="gourmet-shop-name">${item.name || '要確認'}</h4>
          <div class="gourmet-badge-row">
            <span class="solo-tag">${item.soloBadge || '★一人旅おすすめ'}</span>
            <span class="gourmet-category-tag">🏷️ ${item.categoryLabel || '要確認'}</span>
          </div>
        </div>

        <div class="gourmet-solo-tip">
          👤 <strong>一人旅アドバイス:</strong> ${fmt(item.soloTip)}
        </div>

        <ul class="gourmet-info-list">
          <li><strong>🍴 おすすめ料理:</strong> ${fmt(item.recommendMenu)}</li>
          <li><strong>💰 予算の目安:</strong> ${fmt(item.budget)}</li>
          <li><strong>🕒 営業時間:</strong><br>${fmt(item.hours)}</li>
          <li><strong>🎌 定休日:</strong> ${fmt(item.closed)}</li>
          <li><strong>🚶 アクセス:</strong> ${fmt(item.access)}</li>
          <li><strong>📍 住所:</strong> ${fmt(item.address)}</li>
          <li><strong>📝 予約の要否:</strong> ${fmt(item.reservation)}</li>
        </ul>
      </div>

      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color);">
        <a href="${item.officialUrl || '#'}" target="_blank" rel="noopener noreferrer" class="official-link-btn" style="width: 100%; font-size: 0.85rem; padding: 7px 12px;">
          🔗 公式サイト / 公式観光情報を見る
        </a>
      </div>
    </div>
  `).join("");
}

// ==========================================
// 旅行スケジュール タイムライン機能（2泊3日）
// ==========================================
let currentScheduleDay = 1;

function initSchedule() {
  const container = document.getElementById("schedule-container");
  if (!container) return;

  renderScheduleDay(currentScheduleDay);
}

function renderScheduleDay(dayNum) {
  currentScheduleDay = dayNum;
  const container = document.getElementById("schedule-container");
  if (!container) return;

  const data = window.SCHEDULE_DATA;
  if (!data || !data.days) return;

  const dayData = data.days.find(d => d.dayNumber === dayNum) || data.days[0];
  const saved = JSON.parse(localStorage.getItem("kagoshima_schedule") || "{}");

  // 日程切り替えサブタブ
  const subtabsHtml = `
    <div class="schedule-subtabs-bar">
      ${data.days.map(d => `
        <button type="button" class="schedule-day-btn ${d.dayNumber === dayNum ? 'active' : ''}" onclick="renderScheduleDay(${d.dayNumber})">
          ${d.dayNumber === 1 ? '📅 1日目 (10/22 木)' : d.dayNumber === 2 ? '🌋 2日目 (10/23 金)' : '🛫 3日目 (10/24 土)'}
        </button>
      `).join("")}
    </div>
  `;

  // 日程サマリーカード
  const summaryHtml = `
    <div class="schedule-summary-card">
      <div style="font-weight: 800; font-size: 1.05rem; color: #1e293b; margin-bottom: 4px;">
        ${dayData.date} ： ${dayData.subtitle}
      </div>
      <div style="font-size: 0.88rem; color: #475569; line-height: 1.55;">
        ${dayData.summary}
      </div>
    </div>
  `;

  // 進捗バー＆一括ボタン
  const controlHtml = `
    <div class="schedule-progress-bar-card">
      <div style="font-weight: 700; font-size: 0.95rem; color: #0b63b6;" id="schedule-progress-text">
        進捗計算中...
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="checklist-btn checklist-btn-reset" onclick="resetDaySchedule(${dayNum})">
          🗑️ この日のチェック解除
        </button>
        <button type="button" class="checklist-btn checklist-btn-checkall" onclick="checkAllDaySchedule(${dayNum})">
          ✅ すべて完了
        </button>
      </div>
    </div>
  `;

  // タイムラインアイテムリスト
  const timelineHtml = `
    <div class="timeline-list">
      ${dayData.timeline.map(item => {
        const isChecked = !!saved[item.id];
        return `
          <div class="timeline-item-card ${isChecked ? 'is-done' : ''}" data-id="${item.id}">
            <div class="timeline-header">
              <div class="timeline-title-wrap">
                <input type="checkbox" class="timeline-checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                <span class="timeline-time-badge">${item.time}</span>
                <span class="timeline-title">${item.icon} ${item.title}</span>
              </div>
            </div>

            <div class="timeline-meta-box">
              <div>📍 <strong>場所:</strong> ${item.location}</div>
              <div>🚶 <strong>移動・交通:</strong> ${item.transit}</div>
            </div>

            <div class="timeline-detail-text">
              ${item.detail}
            </div>

            <div class="timeline-btn-bar">
              ${item.mapUrl ? `
                <a href="${item.mapUrl}" target="_blank" rel="noopener noreferrer" class="timeline-btn timeline-btn-map">
                  🗺️ 地図を開く
                </a>
              ` : ''}
              ${item.officialUrl ? `
                <a href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" class="timeline-btn timeline-btn-official">
                  🔗 公式サイトを見る
                </a>
              ` : ''}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  // 雨天時代替プランカード
  let rainyHtml = "";
  if (dayData.rainyOption) {
    rainyHtml = `
      <div class="schedule-rainy-card">
        <div class="schedule-rainy-title">
          <span>${dayData.rainyOption.title}</span>
        </div>
        <p style="font-size: 0.85rem; color: #0369a1; margin-bottom: 8px;">
          ${dayData.rainyOption.desc}
        </p>
        <div class="schedule-rainy-grid">
          ${dayData.rainyOption.spots.map(sp => `
            <div class="schedule-rainy-spot">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 4px;">🏛️ ${sp.name}</div>
              <div style="color: #475569; line-height: 1.4;">${sp.detail}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${subtabsHtml}
    ${summaryHtml}
    ${controlHtml}
    ${timelineHtml}
    ${rainyHtml}
  `;

  setupScheduleEvents();
  updateScheduleProgress(dayNum);
}

function setupScheduleEvents() {
  const container = document.getElementById("schedule-container");
  if (!container) return;

  const cards = container.querySelectorAll(".timeline-item-card");
  cards.forEach(card => {
    const cb = card.querySelector(".timeline-checkbox");
    if (!cb) return;

    card.addEventListener("click", (e) => {
      // リンクやボタン、チェックボックス本体のクリック時は行全体のトグルを行わない
      if (e.target.closest("a") || e.target.closest("button") || e.target === cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    });

    cb.addEventListener("change", () => {
      const saved = JSON.parse(localStorage.getItem("kagoshima_schedule") || "{}");
      saved[cb.id] = cb.checked;
      localStorage.setItem("kagoshima_schedule", JSON.stringify(saved));

      if (cb.checked) {
        card.classList.add("is-done");
      } else {
        card.classList.remove("is-done");
      }

      updateScheduleProgress(currentScheduleDay);
    });
  });
}

function updateScheduleProgress(dayNum) {
  const container = document.getElementById("schedule-container");
  if (!container) return;

  const checkboxes = container.querySelectorAll(".timeline-checkbox");
  const total = checkboxes.length;
  let checked = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) checked++;
  });

  const rate = total > 0 ? Math.round((checked / total) * 100) : 0;
  const progressEl = document.getElementById("schedule-progress-text");
  if (progressEl) {
    if (rate === 100 && total > 0) {
      progressEl.innerHTML = `🎉 ${dayNum}日目の全予定完了！ (100%)`;
      progressEl.style.color = "#059669";
    } else {
      progressEl.innerHTML = `🏁 進捗: <strong>${checked} / ${total} 件</strong> 完了 (${rate}%)`;
      progressEl.style.color = "#0b63b6";
    }
  }
}

window.resetDaySchedule = function(dayNum) {
  if (!confirm(`${dayNum}日目のチェック状態を解除してもよろしいですか？`)) return;

  const data = window.SCHEDULE_DATA;
  if (!data || !data.days) return;
  const dayData = data.days.find(d => d.dayNumber === dayNum);
  if (!dayData) return;

  const saved = JSON.parse(localStorage.getItem("kagoshima_schedule") || "{}");
  dayData.timeline.forEach(item => {
    delete saved[item.id];
  });
  localStorage.setItem("kagoshima_schedule", JSON.stringify(saved));

  const container = document.getElementById("schedule-container");
  if (!container) return;
  container.querySelectorAll(".timeline-checkbox").forEach(cb => {
    cb.checked = false;
  });
  container.querySelectorAll(".timeline-item-card").forEach(card => {
    card.classList.remove("is-done");
  });

  updateScheduleProgress(dayNum);
};

window.checkAllDaySchedule = function(dayNum) {
  const data = window.SCHEDULE_DATA;
  if (!data || !data.days) return;
  const dayData = data.days.find(d => d.dayNumber === dayNum);
  if (!dayData) return;

  const saved = JSON.parse(localStorage.getItem("kagoshima_schedule") || "{}");
  dayData.timeline.forEach(item => {
    saved[item.id] = true;
  });
  localStorage.setItem("kagoshima_schedule", JSON.stringify(saved));

  const container = document.getElementById("schedule-container");
  if (!container) return;
  container.querySelectorAll(".timeline-checkbox").forEach(cb => {
    cb.checked = true;
  });
  container.querySelectorAll(".timeline-item-card").forEach(card => {
    card.classList.add("is-done");
  });

  updateScheduleProgress(dayNum);
};

