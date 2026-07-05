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
};

const categories = [
  "全部",
  "动漫",
  "游戏",
  "影视",
  "二次元",
  "明星/IP",
  "社会情绪",
  "恋爱婚姻",
  "家庭伦理",
  "逆袭复仇",
];

const baseTopics = [
  {
    id: "t1",
    title: "国漫女主黑化复仇",
    platform: "抖音",
    category: "动漫",
    tags: ["国漫", "女强", "复仇", "爽感"],
    heat: 93400,
    playCount: 680000000,
    influenceIndex: 93210,
    rank: 4,
    rankChange: 18,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:42:00+08:00",
    firstSeenDays: 2,
    trend: [38, 44, 51, 59, 67, 82, 94],
    sentiment: "高燃、反击、替身文学讨论集中，评论区对女性角色掌控命运的期待强。",
    opportunity: "适合改成现代都市或玄幻短剧，前三集必须完成羞辱、觉醒、第一次反杀。",
    related: ["背叛后觉醒", "废柴逆袭", "女主不原谅"],
    videos: ["高赞混剪", "角色台词盘点", "剧情解说"],
    risks: ["版权/IP", "暴力尺度"],
  },
  {
    id: "t2",
    title: "开放世界手游 NPC 有了自我意识",
    platform: "抖音",
    category: "游戏",
    tags: ["开放世界", "AI", "游戏改编", "反套路"],
    heat: 88200,
    playCount: 420000000,
    influenceIndex: 90120,
    rank: 7,
    rankChange: 24,
    source: "专区导出",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:42:00+08:00",
    firstSeenDays: 1,
    trend: [22, 28, 39, 48, 61, 75, 88],
    sentiment: "玩家对 NPC 觉醒、游戏世界反噬现实的讨论热烈，适合悬疑喜剧混合。",
    opportunity: "可做男主进入游戏后被 NPC 识破身份，反被低级角色带飞的轻科幻短剧。",
    related: ["游戏 NPC 觉醒", "穿进副本", "AI 队友"],
    videos: ["实机整活", "剧情脑洞", "玩家二创"],
    risks: ["平台审核", "技术概念解释成本"],
  },
  {
    id: "t3",
    title: "老电影反派其实救了所有人",
    platform: "抖音",
    category: "影视",
    tags: ["影视解说", "反转", "童年回忆", "悬疑"],
    heat: 76500,
    playCount: 530000000,
    influenceIndex: 77100,
    rank: 11,
    rankChange: 9,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:37:00+08:00",
    firstSeenDays: 5,
    trend: [64, 68, 71, 72, 75, 76, 77],
    sentiment: "观众喜欢重读经典角色，对隐藏真相与错怪反派的情绪反馈稳定。",
    opportunity: "适合做悬疑亲情短剧：所有人以为父亲是恶人，最后发现他一直在挡灾。",
    related: ["反派洗白", "童年阴影", "真相反转"],
    videos: ["经典片段", "细节解析", "结局重读"],
    risks: ["版权/IP", "热度衰减"],
  },
  {
    id: "t4",
    title: "二次元生日应援破圈",
    platform: "抖音",
    category: "二次元",
    tags: ["应援", "虚拟偶像", "粉丝经济", "陪伴"],
    heat: 84600,
    playCount: null,
    influenceIndex: 87500,
    rank: 6,
    rankChange: 15,
    source: "专区导出",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:40:00+08:00",
    firstSeenDays: 1,
    trend: [30, 36, 45, 57, 64, 76, 87],
    sentiment: "粉丝强情感投入，评论集中在陪伴感、共同仪式、现实孤独感。",
    opportunity: "可做虚拟偶像与现实编剧互相拯救，偏甜虐成长线。",
    related: ["虚拟陪伴", "生日应援", "粉丝共创"],
    videos: ["应援现场", "手书混剪", "祝福投稿"],
    risks: ["粉圈争议", "未成年人"],
  },
  {
    id: "t5",
    title: "明星旧剧角色二创翻红",
    platform: "抖音",
    category: "明星/IP",
    tags: ["旧剧翻红", "角色滤镜", "二创", "CP"],
    heat: 82100,
    playCount: 610000000,
    influenceIndex: 81900,
    rank: 8,
    rankChange: 11,
    source: "专区导出 + 人工补录",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:33:00+08:00",
    firstSeenDays: 4,
    trend: [52, 58, 65, 70, 76, 80, 82],
    sentiment: "角色滤镜带动考古，观众更关心未完成的遗憾和 CP 二创补偿。",
    opportunity: "适合做娱乐圈短剧：过气演员因旧角色翻红，与新人搭档完成事业翻盘。",
    related: ["旧剧考古", "CP 补偿", "演员翻红"],
    videos: ["角色名场面", "CP 混剪", "采访考古"],
    risks: ["肖像授权", "粉丝争议"],
  },
  {
    id: "t6",
    title: "打工人被系统奖励按时下班",
    platform: "抖音",
    category: "社会情绪",
    tags: ["打工人", "系统流", "解压", "职场"],
    heat: 79800,
    playCount: 360000000,
    influenceIndex: 79850,
    rank: 13,
    rankChange: 21,
    source: "人工补录 + 专区导出",
    sourceAuth: "内部授权",
    collectedAt: "2026-07-05T10:45:00+08:00",
    firstSeenDays: 1,
    trend: [24, 31, 42, 54, 63, 71, 80],
    sentiment: "强烈解压情绪，用户喜欢低成本反抗和生活秩序重新夺回。",
    opportunity: "可做职场喜剧短剧：女主越拒绝无效加班越被系统奖励，爽点密集。",
    related: ["拒绝内耗", "系统奖励", "职场反击"],
    videos: ["职场段子", "剧情反转", "评论共鸣"],
    risks: ["现实议题尺度"],
  },
  {
    id: "t7",
    title: "重生后先离婚再暴富",
    platform: "抖音",
    category: "恋爱婚姻",
    tags: ["重生", "离婚", "暴富", "女性成长"],
    heat: 86800,
    playCount: 710000000,
    influenceIndex: 86100,
    rank: 5,
    rankChange: 7,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:36:00+08:00",
    firstSeenDays: 6,
    trend: [78, 80, 82, 84, 86, 87, 87],
    sentiment: "成熟稳定题材，女性用户对及时止损、财富自主反馈最好。",
    opportunity: "适合做强商业化女频短剧，关键在离婚后第一桶金的可信爽点。",
    related: ["前夫后悔", "独立女性", "重生爽文"],
    videos: ["短剧剪辑", "台词共鸣", "爽文解说"],
    risks: ["题材同质化"],
  },
  {
    id: "t8",
    title: "假千金回村继承非遗工坊",
    platform: "抖音",
    category: "家庭伦理",
    tags: ["假千金", "非遗", "亲情", "反差"],
    heat: 74200,
    playCount: 280000000,
    influenceIndex: 74400,
    rank: 19,
    rankChange: 13,
    source: "人工补录",
    sourceAuth: "内部授权",
    collectedAt: "2026-07-05T10:31:00+08:00",
    firstSeenDays: 3,
    trend: [41, 48, 54, 58, 63, 69, 74],
    sentiment: "观众对身份落差、家族手艺与乡村治愈有正向反馈。",
    opportunity: "可做温情逆袭：假千金被赶回村，靠非遗直播救下家族工坊。",
    related: ["真假千金", "非遗直播", "乡村治愈"],
    videos: ["手作过程", "身份反转", "亲情片段"],
    risks: ["地方文化准确性"],
  },
  {
    id: "t9",
    title: "废柴男主其实是副本管理员",
    platform: "抖音",
    category: "逆袭复仇",
    tags: ["副本", "男频", "隐藏身份", "反杀"],
    heat: 90500,
    playCount: 590000000,
    influenceIndex: 90750,
    rank: 3,
    rankChange: 17,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:39:00+08:00",
    firstSeenDays: 2,
    trend: [49, 55, 63, 71, 80, 88, 91],
    sentiment: "男频用户对隐藏身份、规则碾压、全场反杀讨论集中。",
    opportunity: "适合竖屏快节奏男频：前两分钟完成被羞辱与权限觉醒。",
    related: ["隐藏身份", "无限流", "规则怪谈"],
    videos: ["副本解说", "反杀剪辑", "爽点合集"],
    risks: ["暴力尺度", "世界观解释成本"],
  },
  {
    id: "t10",
    title: "暑期档悬疑剧全员说谎",
    platform: "抖音",
    category: "影视",
    tags: ["暑期档", "悬疑", "全员恶人", "反转"],
    heat: 91600,
    playCount: null,
    influenceIndex: 91300,
    rank: 2,
    rankChange: 26,
    source: "专区导出",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:44:00+08:00",
    firstSeenDays: 1,
    trend: [34, 42, 53, 67, 78, 86, 91],
    sentiment: "用户热衷猜凶和细节盘点，评论区二创推理密度高。",
    opportunity: "可做家庭悬疑短剧：每集一个谎言反转，最后发现受害者才是操盘者。",
    related: ["全员恶人", "细节盘点", "反转结局"],
    videos: ["片段解析", "人物关系图", "结局预测"],
    risks: ["版权/IP", "剧透争议"],
  },
  {
    id: "t11",
    title: "像素风独立游戏治愈破防",
    platform: "抖音",
    category: "游戏",
    tags: ["独立游戏", "治愈", "像素风", "亲情"],
    heat: 70100,
    playCount: 190000000,
    influenceIndex: 70320,
    rank: 28,
    rankChange: 8,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:35:00+08:00",
    firstSeenDays: 8,
    trend: [55, 58, 61, 64, 67, 69, 70],
    sentiment: "小体量但长尾好，用户在亲情、遗憾和自我和解上共鸣。",
    opportunity: "可改成低成本治愈短剧，主角在游戏里补完与家人的最后一次告别。",
    related: ["像素治愈", "亲情遗憾", "独立游戏"],
    videos: ["实况剪辑", "结局破防", "配乐二创"],
    risks: ["商业爆发不足"],
  },
  {
    id: "t12",
    title: "反派妈妈重回女儿十七岁",
    platform: "抖音",
    category: "家庭伦理",
    tags: ["母女", "重生", "和解", "女性情感"],
    heat: 87300,
    playCount: 510000000,
    influenceIndex: 86900,
    rank: 9,
    rankChange: 16,
    source: "专区导出 + 授权补充",
    sourceAuth: "专区授权",
    collectedAt: "2026-07-05T10:38:00+08:00",
    firstSeenDays: 2,
    trend: [46, 52, 61, 69, 77, 83, 87],
    sentiment: "母女关系冲突强，观众既想看弥补遗憾，也想看女儿拒绝道德绑架。",
    opportunity: "可做女性亲情短剧：母亲重生后改写女儿命运，但必须先学会尊重边界。",
    related: ["母女和解", "重生弥补", "亲情边界"],
    videos: ["情绪片段", "评论投稿", "亲情混剪"],
    risks: ["家庭议题尺度"],
  },
];

