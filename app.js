const yuan = new Intl.NumberFormat("zh-CN");
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const defaultSettings = {
  playThreshold: 500000000,
  heatThreshold: 86000,
  sourceUrl: "https://v2.xxapi.cn/api/douyinhot",
  sourceKind: "json",
  autoSyncSource: true,
  useSampleData: false,
  tianApiKey: "",
};

const MAX_RENDERED_TOPICS = 300;
const DAILY_HOT_DOUYIN_URL = "https://api-hot.imsyy.top/douyin";
const XXAPI_DOUYIN_HOT_URL = "https://v2.xxapi.cn/api/douyinhot";
const TIANAPI_DOUYIN_HOT_URL = "https://apis.tianapi.com/douyinhot/index";

const intentLexicon = [
  {
    name: "游戏",
    terms: ["游戏", "手游", "端游", "电竞", "3A", "NPC", "副本", "Steam", "三角洲", "射击", "开放世界", "宝可梦"],
  },
  {
    name: "动漫",
    terms: ["动漫", "动画", "国漫", "二次元", "番剧", "漫画", "IP", "角色", "宝可梦", "港漫"],
  },
  {
    name: "影视",
    terms: ["影视", "电影", "美剧", "港剧", "TVB", "剧本", "经典电影", "演员", "剧情", "短剧"],
  },
  {
    name: "恋爱婚姻",
    terms: ["恋爱", "婚姻", "离婚", "前夫", "复合", "甜宠", "CP", "暗恋", "亲密"],
  },
  {
    name: "逆袭复仇",
    terms: ["逆袭", "复仇", "反杀", "重生", "爽文", "黑化", "洗白", "打脸"],
  },
  {
    name: "悬疑惊悚",
    terms: ["悬疑", "惊悚", "恐怖", "微恐", "盗墓", "解谜", "怪谈", "狼人", "吸血鬼"],
  },
  {
    name: "战争竞技",
    terms: ["战争", "竞技", "体育", "篮球", "足球", "枪战", "士兵", "战地", "三角洲"],
  },
];

const defaultCategories = [
  "全部",
  "抖音热榜",
  "微恐",
  "恋爱婚姻",
  "港漫",
  "赌片系列",
  "偶像养成",
  "星际科幻",
  "穿书穿越",
  "架空题材IP宇宙",
  "美剧古装传记",
  "体育竞技",
  "盗墓探险解谜",
  "吸血鬼狼人",
  "权谋微欧美",
  "鲨鱼游戏系列",
  "神话传记",
  "中国正统武侠",
  "现代战争竞技",
  "游戏3A",
  "宝可梦系列",
  "电影美剧",
  "惊悚刺激",
  "黑社会卧底",
];

const baseTopics = [];

const storedSettings = readJSON("radarSettings", {});
const hasStoredSourceUrl = typeof storedSettings.sourceUrl === "string" && storedSettings.sourceUrl.trim().length > 0;
const storedSourceUrl = hasStoredSourceUrl ? migrateCloudSourceUrl(storedSettings.sourceUrl.trim()) : "";
let settings = { ...defaultSettings, ...storedSettings };
settings.useSampleData = false;
settings.sourceUrl = storedSourceUrl || defaultSettings.sourceUrl;
settings.sourceKind = isKnownDouyinHotApi(settings.sourceUrl) ? "json" : settings.sourceKind || defaultSettings.sourceKind;
settings.autoSyncSource = true;
const storedImportedTopics = readJSON("radarImportedTopics", []);
let importedTopics = storedImportedTopics.filter(isCloudApiTopic);
let importHistory = readJSON("radarImportHistory", []);
let topicSnapshots = readJSON("radarTopicSnapshots", []);
let latestImportReport = readJSON("radarLatestImportReport", null);
let dataSourceStatus = readJSON("radarDataSourceStatus", null);
const removedLocalTopicCount = storedImportedTopics.length - importedTopics.length;
if (removedLocalTopicCount > 0 || storedSettings.useSampleData || !isCloudApiSource(storedSettings.sourceUrl || "")) {
  importHistory = [];
  topicSnapshots = [];
  latestImportReport = null;
  dataSourceStatus = {
    state: "idle",
    message: "已切换为云端 API-only，旧本地数据已移除",
    sourceUrl: settings.sourceUrl,
    updatedAt: new Date().toISOString(),
    usingCache: importedTopics.length > 0,
  };
  writeJSON("radarSettings", settings);
  writeJSON("radarImportedTopics", importedTopics);
  writeJSON("radarImportHistory", importHistory);
  writeJSON("radarTopicSnapshots", topicSnapshots);
  writeJSON("radarLatestImportReport", latestImportReport);
  writeJSON("radarDataSourceStatus", dataSourceStatus);
}
let topics = buildTopicCollection();
let favorites = new Set(readJSON("radarFavorites", ["t1", "t7", "t9"]));
let selectedTopicId = "t1";
let alertsRead = new Set(readJSON("radarAlertsRead", []));
let storyCards = readJSON("radarStoryCards", seedStoryCards());
const cloudTopicIds = new Set(importedTopics.map((topic) => topic.id));
const filteredStoryCards = storyCards.filter((card) => cloudTopicIds.has(card.topicId));
if (filteredStoryCards.length !== storyCards.length) {
  storyCards = filteredStoryCards;
  writeJSON("radarStoryCards", storyCards);
}

const state = {
  view: "dashboard",
  keyword: "",
  category: "全部",
  platform: "全部",
  heat: "全部",
  time: "全部",
  breakthroughOnly: false,
  favoriteOnly: false,
  ideaStatus: "全部",
  owner: "全部",
};

const viewNames = {
  dashboard: "首页看板",
  topics: "话题搜索",
  ideas: "选题卡",
  alerts: "告警中心",
  admin: "后台配置",
};

document.addEventListener("DOMContentLoaded", () => {
  hydrateControls();
  bindEvents();
  renderAll();
  createIcons();
  if (settings.autoSyncSource && settings.sourceUrl) {
    syncConfiguredSource("打开自动同步", { silent: true });
  }
});

