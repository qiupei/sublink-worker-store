/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
import { DIRECT_DEFAULT_RULES, PREDEFINED_RULE_SETS, REJECT_ACTION_RULES, UNIFIED_RULES } from '../config/index.js';
import { formLogicFn } from './formLogic.js';

const LINK_FIELDS = [
  { key: 'xray', labelKey: 'xrayLink' },
  { key: 'singbox', labelKey: 'singboxLink' },
  { key: 'clash', labelKey: 'clashLink' },
  { key: 'surge', labelKey: 'surgeLink' }
];

const RULE_DESCRIPTIONS = {
  'Ad Block': '拦截广告和追踪器',
  'AI Services': 'ChatGPT、Claude、Copilot 等',
  Bilibili: '哔哩哔哩相关服务',
  Youtube: 'YouTube 视频服务',
  Google: 'Google 服务走代理',
  Private: '局域网和私有 IP 直连',
  'Location:CN': '国内网站和服务直连',
  Telegram: 'Telegram 消息服务',
  Github: '代码托管服务',
  Microsoft: '微软相关服务',
  Apple: '苹果相关服务',
  'Social Media': '海外社交媒体',
  Streaming: '海外流媒体',
  Gaming: '游戏平台',
  Education: '教育和学术资源',
  Financial: '金融支付服务',
  'Cloud Services': '云服务和网盘',
  'Non-China': '非中国域名走代理'
};

const RULE_ENTRY_LABELS = {
  private: {
    site: '私有网络',
    ip: '私有 IP'
  },
  openai: {
    site: 'OpenAI'
  },
  anthropic: {
    site: 'Anthropic (Claude)'
  },
  'category-ai-chat-!cn': {
    site: 'AI 服务合集'
  },
  'category-ads-all': {
    site: '广告域名'
  },
  'geolocation-!cn': {
    site: '非中国域名'
  },
  'geolocation-cn': {
    site: '国内域名（精简）'
  },
  cn: {
    site: '国内域名',
    ip: '国内 IP'
  }
};

function getRuleEntryLabel(name, type) {
  return RULE_ENTRY_LABELS[name]?.[type] || name;
}

function getRuleEntries(rule) {
  const siteRules = (rule.site_rules || []).map(name => ({
    name,
    label: getRuleEntryLabel(name, 'site'),
    kind: '域名',
    path: `geosite/${name}.mrs`,
    badge: '预设'
  }));
  const ipRules = (rule.ip_rules || []).map(name => ({
    name,
    label: getRuleEntryLabel(name, 'ip'),
    kind: 'IP',
    path: `geoip/${name}.mrs`,
    badge: 'no-resolve'
  }));
  return [...siteRules, ...ipRules];
}