let settings = readJSON("radarSettings", defaultSettings);
settings.useSampleData = settings.useSampleData !== false;
let importedTopics = readJSON("radarImportedTopics", []);
let importHistory = readJSON("radarImportHistory", []);
let topicSnapshots = readJSON("radarTopicSnapshots", []);
let latestImportReport = readJSON("radarLatestImportReport", null);
let topics = buildTopicCollection();
let favorites = new Set(readJSON("radarFavorites", ["t1", "t7", "t9"]));
let selectedTopicId = "t1";
let alertsRead = new Set(readJSON("radarAlertsRead", []));
let storyCards = readJSON("radarStoryCards", seedStoryCards());

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
});

function hydrateControls() {
  fillSelect("categoryFilter", categories);
  fillSelect("platformFilter", ["全部", "抖音"]);
  fillSelect("heatFilter", ["全部", "破圈", "高热度", "中热度"]);
  fillSelect("timeFilter", ["全部", "24小时内", "3天内", "7天内"]);
  fillSelect("ideaStatusFilter", ["全部", "待评审", "已通过", "需修改"]);
  fillSelect("ownerFilter", ["全部", "林制片", "周编剧", "陈策划", "未分配"]);
  document.querySelector("#playThreshold").value = settings.playThreshold;
  document.querySelector("#heatThreshold").value = settings.heatThreshold;
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
    setView("topics");
    renderAll();
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
    };
    writeJSON("radarSettings", settings);
    renderAll();
    toast("配置已保存，破圈标记和告警已按新阈值刷新。");
  });

  document.querySelector("#refreshButton").addEventListener("click", () => {
    createDailySnapshot("手动刷新");
    toast("已完成本地数据快照、破圈判断和告警刷新。");
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
      toast(`已导入 ${report.accepted} 条专区话题，更新 ${report.updated} 条。`);
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
    toast(settings.useSampleData ? "已清空专区导入数据，保留内置演示样本。" : "已清空专区导入数据。");
  });

  document.querySelector("#downloadTemplate").addEventListener("click", downloadImportTemplate);
  document.querySelector("#exportTopicsJson").addEventListener("click", () => exportTopics("json"));
  document.querySelector("#exportTopicsCsv").addEventListener("click", () => exportTopics("csv"));
  document.querySelector("#toggleSampleData").addEventListener("click", () => {
    settings.useSampleData = !settings.useSampleData;
    writeJSON("radarSettings", settings);
    topics = buildTopicCollection();
    renderAll();
    toast(settings.useSampleData ? "已开启演示样本。" : "已关闭演示样本，仅显示专区导入数据。");
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
  createIcons();
}

function renderDashboard() {
  const breakthrough = topics.filter(isBreakthrough);
  const rising = [...topics].sort((a, b) => b.rankChange - a.rankChange);
  const reviewCards = storyCards.filter((card) => card.status === "待评审");
  document.querySelector("#metricBreakthrough").textContent = breakthrough.length;
  document.querySelector("#metricRising").textContent = rising[0].rankChange;
  document.querySelector("#metricReview").textContent = reviewCards.length;

  document.querySelector("#breakthroughStrip").innerHTML = breakthrough
    .slice(0, 3)
    .map(renderTopicCard)
    .join("");

  const grouped = categories
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
  document.querySelector("#resultCount").textContent = `${results.length} 个话题`;
  const selectedStillVisible = results.some((topic) => topic.id === selectedTopicId);
  if (!selectedStillVisible && results[0]) selectedTopicId = results[0].id;

  document.querySelector("#topicList").innerHTML = results
    .map(
      (topic) => `
        <button class="topic-list-item ${topic.id === selectedTopicId ? "active" : ""}" data-topic="${topic.id}">
          <span class="list-main">
            <strong>${topic.title}</strong>
            <span>${renderBreakBadge(topic)}</span>
          </span>
          <span class="tag-row">${topic.tags.slice(0, 4).map((tag) => `<span class="tag">${tag}</span>`).join("")}</span>
          <span class="topic-stats">
            <div><span>播放量</span><strong>${formatPlay(topic.playCount)}</strong></div>
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
      <div><span>播放量口径</span><strong>${formatPlay(topic.playCount)}</strong></div>
      <div><span>影响力指数</span><strong>${yuan.format(topic.influenceIndex)}</strong></div>
      <div><span>榜单排名</span><strong>#${topic.rank} / +${topic.rankChange}</strong></div>
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
    ["区", "抖音专区导出", "专区授权", `${importedTopics.length} 条已导入`],
    ["授", "授权补充数据", "已授权", "播放/互动补充"],
    ["样", "内置演示样本", settings.useSampleData ? "已启用" : "已关闭", `${baseTopics.length} 条样本`],
    ["快", "本地快照库", "浏览器存储", `${topicSnapshots.length} 次快照`],
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
        <div class="report-item"><span>专区话题</span><strong>${importedTopics.length}</strong></div>
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
      <div class="health-item"><span>数据模式</span><strong>${settings.useSampleData ? "专区+样本" : "仅专区"}</strong></div>
      <div class="health-item"><span>本地占用</span><strong>${formatBytes(storageBytes)}</strong></div>
      <div class="health-item"><span>最近快照</span><strong>${latestSnapshot ? dateFormatter.format(new Date(latestSnapshot.createdAt)) : "暂无"}</strong></div>
      <div class="health-item"><span>收藏话题</span><strong>${favorites.size}</strong></div>
    </div>
  `;
}

function renderImportHistory() {
  const node = document.querySelector("#importHistory");
  if (!node) return;
  if (importHistory.length === 0) {
    node.innerHTML = `<div class="history-item"><div><strong>暂无导入记录</strong><p>粘贴或选择专区文件后会自动生成记录。</p></div><span class="tag">empty</span></div>`;
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
        <div><span>播放量</span><strong>${formatPlay(topic.playCount)}</strong></div>
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
  const keyword = state.keyword.toLowerCase();
  return topics.filter((topic) => {
    const haystack = [
      topic.title,
      topic.category,
      topic.sentiment,
      topic.opportunity,
      ...topic.tags,
      ...topic.related,
    ]
      .join(" ")
      .toLowerCase();
    const keywordMatch = !keyword || haystack.includes(keyword);
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
  });
}

function isBreakthrough(topic) {
  if (typeof topic.playCount === "number") return topic.playCount >= settings.playThreshold;
  return topic.influenceIndex >= settings.heatThreshold;
}

function renderBreakBadge(topic) {
  if (!isBreakthrough(topic)) return `<span class="badge">观察</span>`;
  if (typeof topic.playCount === "number") return `<span class="badge break">播放量破圈</span>`;
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
  return [
    {
      id: "idea-seed-1",
      topicId: "t7",
      topicTitle: "重生后先离婚再暴富",
      title: "离婚当天，我绑定财富系统",
      genre: "恋爱婚姻",
      audience: "24-45 女频短剧用户",
      owner: "周编剧",
      status: "待评审",
      logline: "女主重生后拒绝内耗婚姻，靠预判能力拿下第一桶金，前夫家族开始反向求和。",
      conflict: "女性及时止损与财富自主。",
      hooks: ["婚礼纪念日提出离婚", "系统奖励第一笔资金", "前夫发现她才是项目关键人"],
      risks: ["题材同质化"],
      source: "专区导出 + 授权补充",
      createdAt: "2026-07-05T10:55:00+08:00",
    },
    {
      id: "idea-seed-2",
      topicId: "t9",
      topicTitle: "废柴男主其实是副本管理员",
      title: "副本开局，我拥有后台权限",
      genre: "逆袭复仇",
      audience: "18-40 男频爽剧用户",
      owner: "林制片",
      status: "已通过",
      logline: "被队友抛弃的男主发现自己能修改副本规则，从最低级身份一路反杀。",
      conflict: "隐藏身份与规则碾压。",
      hooks: ["被队友锁进死局", "第一次修改规则", "反派发现他不是玩家"],
      risks: ["暴力尺度", "世界观解释成本"],
      source: "专区导出 + 授权补充",
      createdAt: "2026-07-05T10:58:00+08:00",
    },
    {
      id: "idea-seed-3",
      topicId: "t12",
      topicTitle: "反派妈妈重回女儿十七岁",
      title: "妈妈重生后，先向女儿道歉",
      genre: "家庭伦理",
      audience: "25-50 家庭情感用户",
      owner: "陈策划",
      status: "需修改",
      logline: "强势母亲回到女儿十七岁，想改写悲剧，却发现真正要改变的是控制欲。",
      conflict: "亲情弥补与边界重建。",
      hooks: ["母亲醒在女儿高考前", "第一次没有替女儿做决定", "女儿发现母亲知道未来"],
      risks: ["家庭议题尺度"],
      source: "专区导出 + 授权补充",
      createdAt: "2026-07-05T11:02:00+08:00",
    },
  ];
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
      title: `${topic.title} 达到${typeof topic.playCount === "number" ? "播放量" : "影响力指数"}破圈`,
      body: `${topic.category} · ${formatPlay(topic.playCount)} · 影响力 ${yuan.format(topic.influenceIndex)} · 排名提升 +${topic.rankChange}`,
    }));
}