function hydrateControls() {
  fillSelect("categoryFilter", getCategoryOptions());
  fillSelect("platformFilter", getPlatformOptions());
  fillSelect("heatFilter", ["全部", "破圈", "高热度", "中热度"]);
  fillSelect("timeFilter", ["全部", "24小时内", "3天内", "7天内"]);
  fillSelect("ideaStatusFilter", ["全部", "待评审", "已通过", "需修改"]);
  fillSelect("ownerFilter", ["全部", "林制片", "周编剧", "陈策划", "未分配"]);
  document.querySelector("#playThreshold").value = settings.playThreshold;
  document.querySelector("#heatThreshold").value = settings.heatThreshold;
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind;
  document.querySelector("#autoSyncSource").checked = settings.autoSyncSource;
  document.querySelector("#tianApiKey").value = settings.tianApiKey || "";
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.jump));
  });

  document.querySelector("#globalSearch").addEventListener("input", (event) => {
    state.keyword = event.target.value.trim();
    document.querySelector("#keywordFilter").value = state.keyword;
    document.querySelector("#dashboardSearch").value = state.keyword;
    setView("topics");
    renderAll();
  });

  document.querySelector("#dashboardSearch").addEventListener("input", (event) => {
    state.keyword = event.target.value.trim();
    document.querySelector("#globalSearch").value = state.keyword;
    document.querySelector("#keywordFilter").value = state.keyword;
    setView("topics");
    renderAll();
  });

  document.querySelector("#dashboardSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      state.keyword = event.target.value.trim();
      document.querySelector("#globalSearch").value = state.keyword;
      document.querySelector("#keywordFilter").value = state.keyword;
      setView("topics");
      renderAll();
    }
  });

  document.querySelector("#keywordFilter").addEventListener("input", (event) => {
    state.keyword = event.target.value.trim();
    document.querySelector("#globalSearch").value = state.keyword;
    renderTopics();
  });

  [
    ["categoryFilter", "category"],
    ["platformFilter", "platform"],
    ["heatFilter", "heat"],
    ["timeFilter", "time"],
  ].forEach(([id, key]) => {
    document.querySelector(`#${id}`).addEventListener("change", (event) => {
      state[key] = event.target.value;
      renderTopics();
    });
  });

  document.querySelector("#breakthroughFilter").addEventListener("change", (event) => {
    state.breakthroughOnly = event.target.checked;
    renderTopics();
  });

  document.querySelector("#favoriteFilter").addEventListener("change", (event) => {
    state.favoriteOnly = event.target.checked;
    renderTopics();
  });

  document.querySelector("#resetFilters").addEventListener("click", () => {
    Object.assign(state, {
      keyword: "",
      category: "全部",
      platform: "全部",
      heat: "全部",
      time: "全部",
      breakthroughOnly: false,
      favoriteOnly: false,
    });
    document.querySelector("#globalSearch").value = "";
    document.querySelector("#dashboardSearch").value = "";
    document.querySelector("#keywordFilter").value = "";
    document.querySelector("#categoryFilter").value = "全部";
    document.querySelector("#platformFilter").value = "全部";
    document.querySelector("#heatFilter").value = "全部";
    document.querySelector("#timeFilter").value = "全部";
    document.querySelector("#breakthroughFilter").checked = false;
    document.querySelector("#favoriteFilter").checked = false;
    renderTopics();
  });

  document.querySelector("#ideaStatusFilter").addEventListener("change", (event) => {
    state.ideaStatus = event.target.value;
    renderIdeas();
  });

  document.querySelector("#ownerFilter").addEventListener("change", (event) => {
    state.owner = event.target.value;
    renderIdeas();
  });

  document.querySelector("#saveSettings").addEventListener("click", () => {
    settings = {
      playThreshold: Number(document.querySelector("#playThreshold").value || defaultSettings.playThreshold),
      heatThreshold: Number(document.querySelector("#heatThreshold").value || defaultSettings.heatThreshold),
      useSampleData: settings.useSampleData,
      sourceUrl: document.querySelector("#dataSourceUrl").value.trim(),
      sourceKind: document.querySelector("#dataSourceKind").value,
      autoSyncSource: document.querySelector("#autoSyncSource").checked,
    };
    writeJSON("radarSettings", settings);
    renderAll();
    toast("配置已保存，破圈标记和告警已按新阈值刷新。");
  });

  document.querySelector("#dataSourceUrl").addEventListener("change", saveSourceSettings);
  document.querySelector("#dataSourceKind").addEventListener("change", saveSourceSettings);
  document.querySelector("#autoSyncSource").addEventListener("change", saveSourceSettings);
  document.querySelector("#tianApiKey").addEventListener("change", saveSourceSettings);
  document.querySelector("#syncSourceNow").addEventListener("click", () => syncConfiguredSource("手动同步"));
  document.querySelector("#dashboardSyncSource").addEventListener("click", () => syncConfiguredSource("首页同步"));
  document.querySelector("#syncDailyHotDouyin").addEventListener("click", syncDailyHotDouyin);
  document.querySelector("#syncDailyHotDouyinAdmin").addEventListener("click", syncDailyHotDouyin);
  document.querySelector("#syncTianApiHot").addEventListener("click", syncTianApiHot);

  document.querySelector("#refreshButton").addEventListener("click", () => {
    createDailySnapshot("手动刷新");
    toast("已完成云端 API 数据快照、破圈判断和告警刷新。");
    renderAll();
  });

  document.querySelector("#importZoneData").addEventListener("click", () => {
    const input = document.querySelector("#zoneImportInput");
    try {
      const report = importZoneText(input.value, "粘贴导入");
      if (report.accepted === 0) {
        toast("没有可导入的数据，请粘贴 JSON 或 CSV 内容。");
        return;
      }
      input.value = "";
      renderAll();
      toast(`已同步 ${report.accepted} 条云端 API 话题，更新 ${report.updated} 条。`);
    } catch (error) {
      toast(error.message);
    }
  });

  document.querySelector("#zoneImportFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const report = importZoneText(text, file.name);
      event.target.value = "";
      renderAll();
      toast(`已读取 ${file.name}，导入 ${report.accepted} 条话题。`);
    } catch (error) {
      toast(error.message);
    }
  });

  document.querySelector("#clearImportedTopics").addEventListener("click", () => {
    importedTopics = [];
    topics = buildTopicCollection();
    latestImportReport = {
      sourceName: "清空导入",
      totalRows: 0,
      accepted: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      breakthrough: topics.filter(isBreakthrough).length,
      errors: [],
      createdAt: new Date().toISOString(),
    };
    writeJSON("radarImportedTopics", importedTopics);
    writeJSON("radarLatestImportReport", latestImportReport);
    renderAll();
    toast("已清空云端 API 缓存。");
  });

  document.querySelector("#downloadTemplate").addEventListener("click", downloadImportTemplate);
  document.querySelector("#exportTopicsJson").addEventListener("click", () => exportTopics("json"));
  document.querySelector("#exportTopicsCsv").addEventListener("click", () => exportTopics("csv"));
  document.querySelector("#toggleSampleData").addEventListener("click", () => {
    settings.useSampleData = false;
    writeJSON("radarSettings", settings);
    topics = buildTopicCollection();
    renderAll();
    toast("当前为云端 API-only 模式，演示样本不会参与数据。");
  });
  document.querySelector("#createSnapshot").addEventListener("click", () => {
    createDailySnapshot("手动快照");
    renderAll();
    toast("已生成当前话题快照。");
  });

  document.querySelector("#markAlertsRead").addEventListener("click", () => {
    buildAlerts().forEach((alert) => alertsRead.add(alert.id));
    writeJSON("radarAlertsRead", [...alertsRead]);
    renderAlerts();
    toast("告警已全部标记为已读。");
  });

  document.querySelector("#exportIdeas").addEventListener("click", exportIdeas);
}

function setView(view) {
  state.view = view;
  document.querySelector("#viewTitle").textContent = viewNames[view];
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
  createIcons();
}

function renderAll() {
  renderDashboard();
  renderTopics();
  renderIdeas();
  renderAlerts();
  renderAdmin();
  renderImportReport();
  renderDataHealth();
  renderImportHistory();
  renderSourceStatus();
  createIcons();
}

function renderDashboard() {
  const breakthrough = topics.filter(isBreakthrough);
  const rising = [...topics].sort((a, b) => b.rankChange - a.rankChange);
  const reviewCards = storyCards.filter((card) => card.status === "待评审");
  document.querySelector("#metricBreakthrough").textContent = breakthrough.length;
  document.querySelector("#metricRising").textContent = rising[0]?.rankChange || 0;
  document.querySelector("#metricReview").textContent = reviewCards.length;

  document.querySelector("#breakthroughStrip").innerHTML = breakthrough
    .slice(0, 3)
    .map(renderTopicCard)
    .join("");

  const grouped = getCategoryOptions()
    .filter((category) => category !== "全部")
    .map((category) => {
      const items = topics.filter((topic) => topic.category === category);
      const score = Math.round(items.reduce((sum, topic) => sum + topic.heat, 0) / Math.max(items.length, 1));
      return { category, score, count: items.length };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.score - a.score);

  document.querySelector("#categoryBars").innerHTML = grouped
    .map(
      (item) => `
        <div class="category-bar">
          <strong>${item.category}</strong>
          <span class="bar-track"><span class="bar-fill" style="width:${Math.min(item.score / 1000, 100)}%"></span></span>
          <span>${item.score}</span>
        </div>
      `,
    )
    .join("");

  document.querySelector("#risingList").innerHTML = rising
    .slice(0, 5)
    .map(
      (topic) => `
        <button class="rank-item" data-topic="${topic.id}">
          <span class="rank-pill">+${topic.rankChange}</span>
          <span><strong>${topic.title}</strong><small>${topic.category} · 当前第 ${topic.rank} 名</small></span>
          <i data-lucide="chevron-right"></i>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".rank-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedTopicId = item.dataset.topic;
      setView("topics");
      renderTopics();
    });
  });

  document.querySelector("#reviewIdeas").innerHTML = reviewCards.slice(0, 3).map(renderIdeaCard).join("");
  bindDynamicActions();
}

function renderTopics() {
  const results = filterTopics();
  const visibleResults = results.slice(0, MAX_RENDERED_TOPICS);
  document.querySelector("#resultCount").textContent =
    results.length > MAX_RENDERED_TOPICS
      ? `${results.length} 个话题，显示前 ${MAX_RENDERED_TOPICS} 条`
      : `${results.length} 个话题`;
  renderAssociationBoard(results);
  const selectedStillVisible = results.some((topic) => topic.id === selectedTopicId);
  if (!selectedStillVisible && results[0]) selectedTopicId = results[0].id;

  document.querySelector("#topicList").innerHTML = visibleResults
    .map(
      (topic) => `
        <button class="topic-list-item ${topic.id === selectedTopicId ? "active" : ""}" data-topic="${topic.id}">
          <span class="list-main">
            <strong>${topic.title}</strong>
            <span>${renderBreakBadge(topic)}</span>
          </span>
          <span class="tag-row">${topic.tags.slice(0, 4).map((tag) => `<span class="tag">${tag}</span>`).join("")}</span>
          <span class="topic-stats">
            <div><span>话题度/播放量</span><strong>${formatPlay(topic.playCount)}</strong></div>
            <div><span>影响力</span><strong>${yuan.format(topic.influenceIndex)}</strong></div>
            <div><span>排名变化</span><strong>+${topic.rankChange}</strong></div>
          </span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".topic-list-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedTopicId = item.dataset.topic;
      renderTopics();
    });
  });

  renderTopicDetail(topics.find((topic) => topic.id === selectedTopicId) || results[0]);
}