function getRuleAction(ruleName) {
  if (REJECT_ACTION_RULES.has(ruleName)) {
    return { label: '拒绝', className: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800' };
  }
  if (DIRECT_DEFAULT_RULES.has(ruleName)) {
    return { label: '直连', className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
  }
  return { label: '代理', className: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' };
}

export const Form = (props) => {
  const { t, lang } = props;

  const translations = {
    saveConfigSuccess: t('saveConfigSuccess'),
    saveConfig: t('saveConfig'),
    savingConfig: t('savingConfig'),
    configContentRequired: t('configContentRequired'),
    configSaveFailed: t('configSaveFailed'),
    confirmClearConfig: t('confirmClearConfig')
  };

  const scriptContent = `
    window.APP_TRANSLATIONS = ${JSON.stringify(translations)};
    window.PREDEFINED_RULE_SETS = ${JSON.stringify(PREDEFINED_RULE_SETS)};
    window.RULE_PREVIEW_META = ${JSON.stringify(UNIFIED_RULES.map(rule => ({
      name: rule.name,
      label: t(`outboundNames.${rule.name}`),
      description: RULE_DESCRIPTIONS[rule.name] || '自定义分流规则',
      action: getRuleAction(rule.name).label,
      entries: getRuleEntries(rule).map(entry => ({
        label: entry.label,
        kind: entry.kind,
        path: entry.path
      }))
    })))};
    window.APP_LANG = ${JSON.stringify(lang || 'zh-CN')};
    if (typeof __name === 'undefined') { var __name = function(fn) { return fn; }; }
    (${formLogicFn.toString()})();
  `;

  return (
    <div x-data="formData()" x-init="init()" class="max-w-[1500px] mx-auto px-3 sm:px-4">
      <template x-teleport="#navbar-auth">
        <div class="relative" {...{'x-on:click.outside': 'authMenuOpen = false'}}>
          {/* Logged in state */}
          <div x-show="currentUser" class="h-10 pl-2 pr-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm backdrop-blur text-gray-800 dark:text-gray-100 text-sm font-semibold flex items-center gap-2.5 transition-colors duration-200">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm select-none">
              <span x-text="currentUser?.username ? currentUser.username[0] : 'U'"></span>
            </div>
            <span class="max-w-28 truncate font-medium text-gray-700 dark:text-gray-200" x-text="currentUser?.username"></span>
            <div class="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
            <button type="button" x-on:click="logout()" class="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center" title="退出登录">
              <i class="fas fa-right-from-bracket text-xs"></i>
            </button>
          </div>

          {/* Logged out state */}
          <div x-show="!currentUser" class="relative">
            <button
              type="button"
              x-on:click="authMenuOpen = !authMenuOpen"
              class="h-10 px-4 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-750"
            >
              <i class="far fa-circle-user text-base text-gray-400 dark:text-gray-500"></i>
              <span>登录</span>
            </button>

            <div
              x-cloak
              x-show="authMenuOpen"
              class="absolute right-0 top-12 w-[min(92vw,360px)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 p-5 z-[70]"
            >
              <div class="flex gap-2 mb-4 justify-end">
                <button
                  type="button"
                  x-on:click="authMode = 'login'; authMessage = ''"
                  class="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  x-bind:class="authMode === 'login' ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-250 hover:bg-gray-200 dark:hover:bg-gray-600'"
                >
                  登录
                </button>
                <button
                  type="button"
                  x-on:click="authMode = 'register'; authMessage = ''"
                  class="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  x-bind:class="authMode === 'register' ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-250 hover:bg-gray-200 dark:hover:bg-gray-600'"
                >
                  注册
                </button>
              </div>
              <form {...{'x-on:submit.prevent': 'submitAuth()'}} class="grid grid-cols-1 gap-2.5">
                <input
                  type="text"
                  x-model="authUsername"
                  autocomplete="username"
                  placeholder="用户名"
                  class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none"
                />
                <input
                  type="password"
                  x-model="authPassword"
                  autocomplete="current-password"
                  placeholder="密码"
                  class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none"
                />
                <button
                  type="submit"
                  x-bind:disabled="authLoading"
                  class="mt-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm transition-colors duration-200"
                >
                  <i class="fas" x-bind:class="authLoading ? 'fa-spinner fa-spin' : 'fa-right-to-bracket'"></i>
                  <span x-text="authMode === 'register' ? '注册' : '登录'">登录</span>
                </button>
              </form>
              <div x-show="authMessage" class="mt-2.5 text-xs text-red-500 dark:text-red-400 text-right" x-text="authMessage"></div>
            </div>
          </div>
        </div>
      </template>

      <div x-show="currentView === 'subscriptions'" class="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">订阅总览</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">查看订阅数量、节点规模、源数量，并进入编辑。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              x-on:click="loadSubscriptions()"
              x-bind:disabled="!currentUser || subscriptionsLoading"
              class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas" x-bind:class="subscriptionsLoading ? 'fa-spinner fa-spin' : 'fa-rotate'"></i>
              刷新
            </button>
            <button
              type="button"
              x-on:click="openNewSubscription()"
              class="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <i class="fas fa-plus"></i>
              新建订阅
            </button>
          </div>
        </div>

        <div x-show="subscriptionMessage" class="rounded-lg px-4 py-3 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-200" x-text="subscriptionMessage"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div class="flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                <i class="fas fa-file-code"></i>
              </span>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">订阅数量</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white"><span x-text="subscriptions.length"></span></div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div class="flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <i class="fas fa-server"></i>
              </span>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">节点总数</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white"><span x-text="subscriptions.reduce((total, item) => total + (item.nodeCount || 0), 0)"></span></div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div class="flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                <i class="fas fa-link"></i>
              </span>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">导入源</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white"><span x-text="subscriptions.reduce((total, item) => total + (item.sourceCount || 0), 0)"></span></div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div class="flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <i class="fas fa-clock-rotate-left"></i>
              </span>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">最近更新</div>
                <div class="text-sm font-semibold text-gray-900 dark:text-white" x-text="formatDate(subscriptions[0]?.updatedAt) || '-'"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div class="flex items-center justify-between gap-4 mb-5">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">订阅列表</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">共 <span x-text="subscriptions.length"></span> 个</span>
          </div>
          <div x-show="!currentUser" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            登录后可以查看你的订阅列表。
          </div>
          <div x-show="currentUser && subscriptionsLoading" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            <i class="fas fa-spinner fa-spin mr-2"></i>加载中...
          </div>
          <div x-show="currentUser && !subscriptionsLoading && subscriptions.length === 0" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
            <div class="text-gray-900 dark:text-white font-semibold">还没有订阅</div>
            <button type="button" x-on:click="openNewSubscription()" class="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold inline-flex items-center gap-2">
              <i class="fas fa-plus"></i>
              新建订阅
            </button>
          </div>
          <div class="space-y-3" x-show="currentUser && subscriptions.length > 0">
            <template x-for="subscription in subscriptions" x-bind:key="subscription.id">
              <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                <div class="flex flex-col xl:flex-row xl:items-center gap-4">
                  <div class="flex items-start gap-3 min-w-0 flex-1">
                    <span class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center shrink-0">
                      <i class="fas fa-file-code"></i>
                    </span>
                    <div class="min-w-0">
                      <div class="font-semibold text-gray-900 dark:text-white truncate" x-text="subscription.name"></div>
                      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>创建 <span x-text="formatDate(subscription.createdAt)"></span></span>
                        <span>更新 <span x-text="formatDate(subscription.updatedAt)"></span></span>
                        <span><span x-text="subscription.enabledSourceCount"></span>/<span x-text="subscription.sourceCount"></span> 源</span>
                        <span><span x-text="subscription.nodeCount || 0"></span> 节点</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap xl:justify-end gap-2">
                    <button type="button" x-on:click="editSubscription(subscription.id)" class="px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-sm font-semibold flex items-center gap-2">
                      <i class="fas fa-gear"></i>
                      编辑
                    </button>
                    <button type="button" x-on:click="copySubscriptionLink(subscription.token, 'clash')" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold flex items-center gap-2">
                      <i class="fas fa-copy"></i>
                      复制 Clash
                    </button>
                    <button type="button" x-on:click="deleteSubscriptionById(subscription.id)" class="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold flex items-center gap-2">
                      <i class="fas fa-trash"></i>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div x-show="currentView === 'home'" class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] gap-6 items-start">
      <section class="space-y-6 min-w-0">

      {/* Subscription Workspace */}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <i class="fas fa-layer-group text-sm"></i>
              </span>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">订阅工作台</h2>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">保存多源配置，生成固定订阅链接，后续修改无需更换客户端地址。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              x-on:click="resetSubscriptionDraft()"
              class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              新建
            </button>
          </div>
        </div>

        <div>
          <section class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">订阅名称</label>
              <input
                type="text"
                x-model="subscriptionName"
                placeholder="例如：家庭网关、手机主订阅、备用节点池"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{t('shareUrls')}</h3>
              <button
                type="button"
                x-on:click="addSource()"
                class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium flex items-center gap-2"
              >
                <i class="fas fa-plus"></i>
                添加源
              </button>
            </div>

            <div class="space-y-3">
              <template x-for="(source, index) in sources" x-bind:key="source.id">
                <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
                  <div class="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input type="checkbox" x-model="source.enabled" x-on:change="syncInputFromSources()" class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                      启用
                    </label>
                    <div class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold">
                      <span x-text="getSourceAutoName(source, index)"></span>
                    </div>
                    <div class="flex items-center gap-1">
                      <button type="button" x-on:click="moveSource(index, -1)" class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600" title="上移">
                        <i class="fas fa-chevron-up text-xs"></i>
                      </button>
                      <button type="button" x-on:click="moveSource(index, 1)" class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600" title="下移">
                        <i class="fas fa-chevron-down text-xs"></i>
                      </button>
                      <button type="button" x-on:click="removeSource(index)" class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600" title="删除">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div class="relative">
                    <textarea
                      x-model="source.content"
                      x-on:input="handleSourceContentChange(index)"
                      rows="3"
                      placeholder={t('urlPlaceholder')}
                      class="w-full px-4 py-3 pr-14 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-y"
                    ></textarea>
                    <button
                      type="button"
                      {...{'x-on:click.stop': 'parseSource(index)'}}
                      x-bind:disabled="source.parsing || !(source.content || '').trim()"
                      class="absolute right-3 top-3 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      x-bind:class="source.imported ? 'border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-green-600 hover:border-green-300'"
                      title="校验并导入节点"
                    >
                      <i class="fas" x-bind:class="source.parsing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    </button>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    <span x-show="source.imported" class="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <i class="fas fa-check mr-1"></i><span x-text="source.nodeCount || 0"></span> 节点
                    </span>
                    <span x-show="source.error" class="px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800" x-text="source.error"></span>
                  </div>
                </div>
              </template>
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                    <i class="fas fa-list"></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">节点管理</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      <span x-text="managedNodes.length"></span> 个已导入节点
                    </p>
                  </div>
                </div>
                <input
                  type="search"
                  x-model="nodeSearch"
                  placeholder="搜索节点..."
                  class="w-full sm:w-56 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div x-show="managedNodes.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                点击上方源卡片的勾，校验成功后节点会出现在这里。
              </div>
              <div class="space-y-2" x-show="managedNodes.length > 0">
                <template x-for="(node, index) in filteredManagedNodes" x-bind:key="node.id">
                  <div class="flex flex-col md:flex-row md:items-center gap-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-3">
                    <span class="px-2.5 py-1 rounded-md text-xs font-semibold uppercase border"
                      x-bind:class="node.type === 'hysteria2' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'"
                      x-text="node.type"
                    ></span>
                    <input
                      type="text"
                      x-model="node.name"
                      x-on:input="updateNodeName(index, node.name)"
                      class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div class="flex items-center justify-end gap-1">
                      <span class="text-xs text-gray-400 mr-2">顺序 <span x-text="managedNodes.findIndex(item => item.id === node.id) + 1"></span></span>
                      <button type="button" x-on:click="moveNodeById(node.id, -1)" class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600" title="上移">
                        <i class="fas fa-chevron-up text-xs"></i>
                      </button>
                      <button type="button" x-on:click="moveNodeById(node.id, 1)" class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600" title="下移">
                        <i class="fas fa-chevron-down text-xs"></i>
                      </button>
                      <button type="button" x-on:click="removeNodeById(node.id)" class="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600" title="删除">
                        <i class="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div x-show="subscriptionMessage" class="rounded-lg px-4 py-3 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-200" x-text="subscriptionMessage"></div>
          </section>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center">
              <i class="fas fa-filter text-sm"></i>
            </span>
            {t('ruleSelection')}
          </h2>
          <select
            x-model="selectedPredefinedRule"
            x-on:change="applyPredefinedRule()"
            class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="custom">{t('custom')}</option>
            <option value="minimal">{t('minimal')}</option>
            <option value="balanced">{t('balanced')}</option>
            <option value="comprehensive">{t('comprehensive')}</option>
          </select>
        </div>

        <div class="space-y-3">
          {UNIFIED_RULES.map((rule) => {
            const entries = getRuleEntries(rule);
            const action = getRuleAction(rule.name);
            return (
              <details class="group rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
                <summary class="list-none cursor-pointer px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <span class="mt-1 text-gray-400 dark:text-gray-500 transition-transform group-open:rotate-90">
                      <i class="fas fa-chevron-right text-xs"></i>
                    </span>
                    <input
                      type="checkbox"
                      value={rule.name}
                      x-model="selectedRules"
                      {...{'x-on:click.stop': ''}}
                      x-on:change="selectedPredefinedRule = 'custom'"
                      class="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-semibold text-gray-900 dark:text-white">
                          {t(`outboundNames.${rule.name}`)}
                        </span>
                        <span class={`text-xs px-2 py-0.5 rounded-full border ${action.className}`}>
                          {action.label}
                        </span>
                      </div>
                      <div class="text-sm text-primary-600 dark:text-primary-300 mt-1">
                        {RULE_DESCRIPTIONS[rule.name] || '自定义分流规则'} · {entries.length} 规则
                      </div>
                    </div>
                  </div>
                </summary>
                <div class="px-4 pb-4 pt-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div class="space-y-3">
                    {entries.map(entry => (
                      <div class="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 px-4 py-3">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                          <span class="font-semibold text-gray-900 dark:text-white">
                            {entry.label}
                          </span>
                          <span class="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                            {entry.badge}
                          </span>
                          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {entry.kind}
                          </span>
                        </div>
                        <div class="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                          {entry.path}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      </section>

      <aside class="xl:sticky xl:top-6 min-w-0" x-data="{ copiedStable: null }">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                  <i class="fas fa-eye text-sm"></i>
                </span>
                预览
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">实时查看当前订阅会包含哪些源、节点和规则。</p>
            </div>
            <div class="inline-flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 text-sm font-medium">
              <span class="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400">YAML</span>
              <span class="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">可视化</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 text-center">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-300" x-text="managedNodes.length">0</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">节点</div>
            </div>
            <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 text-center">
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-300" x-text="sources.filter(source => source.enabled !== false && (source.content || '').trim()).length">0</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">启用源</div>
            </div>
            <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 text-center">
              <div class="text-2xl font-bold text-violet-600 dark:text-violet-300" x-text="selectedRules.length">0</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">规则组</div>
            </div>
          </div>

          <div class="space-y-5">
            <section>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <i class="fas fa-diagram-project text-gray-400"></i>
                  规则预览
                </h3>
                <span class="text-xs text-gray-500 dark:text-gray-400" x-text="selectedPredefinedRule === 'custom' ? '自定义' : selectedPredefinedRule"></span>
              </div>
              <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                <template x-for="rule in (window.RULE_PREVIEW_META || []).filter(item => selectedRules.includes(item.name))" x-bind:key="rule.name">
                  <details class="group rounded-xl border border-primary-100 dark:border-primary-900/70 bg-primary-50/40 dark:bg-primary-950/20 overflow-hidden">
                    <summary class="list-none cursor-pointer px-3 py-3 flex items-center gap-3">
                      <span class="text-gray-400 transition-transform group-open:rotate-90">
                        <i class="fas fa-chevron-right text-xs"></i>
                      </span>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-3">
                          <span class="font-semibold text-sm text-gray-900 dark:text-white truncate" x-text="rule.label"></span>
                          <span class="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-900" x-text="rule.action"></span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1" x-text="`${rule.description} · ${rule.entries.length} 条`"></div>
                      </div>
                    </summary>
                    <div class="border-t border-primary-100 dark:border-primary-900/70 px-3 pb-3 pt-2 space-y-2 bg-white/60 dark:bg-gray-900/40">
                      <template x-for="entry in rule.entries" x-bind:key="entry.path">
                        <div class="flex items-center justify-between gap-3 text-xs">
                          <span class="font-medium text-gray-700 dark:text-gray-200" x-text="entry.label"></span>
                          <span class="font-mono text-gray-500 dark:text-gray-400 truncate" x-text="entry.path"></span>
                        </div>
                      </template>
                    </div>
                  </details>
                </template>
                <div x-show="selectedRules.length === 0" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  暂未选择规则
                </div>
              </div>
            </section>

            <section>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <i class="fas fa-server text-gray-400"></i>
                  节点列表
                </h3>
                <span class="text-xs text-gray-500 dark:text-gray-400">共 <span x-text="managedNodes.length"></span> 个</span>
              </div>
              <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                <template x-for="node in managedNodes" x-bind:key="node.id">
                  <div class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0"></span>
                    <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100" x-text="node.name"></span>
                    <span class="px-2 py-0.5 rounded-md text-xs uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900" x-text="node.type"></span>
                  </div>
                </template>
                <div x-show="managedNodes.length === 0" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  校验源后会显示节点
                </div>
              </div>
            </section>

            <section>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <i class="fas fa-anchor text-gray-400"></i>
                  固定订阅链接
                </h3>
                <span class="text-xs font-mono text-gray-400 truncate max-w-40" x-text="subscriptionToken"></span>
              </div>
              <div x-show="!stableLinks" class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                保存订阅后在这里复制客户端链接
              </div>
              <div x-cloak x-show="stableLinks" class="space-y-3">
                {LINK_FIELDS.map((field) => (
                  <div class="relative group" key={`stable-preview-${field.key}`}>
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t(field.labelKey)}
                    </label>
                    <div class="flex gap-2">
                      <input
                        type="text"
                        readonly
                        x-bind:value={`stableLinks?.${field.key} || ''`}
                        class="w-full px-3 py-2 rounded-lg border border-primary-100 dark:border-primary-900/60 bg-primary-50/50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-mono text-xs text-primary-700 dark:text-primary-300"
                      />
                      <button
                        type="button"
                        x-on:click={`navigator.clipboard.writeText(stableLinks?.${field.key}); copiedStable = '${field.key}'; setTimeout(() => copiedStable = null, 2000)`}
                        class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200 flex items-center justify-center"
                        x-bind:class={`{'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300': copiedStable === '${field.key}'}`}
                        title="复制链接"
                      >
                        <i class="fas" x-bind:class={`copiedStable === '${field.key}' ? 'fa-check' : 'fa-copy'`}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div class="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              x-on:click="saveSubscription()"
              x-bind:disabled="savingSubscription || !currentUser"
              class="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <i class="fas" x-bind:class="savingSubscription ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              <span x-text="activeSubscriptionId ? '更新订阅' : '保存订阅'">保存订阅</span>
            </button>
            <button
              type="button"
              x-on:click="resetSubscriptionDraft()"
              class="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold flex items-center justify-center gap-2"
            >
              <i class="fas fa-plus"></i>
              新建
            </button>
            <button
              type="button"
              x-show="activeSubscriptionId"
              x-on:click="deleteSubscription()"
              class="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold flex items-center justify-center gap-2"
            >
              <i class="fas fa-trash"></i>
              删除
            </button>
          </div>
        </div>
      </aside>
      </div>

  <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </div>
  );
};