function buildTopicCollection() {
  return [...importedTopics, ...(settings.useSampleData ? baseTopics : [])];
}

function importZoneText(raw, sourceName) {
  const rows = parseZoneRows(raw);
  const errors = [];
  const normalized = rows
    .map((row, index) => {
      const topic = normalizeZoneRow(row, index);
      if (!topic) errors.push(`第 ${index + 1} 行缺少标题，已跳过`);
      return topic;
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
  return text.startsWith("[") || text.startsWith("{") ? parseZoneJSON(text) : parseZoneCSV(text);
}

function parseZoneImport(raw) {
  return parseZoneRows(raw).map(normalizeZoneRow).filter(Boolean);
}

function parseZoneJSON(text) {
  const value = JSON.parse(text);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.topics)) return value.topics;
  if (Array.isArray(value.data)) return value.data;
  return [value];
}

function parseZoneCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function splitCSVLine(line) {
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
  const id = `zone-${stableSlug(title)}-${Date.now()}-${index}`;
  return {
    id,
    title,
    platform: readField(row, ["platform", "平台"]) || "抖音",
    category,
    tags: tags.length ? tags : [category, "专区导入"],
    heat,
    playCount: playCount || null,
    influenceIndex,
    rank,
    rankChange,
    source: readField(row, ["source", "来源", "数据来源"]) || "专区导入",
    sourceAuth: "专区授权",
    collectedAt,
    firstSeenDays: normalizeNumber(readField(row, ["firstSeenDays", "出现天数", "首见天数"])) || 1,
    trend: buildImportedTrend(heat, rankChange),
    sentiment:
      readField(row, ["sentiment", "情绪摘要", "用户情绪"]) ||
      "专区导入话题，建议结合评论样本补充用户情绪、争议点和共鸣关键词。",
    opportunity:
      readField(row, ["opportunity", "改编机会", "短剧机会"]) ||
      `可围绕「${title}」提炼身份落差、强冲突和前三集反转，生成短剧选题卡后再细化人物关系。`,
    related: normalizeTags(readField(row, ["related", "相关话题", "话题簇"])).slice(0, 4),
    videos: normalizeTags(readField(row, ["videos", "代表内容", "代表视频"])).slice(0, 4),
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
  const matched = categories.find((category) => category !== "全部" && text.includes(category));
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
    },
    topics: topics.map((topic) => ({
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
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