function renderTopicDetail(topic) {
  const detail = document.querySelector("#topicDetail");
  if (!topic) {
    detail.className = "topic-detail empty-state";
    detail.innerHTML = `<i data-lucide="search-x"></i><p>没有找到符合条件的话题。</p>`;
    createIcons();
    return;
  }

  detail.className = "topic-detail";
  detail.innerHTML = `
    <div>
      <div class="topic-card-header">
        <div>
          <h3>${topic.title}</h3>
          <div class="badge-row">${renderBreakBadge(topic)}<span class="badge">${topic.category}</span><span class="badge index">${topic.sourceAuth}</span></div>
        </div>
        <button class="small-action ${favorites.has(topic.id) ? "favorite-on" : ""}" data-fav="${topic.id}">
          ${favorites.has(topic.id) ? "已收藏" : "收藏"}
        </button>
      </div>
    </div>
    ${renderSparkline(topic.trend)}
    <div class="topic-stats">
      <div><span>话题度/播放量</span><strong>${formatPlay(topic.playCount)}</strong></div>
      <div><span>影响力指数</span><strong>${yuan.format(topic.influenceIndex)}</strong></div>
      <div><span>榜单排名</span><strong>#${topic.rank} / +${topic.rankChange}</strong></div>
    </div>
    <div class="analysis-block">
      <h3>数据来源</h3>
      <p>${topic.source}；口径：${topic.sourceAuth}；采集时间：${dateFormatter.format(new Date(topic.collectedAt))}</p>
    </div>
    <div class="analysis-block">
      <h3>用户情绪摘要</h3>
      <p>${topic.sentiment}</p>
    </div>
    <div class="analysis-block">
      <h3>短剧改编机会</h3>
      <p>${topic.opportunity}</p>
    </div>
    <div class="analysis-block">
      <h3>相关话题簇</h3>
      <div class="tag-row">${topic.related.map((item) => `<span class="tag">${item}</span>`).join("")}</div>
    </div>
    <div class="analysis-block">
      <h3>三个切入角度</h3>
      <ol class="angle-list">${buildAngles(topic).map((angle) => `<li>${angle}</li>`).join("")}</ol>
    </div>
    <div class="analysis-block">
      <h3>风险提示</h3>
      <div class="tag-row">${topic.risks.map((risk) => `<span class="risk">${risk}</span>`).join("")}</div>
    </div>
    <button class="primary-button" data-generate="${topic.id}"><i data-lucide="sparkles"></i>生成短剧选题卡</button>
  `;
  bindDynamicActions();
  createIcons();
}

function renderIdeas() {
  const cards = storyCards.filter((card) => {
    const statusMatch = state.ideaStatus === "全部" || card.status === state.ideaStatus;
    const ownerMatch = state.owner === "全部" || card.owner === state.owner;
    return statusMatch && ownerMatch;
  });
  document.querySelector("#ideaGrid").innerHTML = cards.map(renderIdeaCard).join("");
  bindDynamicActions();
  createIcons();
}

function renderAlerts() {
  const alerts = buildAlerts();
  document.querySelector("#alertList").innerHTML = alerts
    .map(
      (alert) => `
        <article class="alert-item ${alertsRead.has(alert.id) ? "" : "unread"}">
          <span class="alert-icon"><i data-lucide="${alert.icon}"></i></span>
          <div>
            <h3>${alert.title}</h3>
            <p>${alert.body}</p>
          </div>
          <button class="small-action" data-alert-topic="${alert.topicId}">查看</button>
        </article>
      `,
    )
    .join("");
  document.querySelectorAll("[data-alert-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTopicId = button.dataset.alertTopic;
      const alert = alerts.find((item) => item.topicId === selectedTopicId);
      if (alert) alertsRead.add(alert.id);
      writeJSON("radarAlertsRead", [...alertsRead]);
      setView("topics");
      renderAll();
    });
  });
  createIcons();
}

function renderAdmin() {
  const sources = [
    ["小", "小小 API 抖音热榜", "hot_value / 非播放量", settings.sourceUrl === XXAPI_DOUYIN_HOT_URL ? "当前同步源" : "可一键同步"],
    ["热", "DailyHotApi 抖音热榜", "hot_value / 非播放量", settings.sourceUrl === DAILY_HOT_DOUYIN_URL ? "当前同步源" : "备用"],
    ["天", "天聚抖音热搜榜", "hotindex / 需 key", settings.sourceUrl.includes("apis.tianapi.com") ? "当前同步源" : "可手动配置"],
    ["云", "腾讯云自建 API", "推荐代理", "可隐藏 key"],
    ["缓", "云端 API 缓存", "浏览器存储", `${importedTopics.length} 条`],
    ["快", "云端快照库", "浏览器存储", `${topicSnapshots.length} 次快照`],
  ];
  document.querySelector("#sourceList").innerHTML = sources
    .map(
      (source) => `
        <article class="source-item">
          <span class="source-logo">${source[0]}</span>
          <span><strong>${source[1]}</strong><small>${source[2]}</small></span>
          <span class="tag">${source[3]}</span>
        </article>
      `,
    )
    .join("");
}

function renderImportReport() {
  const node = document.querySelector("#importReport");
  if (!node) return;
  if (!latestImportReport) {
    node.innerHTML = `
      <div class="report-grid">
        <div class="report-item"><span>导入状态</span><strong>待导入</strong></div>
        <div class="report-item"><span>云端话题</span><strong>${importedTopics.length}</strong></div>
        <div class="report-item"><span>当前话题</span><strong>${topics.length}</strong></div>
        <div class="report-item"><span>破圈话题</span><strong>${topics.filter(isBreakthrough).length}</strong></div>
      </div>
    `;
    return;
  }
  node.innerHTML = `
    <div class="report-grid">
      <div class="report-item"><span>读取行数</span><strong>${latestImportReport.totalRows}</strong></div>
      <div class="report-item"><span>成功导入</span><strong>${latestImportReport.accepted}</strong></div>
      <div class="report-item"><span>更新/新增</span><strong>${latestImportReport.updated}/${latestImportReport.inserted}</strong></div>
      <div class="report-item"><span>跳过/破圈</span><strong>${latestImportReport.skipped}/${latestImportReport.breakthrough}</strong></div>
    </div>
    ${
      latestImportReport.errors.length
        ? `<div class="analysis-block"><h3>校验提示</h3><p>${latestImportReport.errors.slice(0, 5).join("；")}</p></div>`
        : ""
    }
  `;
}

function renderDataHealth() {
  const node = document.querySelector("#dataHealth");
  if (!node) return;
  const latestSnapshot = topicSnapshots[0];
  const storageBytes = roughStorageBytes();
  node.innerHTML = `
    <div class="health-grid">
      <div class="health-item"><span>数据模式</span><strong>云端 API-only</strong></div>
      <div class="health-item"><span>API缓存占用</span><strong>${formatBytes(storageBytes)}</strong></div>
      <div class="health-item"><span>最近快照</span><strong>${latestSnapshot ? dateFormatter.format(new Date(latestSnapshot.createdAt)) : "暂无"}</strong></div>
      <div class="health-item"><span>收藏话题</span><strong>${favorites.size}</strong></div>
    </div>
  `;
}

function renderSourceStatus() {
  const html = buildSourceStatusHtml();
  const dashboardNode = document.querySelector("#sourceStatus");
  const adminNode = document.querySelector("#adminSourceStatus");
  if (dashboardNode) dashboardNode.innerHTML = html;
  if (adminNode) adminNode.innerHTML = html;
  const urlInput = document.querySelector("#dataSourceUrl");
  const kindInput = document.querySelector("#dataSourceKind");
  const autoInput = document.querySelector("#autoSyncSource");
  if (urlInput && urlInput.value !== settings.sourceUrl) urlInput.value = settings.sourceUrl;
  if (kindInput && kindInput.value !== settings.sourceKind) kindInput.value = settings.sourceKind;
  if (autoInput) autoInput.checked = settings.autoSyncSource;
}

function buildSourceStatusHtml() {
  const status = dataSourceStatus || {
    state: settings.sourceUrl ? "idle" : "empty",
    message: settings.sourceUrl ? "等待同步" : "未配置数据源",
    updatedAt: "",
    sourceUrl: settings.sourceUrl,
    usingCache: importedTopics.length > 0,
  };
  const className =
    status.state === "success" ? "status-ok" : status.state === "failed" ? "status-error" : status.usingCache ? "status-warn" : "";
  return `
    <div class="status-item ${className}"><span>同步状态</span><strong>${status.message || "等待同步"}</strong></div>
    <div class="status-item"><span>数据源</span><strong>${status.sourceUrl || settings.sourceUrl || "未配置"}</strong></div>
    <div class="status-item"><span>最近同步</span><strong>${status.updatedAt ? dateFormatter.format(new Date(status.updatedAt)) : "暂无"}</strong></div>
    <div class="status-item ${status.usingCache ? "status-warn" : ""}"><span>API缓存</span><strong>${status.usingCache ? "可用" : "未使用"}</strong></div>
  `;
}

function renderImportHistory() {
  const node = document.querySelector("#importHistory");
  if (!node) return;
  if (importHistory.length === 0) {
    node.innerHTML = `<div class="history-item"><div><strong>暂无同步记录</strong><p>同步云端 API 后会自动生成记录。</p></div><span class="tag">empty</span></div>`;
    return;
  }
  node.innerHTML = importHistory
    .slice(0, 8)
    .map(
      (item) => `
        <article class="history-item">
          <div>
            <strong>${item.sourceName}</strong>
            <p>${dateFormatter.format(new Date(item.createdAt))} · 读取 ${item.totalRows} 行 · 导入 ${item.accepted} · 新增 ${item.inserted} · 更新 ${item.updated} · 跳过 ${item.skipped}</p>
          </div>
          <span class="tag">${item.breakthrough} 破圈</span>
        </article>
      `,
    )
    .join("");
}

function renderTopicCard(topic) {
  return `
    <article class="topic-card">
      <div class="topic-card-header">
        <h3 class="topic-title">${topic.title}</h3>
        <button class="small-action ${favorites.has(topic.id) ? "favorite-on" : ""}" data-fav="${topic.id}">
          ${favorites.has(topic.id) ? "已收藏" : "收藏"}
        </button>
      </div>
      <div class="badge-row">${renderBreakBadge(topic)}<span class="badge">${topic.category}</span></div>
      ${renderSparkline(topic.trend)}
      <div class="topic-stats">
        <div><span>话题度/播放量</span><strong>${formatPlay(topic.playCount)}</strong></div>
        <div><span>影响力</span><strong>${yuan.format(topic.influenceIndex)}</strong></div>
        <div><span>排名</span><strong>#${topic.rank}</strong></div>
      </div>
      <div class="tag-row">${topic.tags.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    </article>
  `;
}

function renderIdeaCard(card) {
  return `
    <article class="idea-card">
      <div>
        <div class="badge-row"><span class="badge">${card.genre}</span><span class="badge index">${card.status}</span></div>
        <h3>${card.title}</h3>
        <p>${card.logline}</p>
      </div>
      <div class="idea-meta">
        <div><span>受众</span><strong>${card.audience}</strong></div>
        <div><span>负责人</span><strong>${card.owner}</strong></div>
        <div><span>来源话题</span><strong>${card.topicTitle}</strong></div>
        <div><span>生成时间</span><strong>${dateFormatter.format(new Date(card.createdAt))}</strong></div>
      </div>
      <p><strong>前三集钩子：</strong>${card.hooks.join(" / ")}</p>
      <div class="tag-row">${card.risks.map((risk) => `<span class="risk">${risk}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="small-action" data-status="${card.id}" data-next="已通过">通过</button>
        <button class="small-action" data-status="${card.id}" data-next="需修改">需修改</button>
      </div>
    </article>
  `;
}

function filterTopics() {
  const keywords = getQueryTokens(state.keyword);
  const expandedTerms = expandSearchTerms(keywords, state.category);
  return topics
    .filter((topic) => {
      const haystack = getTopicHaystack(topic);
      const keywordMatch =
        keywords.length === 0 ||
        keywords.every((keyword) => haystack.includes(keyword)) ||
        expandedTerms.some((term) => haystack.includes(term));
    const categoryMatch = state.category === "全部" || topic.category === state.category;
    const platformMatch = state.platform === "全部" || topic.platform === state.platform;
    const heatMatch =
      state.heat === "全部" ||
      (state.heat === "破圈" && isBreakthrough(topic)) ||
      (state.heat === "高热度" && topic.heat >= 85000) ||
      (state.heat === "中热度" && topic.heat >= 70000 && topic.heat < 85000);
    const timeMatch =
      state.time === "全部" ||
      (state.time === "24小时内" && topic.firstSeenDays <= 1) ||
      (state.time === "3天内" && topic.firstSeenDays <= 3) ||
      (state.time === "7天内" && topic.firstSeenDays <= 7);
    const breakMatch = !state.breakthroughOnly || isBreakthrough(topic);
    const favMatch = !state.favoriteOnly || favorites.has(topic.id);
    return keywordMatch && categoryMatch && platformMatch && heatMatch && timeMatch && breakMatch && favMatch;
    })
    .sort((a, b) => scoreTopicForSearch(b, keywords, expandedTerms) - scoreTopicForSearch(a, keywords, expandedTerms));
}

function renderAssociationBoard(results) {
  const board = document.querySelector("#associationBoard");
  const queryText = state.keyword || (state.category !== "全部" ? state.category : "");
  if (!queryText) {
    board.innerHTML = "";
    return;
  }
  const tokens = getQueryTokens(queryText);
  const intent = detectIntent(tokens, state.category);
  const chips = buildAssociationTerms(results, intent, tokens).slice(0, 12);
  const topTopics = results.slice(0, 5);
  board.innerHTML = `
    <div class="association-header">
      <div>
        <strong>联想搜索榜单${intent ? ` · ${intent.name}` : ""}</strong>
        <span>按相关性、热度和榜单排名重排</span>
      </div>
      <button class="small-action" id="useTianApiShortcut" type="button"><i data-lucide="key-round"></i>天聚接口</button>
    </div>
    <div class="association-chips">
      ${chips.map((term) => `<button class="assoc-chip" data-assoc-term="${term}">${term}</button>`).join("")}
    </div>
    <div class="association-rank">
      ${topTopics
        .map(
          (topic, index) => `
            <button class="assoc-rank-item" data-topic="${topic.id}">
              <span>${index + 1}</span>
              <strong>${topic.title}</strong>
              <small>${topic.category} · ${topic.sourceAuth}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
  board.querySelectorAll("[data-assoc-term]").forEach((button) => {
    button.addEventListener("click", () => {
      state.keyword = button.dataset.assocTerm;
      document.querySelector("#globalSearch").value = state.keyword;
      document.querySelector("#dashboardSearch").value = state.keyword;
      document.querySelector("#keywordFilter").value = state.keyword;
      renderTopics();
    });
  });
  board.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTopicId = button.dataset.topic;
      renderTopics();
    });
  });
  board.querySelector("#useTianApiShortcut").addEventListener("click", () => {
    setView("admin");
    document.querySelector("#tianApiKey").focus();
  });
  createIcons();
}

function getTopicHaystack(topic) {
  return normalizeSearchText([
    topic.title,
    topic.category,
    topic.sentiment,
    topic.opportunity,
    ...topic.tags,
    ...topic.related,
    ...topic.videos,
  ].join(" "));
}

function getQueryTokens(value) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[，,、|/]+/g, " ").replace(/\s+/g, " ").trim();
}

function detectIntent(tokens, category = "全部") {
  const query = normalizeSearchText([...tokens, category === "全部" ? "" : category].join(" "));
  return intentLexicon.find((intent) => intent.terms.some((term) => query.includes(term.toLowerCase()))) || null;
}

function expandSearchTerms(tokens, category = "全部") {
  const intent = detectIntent(tokens, category);
  return [...new Set([...(intent?.terms || []), ...tokens, category !== "全部" ? category : ""])].map(normalizeSearchText).filter(Boolean);
}

function scoreTopicForSearch(topic, keywords, expandedTerms) {
  const title = normalizeSearchText(topic.title);
  const category = normalizeSearchText(topic.category);
  const tags = normalizeSearchText(topic.tags.join(" "));
  const haystack = getTopicHaystack(topic);
  let score = 0;
  keywords.forEach((keyword) => {
    if (title === keyword) score += 900;
    else if (title.includes(keyword)) score += 520;
    if (tags.includes(keyword)) score += 180;
    if (category.includes(keyword)) score += 220;
  });
  expandedTerms.forEach((term) => {
    if (title.includes(term)) score += 120;
    else if (haystack.includes(term)) score += 45;
  });
  score += Math.min(topic.influenceIndex || topic.heat || 0, 20000000) / 50000;
  score += Math.max(0, 80 - (topic.rank || 80));
  if (isBreakthrough(topic)) score += 120;
  return score;
}

function buildAssociationTerms(results, intent, tokens) {
  const counts = new Map();
  const seedTerms = [...(intent?.terms || []), ...tokens].filter(Boolean);
  seedTerms.forEach((term) => counts.set(term, (counts.get(term) || 0) + 8));
  results.slice(0, 80).forEach((topic) => {
    [topic.category, ...topic.tags, ...topic.related].forEach((term) => {
      const normalized = String(term || "").trim();
      if (!normalized || normalized.startsWith("http")) return;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([term]) => term);
}

function isBreakthrough(topic) {
  if (typeof topic.playCount === "number") return topic.playCount >= settings.playThreshold;
  return topic.influenceIndex >= settings.heatThreshold;
}

function renderBreakBadge(topic) {
  if (!isBreakthrough(topic)) return `<span class="badge">观察</span>`;
  if (typeof topic.playCount === "number") return `<span class="badge break">话题度破圈</span>`;
  return `<span class="badge index">指数破圈</span>`;
}

function formatPlay(value) {
  if (typeof value !== "number") return "无播放量";
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  return `${Math.round(value / 10000)}万`;
}

function renderSparkline(values) {
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 52 - (value / 100) * 44;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `
    <svg class="sparkline" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="0,52 100,52" fill="none" stroke="#e3dccf" stroke-width="1" />
      <polyline points="${points}" fill="none" stroke="#1d7f77" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function buildAngles(topic) {
  const base = {
    动漫: ["把角色黑化动机移植到都市身份压迫，做女性复仇线。", "用师徒、替身、背叛关系承接粉丝熟悉的爽点。", "保留高燃反杀节奏，避开具体 IP 设定。"],
    游戏: ["把游戏规则改成现实职场或家庭规则，降低理解门槛。", "主角获得系统权限，前三集连续验证能力。", "用队友背叛和副本反杀建立强钩子。"],
    影视: ["抓住反转结构，不复刻原片人物和桥段。", "每集释放一个新证据，驱动评论区猜测。", "把怀旧情绪转成亲情或爱情遗憾。"],
    二次元: ["把陪伴感落到现实孤独与成长选择。", "用虚拟身份和真实关系错位制造甜虐。", "让粉丝共创成为剧情推动力。"],
  };
  return base[topic.category] || ["强化身份落差与第一集反转。", "把评论区共鸣转为主角的具体困境。", "保留热点情绪，重新设计人物与事件。"];
}

function generateCard(topic) {
  const existing = storyCards.find((card) => card.topicId === topic.id);
  if (existing) return existing;
  const card = {
    id: `idea-${topic.id}`,
    topicId: topic.id,
    topicTitle: topic.title,
    title: `${topic.title}：短剧选题卡`,
    genre: topic.category,
    audience: pickAudience(topic.category),
    owner: "未分配",
    status: "待评审",
    logline: topic.opportunity,
    conflict: buildAngles(topic)[0],
    hooks: buildHooks(topic),
    risks: topic.risks,
    source: topic.source,
    createdAt: new Date().toISOString(),
  };
  storyCards = [card, ...storyCards];
  writeJSON("radarStoryCards", storyCards);
  return card;
}

function pickAudience(category) {
  const map = {
    动漫: "18-30 女性向爽感用户",
    游戏: "18-35 游戏与男频用户",
    影视: "20-40 悬疑反转用户",
    二次元: "16-28 二次元陪伴感用户",
    "恋爱婚姻": "24-45 女频短剧用户",
    家庭伦理: "25-50 家庭情感用户",
    逆袭复仇: "18-40 男频爽剧用户",
  };
  return map[category] || "短剧高频用户";
}

function buildHooks(topic) {
  return [
    `第1集：${topic.tags[0]}场景里主角被迫承受羞辱或误解`,
    `第2集：${topic.tags[1] || topic.category}能力/真相出现第一次验证`,
    `第3集：借${topic.related[0]}完成首次反击并留下更大谜团`,
  ];
}

function seedStoryCards() {
  return [];
}

function buildAlerts() {
  return topics
    .filter(isBreakthrough)
    .sort((a, b) => b.rankChange - a.rankChange)
    .slice(0, 8)
    .map((topic) => ({
      id: `alert-${topic.id}-${settings.playThreshold}-${settings.heatThreshold}`,
      topicId: topic.id,
      icon: typeof topic.playCount === "number" ? "flame" : "activity",
      title: `${topic.title} 达到${typeof topic.playCount === "number" ? "话题度/播放量" : "影响力指数"}破圈`,
      body: `${topic.category} · ${formatPlay(topic.playCount)} · 影响力 ${yuan.format(topic.influenceIndex)} · 排名提升 +${topic.rankChange}`,
    }));
}

function saveSourceSettings() {
  settings.sourceUrl = migrateCloudSourceUrl(document.querySelector("#dataSourceUrl").value.trim());
  settings.sourceKind = isKnownDouyinHotApi(settings.sourceUrl) ? "json" : document.querySelector("#dataSourceKind").value;
  settings.autoSyncSource = document.querySelector("#autoSyncSource").checked;
  settings.tianApiKey = document.querySelector("#tianApiKey").value.trim();
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind;
  writeJSON("radarSettings", settings);
  renderSourceStatus();
  toast("数据源配置已保存。");
}

function syncDailyHotDouyin() {
  settings.sourceUrl = XXAPI_DOUYIN_HOT_URL;
  settings.sourceKind = "json";
  settings.autoSyncSource = true;
  writeJSON("radarSettings", settings);
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind;
  document.querySelector("#autoSyncSource").checked = true;
  syncConfiguredSource("小小 API 抖音热榜");
}

function syncTianApiHot() {
  const key = document.querySelector("#tianApiKey").value.trim();
  if (!key) {
    toast("请先填写天聚 API Key。");
    setView("admin");
    return;
  }
  settings.tianApiKey = key;
  settings.sourceUrl = buildTianApiUrl(key);
  settings.sourceKind = "json";
  settings.autoSyncSource = true;
  writeJSON("radarSettings", settings);
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind;
  document.querySelector("#autoSyncSource").checked = true;
  syncConfiguredSource("天聚数据抖音热搜榜");
}

function buildTianApiUrl(key) {
  const url = new URL(TIANAPI_DOUYIN_HOT_URL);
  url.searchParams.set("key", key);
  return url.toString();
}

function migrateCloudSourceUrl(url) {
  if (!url || url === "./data/topics.csv" || url === "./data/douyin-topics.csv" || url === DAILY_HOT_DOUYIN_URL) return XXAPI_DOUYIN_HOT_URL;
  return isCloudApiSource(url) ? url : "";
}

function isCloudApiSource(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

function isKnownDouyinHotApi(url) {
  const sourceUrl = String(url || "");
  return (
    sourceUrl.includes("api-hot.imsyy.top/douyin") ||
    sourceUrl.includes("v2.xxapi.cn/api/douyinhot") ||
    sourceUrl.includes("apis.tianapi.com/douyinhot")
  );
}

function isCloudApiTopic(topic) {
  return isCloudApiSource(topic?.sourceUrl) || /API|Api|api|热榜|热搜/.test(`${topic?.source || ""} ${topic?.sourceAuth || ""}`);
}

async function syncConfiguredSource(reason, options = {}) {
  saveSourceSettingsWithoutToast();
  settings.sourceUrl = migrateCloudSourceUrl(settings.sourceUrl);
  if (isKnownDouyinHotApi(settings.sourceUrl)) settings.sourceKind = "json";
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind || "json";
  if (!isCloudApiSource(settings.sourceUrl)) {
    dataSourceStatus = {
      state: "failed",
      message: "仅支持云端 API URL",
      sourceUrl: settings.sourceUrl,
      updatedAt: new Date().toISOString(),
      usingCache: importedTopics.length > 0,
    };
    writeJSON("radarDataSourceStatus", dataSourceStatus);
    renderSourceStatus();
    if (!options.silent) toast("请填写 http(s) 云端 API 地址。");
    return null;
  }
  if (!settings.sourceUrl) {
    dataSourceStatus = {
      state: "idle",
      message: "未配置公开数据源 URL",
      sourceUrl: "",
      updatedAt: new Date().toISOString(),
      usingCache: importedTopics.length > 0,
    };
    writeJSON("radarDataSourceStatus", dataSourceStatus);
    renderSourceStatus();
    if (!options.silent) toast("请先填写公开 CSV 或网页表格 URL。");
    return null;
  }

  dataSourceStatus = {
    state: "syncing",
    message: "正在同步数据源",
    sourceUrl: settings.sourceUrl,
    updatedAt: new Date().toISOString(),
    usingCache: importedTopics.length > 0,
  };
  writeJSON("radarDataSourceStatus", dataSourceStatus);
  renderSourceStatus();

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    const response = await fetch(settings.sourceUrl, { cache: "no-store", signal: controller.signal }).finally(() =>
      window.clearTimeout(timeoutId),
    );
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const rows = parseSourceText(text, settings.sourceKind, settings.sourceUrl, contentType);
    if (rows.length === 0) throw new Error("数据源没有解析出有效行，请检查 CSV 表头或网页表格。");
    const report = importZoneRows(rows, reason, { sourceUrl: settings.sourceUrl });
    dataSourceStatus = {
      state: "success",
      message: `同步成功，导入 ${report.accepted} 条`,
      sourceUrl: settings.sourceUrl,
      updatedAt: new Date().toISOString(),
      accepted: report.accepted,
      skipped: report.skipped,
      breakthrough: report.breakthrough,
      usingCache: false,
    };
    writeJSON("radarDataSourceStatus", dataSourceStatus);
    renderAll();
    if (!options.silent) toast(`已同步数据源：${report.accepted} 条话题。`);
    return report;
  } catch (error) {
    dataSourceStatus = {
      state: "failed",
      message: `同步失败：${error.name === "AbortError" ? "请求超时" : error.message || "未知错误"}`,
      sourceUrl: settings.sourceUrl,
      updatedAt: new Date().toISOString(),
      usingCache: importedTopics.length > 0,
    };
    writeJSON("radarDataSourceStatus", dataSourceStatus);
    renderSourceStatus();
    if (!options.silent) toast(`同步失败，${importedTopics.length ? "已继续使用缓存。" : "暂无缓存可用。"}`);
    return null;
  }
}

function saveSourceSettingsWithoutToast() {
  settings.sourceUrl = migrateCloudSourceUrl(document.querySelector("#dataSourceUrl").value.trim());
  settings.sourceKind = isKnownDouyinHotApi(settings.sourceUrl) ? "json" : document.querySelector("#dataSourceKind").value;
  settings.autoSyncSource = document.querySelector("#autoSyncSource").checked;
  settings.tianApiKey = document.querySelector("#tianApiKey").value.trim();
  document.querySelector("#dataSourceUrl").value = settings.sourceUrl;
  document.querySelector("#dataSourceKind").value = settings.sourceKind;
  writeJSON("radarSettings", settings);
}

function parseSourceText(text, kind, url, contentType) {
  const resolved = resolveSourceKind(text, kind, url, contentType);
  if (resolved === "json") return parseZoneJSON(text, url);
  if (resolved === "html") return parseZoneHTML(text);
  return parseZoneCSV(text);
}

function resolveSourceKind(text, kind, url, contentType) {
  if (kind && kind !== "auto") return kind;
  const lowerUrl = (url || "").toLowerCase();
  const lowerType = (contentType || "").toLowerCase();
  const sample = String(text || "").trim().slice(0, 200).toLowerCase();
  if (lowerType.includes("json") || lowerUrl.endsWith(".json") || sample.startsWith("{") || sample.startsWith("[")) return "json";
  if (lowerType.includes("html") || lowerUrl.endsWith(".html") || sample.includes("<table") || sample.includes("<html")) return "html";
  return "csv";
}

function buildTopicCollection() {
  settings.useSampleData = false;
  return importedTopics.filter(isCloudApiTopic);
}

function getCategoryOptions() {
  const dataCategories = topics
    .map((topic) => topic.category)
    .filter(Boolean)
    .filter((category) => category !== "全部");
  return ["全部", ...new Set([...defaultCategories.filter((category) => category !== "全部"), ...dataCategories])];
}

function getPlatformOptions() {
  const dataPlatforms = topics
    .map((topic) => topic.platform)
    .filter(Boolean)
    .filter((platform) => platform !== "全部");
  return ["全部", ...new Set(["抖音", ...dataPlatforms])];
}

function importZoneText(raw, sourceName) {
  const rows = parseZoneRows(raw);
  return importZoneRows(rows, sourceName);
}

function importZoneRows(rows, sourceName, meta = {}) {
  if (!isCloudApiSource(meta.sourceUrl)) {
    throw new Error("当前为云端 API-only 模式，已拒绝本地/手动导入数据。");
  }
  const errors = [];
  const normalized = rows
    .map((row, index) => {
      const topic = normalizeZoneRow(row, index);
      if (!topic) errors.push(`第 ${index + 1} 行缺少标题，已跳过`);
      return topic
        ? {
            ...topic,
            sourceUrl: meta.sourceUrl || topic.sourceUrl || "",
          }
        : topic;
    })
    .filter(Boolean);
  const mergeResult = mergeImportedTopicsDetailed(importedTopics, normalized);
  importedTopics = mergeResult.topics;
  topics = buildTopicCollection();
  const report = {
    sourceName,
    totalRows: rows.length,
    accepted: normalized.length,
    inserted: mergeResult.inserted,
    updated: mergeResult.updated,
    skipped: rows.length - normalized.length,
    breakthrough: normalized.filter(isBreakthrough).length,
    errors,
    createdAt: new Date().toISOString(),
  };
  latestImportReport = report;
  importHistory = [report, ...importHistory].slice(0, 30);
  writeJSON("radarImportedTopics", importedTopics);
  writeJSON("radarImportHistory", importHistory);
  writeJSON("radarLatestImportReport", latestImportReport);
  createDailySnapshot(`导入：${sourceName}`);
  return report;
}

function parseZoneRows(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];
  if (text.startsWith("[") || text.startsWith("{")) return parseZoneJSON(text);
  if (/<table[\s>]|<html[\s>]|<tbody[\s>]/i.test(text)) return parseZoneHTML(text);
  return parseZoneCSV(text);
}

function parseZoneImport(raw) {
  return parseZoneRows(raw).map(normalizeZoneRow).filter(Boolean);
}

function parseZoneJSON(text, url = "") {
  const value = JSON.parse(text);
  if (isDouyinHotPayload(value, url)) return normalizeDouyinHotRows(value, url);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.topics)) return value.topics;
  if (Array.isArray(value.data)) return value.data;
  return [value];
}

function isDouyinHotPayload(value, url = "") {
  const sourceUrl = String(url);
  const items = extractDouyinHotItems(value);
  return (
    items.length > 0 &&
    (sourceUrl.includes("api-hot.imsyy.top/douyin") ||
      sourceUrl.includes("v2.xxapi.cn/api/douyinhot") ||
      sourceUrl.includes("apis.tianapi.com/douyinhot") ||
      value?.name === "douyin" ||
      items.some((item) => item.word || item.hot_value || item.hotindex || item.sentence_id))
  );
}

function extractDouyinHotItems(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.result?.list)) return value.result.list;
  if (Array.isArray(value?.result?.data)) return value.result.data;
  if (Array.isArray(value?.result?.newslist)) return value.result.newslist;
  if (Array.isArray(value?.newslist)) return value.newslist;
  return [];
}

function normalizeDouyinHotRows(payload, url = "") {
  const collectedAt = new Date().toISOString();
  const provider = resolveDouyinHotProvider(payload, url);
  return extractDouyinHotItems(payload).map((item, index) => {
    const hotValue = normalizeNumber(item.hot ?? item.hot_value ?? item.hotindex ?? item.heat ?? item.score ?? 0) || 0;
    const title = item.title || item.word || item.name || item.keyword || `抖音热榜 ${index + 1}`;
    const rank = normalizeNumber(item.position ?? item.rank ?? item.index) || index + 1;
    const hotUrl =
      item.url ||
      item.mobileUrl ||
      item.share_url ||
      item.link ||
      (item.sentence_id ? `https://www.douyin.com/hot/${item.sentence_id}` : "");
    const eventTime = normalizeNumber(item.event_time ?? item.eventTime ?? item.timestamp ?? 0);
    const rowCollectedAt = eventTime
      ? new Date(eventTime < 10000000000 ? eventTime * 1000 : eventTime).toISOString()
      : collectedAt;
    return {
      title,
      platform: "抖音",
      category: "抖音热榜",
      tags: ["抖音热榜", provider.tag, provider.metric, item.label ? `label:${item.label}` : "", payload.type || "热榜"].filter(Boolean).join("|"),
      heat: hotValue,
      playCount: "",
      influenceIndex: hotValue,
      rank,
      rankChange: 0,
      source: provider.source,
      sourceAuth: provider.sourceAuth,
      collectedAt: rowCollectedAt,
      firstSeenDays: 1,
      sentiment: `${provider.name}条目，仅表示热榜热度，不代表话题播放量。`,
      opportunity: "可作为当天热点发现入口；若要判断破圈话题度，需要再接入授权云端 API 或腾讯云补充接口获取播放量。",
      related: [hotUrl, item.word_cover?.url_list?.[0]].filter(Boolean).join("|"),
      videos: [hotUrl].filter(Boolean).join("|"),
      risks: `非播放量口径|${provider.risk}|需复核来源稳定性`,
    };
  });
}

function resolveDouyinHotProvider(payload, url = "") {
  const sourceUrl = String(url);
  if (sourceUrl.includes("v2.xxapi.cn/api/douyinhot")) {
    return {
      name: "小小 API 抖音热榜",
      tag: "XXAPI",
      metric: "hot_value",
      source: "小小 API / 抖音热榜",
      sourceAuth: "小小 API 抖音热榜 hot_value / 非播放量口径",
      risk: "第三方聚合接口",
    };
  }
  if (sourceUrl.includes("apis.tianapi.com/douyinhot")) {
    return {
      name: "天聚数据抖音热搜榜",
      tag: "TianAPI",
      metric: "hotindex",
      source: "天聚数据 / 抖音热搜榜",
      sourceAuth: "天聚数据抖音热搜榜 hotindex / 非播放量口径",
      risk: "第三方付费接口",
    };
  }
  if (payload?.name === "douyin" || sourceUrl.includes("api-hot.imsyy.top/douyin")) {
    return {
      name: "DailyHotApi 抖音热榜",
      tag: "DailyHotApi",
      metric: "hot_value",
      source: "DailyHotApi / 抖音热点榜",
      sourceAuth: "DailyHotApi 抖音热榜 hot_value / 非播放量口径",
      risk: "第三方聚合接口",
    };
  }
  return {
    name: "抖音热榜 API",
    tag: "DouyinHotAPI",
    metric: "hot_value",
    source: "抖音热榜 API",
    sourceAuth: "抖音热榜 API 热度字段 / 非播放量口径",
    risk: "第三方接口",
  };
}

function parseZoneCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitDelimitedLine(lines[0], delimiter).map((item) => item.replace(/^\uFEFF/, "").trim());
  return lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function splitCSVLine(line) {
  return splitDelimitedLine(line, ",");
}

function detectDelimiter(headerLine) {
  if (headerLine.includes("\t")) return "\t";
  if (headerLine.includes("|") && !headerLine.includes(",")) return "|";
  return ",";
}

function splitDelimitedLine(line, delimiter) {
  if (delimiter !== ",") return line.split(delimiter).map((cell) => cell.trim());
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseZoneHTML(text) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  const tables = Array.from(doc.querySelectorAll("table"));
  if (tables.length === 0) return parseLooseTableText(doc.body?.innerText || text);
  const table = tables
    .map((candidate) => ({
      candidate,
      rows: Array.from(candidate.querySelectorAll("tr")),
    }))
    .sort((a, b) => b.rows.length - a.rows.length)[0];
  if (!table || table.rows.length < 2) return [];
  const matrix = table.rows
    .map((row) => Array.from(row.querySelectorAll("th,td")).map((cell) => cell.textContent.trim()))
    .filter((row) => row.some(Boolean));
  if (matrix.length < 2) return [];
  const headers = matrix[0];
  return matrix.slice(1).map((values) =>
    headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {}),
  );
}

function parseLooseTableText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  return parseZoneCSV(lines.join("\n"));
}

function normalizeZoneRow(row, index) {
  const title = readField(row, ["title", "topic", "name", "标题", "话题", "话题名", "关键词"]);
  if (!title) return null;
  const category = readField(row, ["category", "type", "分类", "题材", "品类"]) || inferCategory(title, row);
  const tags = normalizeTags(readField(row, ["tags", "tag", "标签", "关键词标签", "相关标签"]));
  const heat = normalizeNumber(readField(row, ["heat", "hot", "score", "热度", "热度值", "当前热度"])) || 70000;
  const playCount = normalizeNumber(readField(row, ["playCount", "play_count", "plays", "播放量", "话题播放量"]));
  const influenceIndex =
    normalizeNumber(readField(row, ["influenceIndex", "influence_index", "index", "影响力指数", "指数"])) || heat;
  const rank = normalizeNumber(readField(row, ["rank", "排名", "榜单排名"])) || index + 1;
  const rankChange = normalizeNumber(readField(row, ["rankChange", "rank_change", "排名变化", "上升名次"])) || 0;
  const collectedAt = readField(row, ["collectedAt", "collected_at", "采集时间", "导出时间"]) || new Date().toISOString();
  const source = readField(row, ["source", "来源", "数据来源"]) || "云端 API";
  const sourceAuth = readField(row, ["sourceAuth", "source_auth", "授权状态", "数据口径"]) || "云端 API 热度口径";
  const isInternalBank = sourceAuth.includes("非热度口径");
  const id = `zone-${stableSlug(title)}-${Date.now()}-${index}`;
  return {
    id,
    title,
    platform: readField(row, ["platform", "平台"]) || "抖音",
    category,
    tags: tags.length ? tags : [category, "云端API"],
    heat,
    playCount: playCount || null,
    influenceIndex,
    rank,
    rankChange,
    source,
    sourceAuth,
    collectedAt,
    firstSeenDays: normalizeNumber(readField(row, ["firstSeenDays", "出现天数", "首见天数"])) || 1,
    trend: buildImportedTrend(heat, rankChange),
    sentiment:
      readField(row, ["sentiment", "情绪摘要", "用户情绪"]) ||
      (isInternalBank ? "云端 API 未提供用户情绪字段。" : "云端 API 话题，建议结合评论样本补充用户情绪、争议点和共鸣关键词。"),
    opportunity:
      readField(row, ["opportunity", "改编机会", "短剧机会"]) ||
      (isInternalBank ? "可作为云端热榜线索，真实播放量需用授权数据复核。" : `可围绕「${title}」提炼身份落差、强冲突和前三集反转，生成短剧选题卡后再细化人物关系。`),
    related: normalizeTopicList(readField(row, ["related", "相关话题", "话题簇"])).slice(0, 4),
    videos: normalizeTopicList(readField(row, ["videos", "代表内容", "代表视频"])).slice(0, 4),
    risks: normalizeTags(readField(row, ["risks", "风险", "风险提示"])).slice(0, 4),
  };
}

function readField(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== "") return row[name];
  }
  return "";
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(/[、,，|/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTopicList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  const text = String(value || "");
  if (/https?:\/\//i.test(text)) {
    return text
      .split(/[、,，|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return normalizeTags(value);
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const text = String(value).replace(/,/g, "").trim();
  const numeric = Number.parseFloat(text);
  if (Number.isNaN(numeric)) return null;
  if (text.includes("亿")) return Math.round(numeric * 100000000);
  if (text.includes("万")) return Math.round(numeric * 10000);
  return numeric;
}

function inferCategory(title, row) {
  const text = `${title} ${Object.values(row).join(" ")}`;
  const matched = getCategoryOptions().find((category) => category !== "全部" && text.includes(category));
  return matched || "社会情绪";
}

function stableSlug(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function buildImportedTrend(heat, rankChange) {
  const end = Math.max(20, Math.min(96, Math.round(heat / 1000)));
  const lift = Math.max(8, Math.min(32, rankChange || 12));
  return Array.from({ length: 7 }, (_, index) => Math.max(10, Math.round(end - lift + (lift / 6) * index)));
}

function mergeImportedTopics(existing, incoming) {
  const map = new Map(existing.map((topic) => [`${topic.title}::${topic.category}`, topic]));
  incoming.forEach((topic) => {
    map.set(`${topic.title}::${topic.category}`, topic);
  });
  return [...map.values()];
}

function mergeImportedTopicsDetailed(existing, incoming) {
  const map = new Map(existing.map((topic) => [`${topic.title}::${topic.category}`, topic]));
  let inserted = 0;
  let updated = 0;
  incoming.forEach((topic) => {
    const key = `${topic.title}::${topic.category}`;
    const previous = map.get(key);
    if (previous) {
      updated += 1;
      map.set(key, {
        ...previous,
        ...topic,
        id: previous.id,
        importedAt: new Date().toISOString(),
      });
    } else {
      inserted += 1;
      map.set(key, {
        ...topic,
        importedAt: new Date().toISOString(),
      });
    }
  });
  return { topics: [...map.values()], inserted, updated };
}

function createDailySnapshot(reason) {
  const snapshot = {
    id: `snapshot-${Date.now()}`,
    reason,
    createdAt: new Date().toISOString(),
    totals: {
      all: topics.length,
      imported: importedTopics.length,
      sample: settings.useSampleData ? baseTopics.length : 0,
      breakthrough: topics.filter(isBreakthrough).length,
      snapshotItems: Math.min(topics.length, 1000),
    },
    topics: topics.slice(0, 1000).map((topic) => ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      heat: topic.heat,
      playCount: topic.playCount,
      influenceIndex: topic.influenceIndex,
      rank: topic.rank,
      rankChange: topic.rankChange,
      collectedAt: topic.collectedAt,
    })),
  };
  topicSnapshots = [snapshot, ...topicSnapshots].slice(0, 30);
  writeJSON("radarTopicSnapshots", topicSnapshots);
  return snapshot;
}

function downloadImportTemplate() {
  const csv = [
    "title,category,heat,playCount,influenceIndex,rank,rankChange,tags,sentiment,opportunity,risks",
    "\"国漫复仇新话题\",动漫,92000,5.6亿,91000,3,19,\"国漫,复仇,女强\",\"评论区集中讨论反击和成长\",\"可改编为女主觉醒复仇短剧\",\"版权/IP,暴力尺度\"",
  ].join("\n");
  downloadText(`topic-import-template-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
}

function exportTopics(format) {
  const rows = topics.map(serializeTopic);
  if (format === "csv") {
    const headers = Object.keys(rows[0] || serializeTopic({}));
    const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
    downloadText(`topics-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
    toast("话题 CSV 已导出。");
    return;
  }
  downloadText(
    `topics-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(rows, null, 2),
    "application/json;charset=utf-8",
  );
  toast("话题 JSON 已导出。");
}

function serializeTopic(topic) {
  return {
    title: topic.title || "",
    platform: topic.platform || "",
    category: topic.category || "",
    tags: Array.isArray(topic.tags) ? topic.tags.join("|") : "",
    heat: topic.heat || 0,
    playCount: topic.playCount || "",
    influenceIndex: topic.influenceIndex || 0,
    rank: topic.rank || "",
    rankChange: topic.rankChange || 0,
    source: topic.source || "",
    sourceAuth: topic.sourceAuth || "",
    collectedAt: topic.collectedAt || "",
    sentiment: topic.sentiment || "",
    opportunity: topic.opportunity || "",
    risks: Array.isArray(topic.risks) ? topic.risks.join("|") : "",
  };
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function roughStorageBytes() {
  return [
    "radarImportedTopics",
    "radarImportHistory",
    "radarTopicSnapshots",
    "radarStoryCards",
    "radarSettings",
    "radarFavorites",
  ].reduce((total, key) => total + (localStorage.getItem(key) || "").length * 2, 0);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function bindDynamicActions() {
  document.querySelectorAll("[data-fav]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.fav;
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      writeJSON("radarFavorites", [...favorites]);
      renderAll();
      toast(favorites.has(id) ? "已收藏该话题。" : "已取消收藏。");
    });
  });

  document.querySelectorAll("[data-generate]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const topic = topics.find((item) => item.id === button.dataset.generate);
      const card = generateCard(topic);
      setView("ideas");
      renderAll();
      toast(`已生成选题卡：${card.title}`);
    });
  });

  document.querySelectorAll("[data-status]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const card = storyCards.find((item) => item.id === button.dataset.status);
      if (card) {
        card.status = button.dataset.next;
        writeJSON("radarStoryCards", storyCards);
        renderAll();
        toast(`选题卡状态已更新为「${card.status}」。`);
      }
    });
  });
}

function exportIdeas() {
  const data = JSON.stringify(storyCards, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `story-idea-cards-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("选题卡 JSON 已导出。");
}

function fillSelect(id, values) {
  document.querySelector(`#${id}`).innerHTML = values.map((value) => `<option>${value}</option>`).join("");
}

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value && value.length > 2500000) {
      localStorage.removeItem(key);
      return fallback;
    }
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > 2500000) {
      localStorage.removeItem(key);
      console.warn(`本地缓存过大，已跳过写入：${key}`);
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`本地缓存写入失败：${key}`, error);
  }
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 2600);
}

function createIcons() {
  if (window.lucide) window.lucide.createIcons();
}
