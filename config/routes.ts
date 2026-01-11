/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 SysUser
 * @doc https://umijs.org/docs/guides/routes
 */

export default [
  {
    path: '/login-old',
    layout: false,
    component: './login/Login'
  },
  {
    path: '/login-v2',
    layout: false,
    component: './login/LoginV2'
  },
  {
    path: '/login',
    layout: false,
    component: './login/LoginV3'
  },
  {
    title: '首页',
    name: '首页',
    path: '/dashboard',
    icon: 'home',
    component: './Dashboard',
    closable: false
  },
  // {
  //   title: '首页V2',
  //   name: '首页V2',
  //   path: '/dashboard',
  //   icon: 'dashboard',
  //   component: './DashboardV2',
  // },
  {
    title: '基础数据',
    name: '基础数据',
    path: '/basic-data',
    icon: 'database',
    routes: [
      {
        title: '能源类型',
        name: '能源类型',
        path: '/basic-data/energy-type',
        component: './BasicData/EnergyType',
      },
      {
        title: '计量器具管理',
        name: '计量器具管理',
        path: '/basic-data/meter',
        component: './BasicData/Meter',
      },
      {
        title: '用能单元管理',
        name: '用能单元管理',
        path: '/basic-data/energy-unit',
        component: './BasicData/EnergyUnit',
      },
      {
        title: '采集点位管理',
        name: '采集点位管理',
        path: '/basic-data/meter-point',
        component: './BasicData/MeterPoint',
      },
      {
        title: '电价策略',
        name: '电价策略',
        path: '/basic-data/price-policy',
        component: './BasicData/PricePolicy',
      },
      {
        title: '报警限值类型',
        name: '报警限值类型',
        path: '/basic-data/alarm-limit-type',
        component: './BasicData/AlarmLimitType',
      },
    ],
  },
  {
    title: '报警管理',
    name: '报警管理',
    path: '/alarm',
    icon: 'alert',
    routes: [
      {
        title: '预报警配置',
        name: '预报警配置',
        path: '/alarm/config',
        component: './BasicData/AlarmConfig',
      },
      {
        title: '报警历史记录',
        name: '报警历史记录',
        path: '/alarm/records',
        component: './BasicData/AlarmRecord',
      },
    ],
  },
  {
    title: '统计分析',
    name: '统计分析',
    path: '/statistics',
    icon: 'lineChart',
    routes: [
      {
        path: '/statistics',
        redirect: '/statistics/energy',
      },
      {
        title: '能耗统计',
        name: '能耗统计',
        path: '/statistics/energy',
        component: './Statistics',
      },
      {
        title: '综合能耗分析',
        name: '综合能耗分析',
        path: '/statistics/comprehensive',
        component: './Statistics/Comprehensive',
      },
      {
        title: '能耗排名分析',
        name: '能耗排名分析',
        path: '/statistics/ranking',
        component: './Statistics/Ranking',
      },
      {
        title: '碳排放分析',
        name: '碳排放分析',
        path: '/statistics/carbon',
        component: './CarbonEmission',
      },
      {
        title: '尖峰平谷分析',
        name: '尖峰平谷分析',
        path: '/statistics/peak-valley',
        component: './PeakValley',
      },
      {
        title: '工序能耗分析',
        name: '工序能耗分析',
        path: '/statistics/process-energy',
        component: './Statistics/ProcessEnergy',
      },
      {
        title: '单耗分析',
        name: '单耗分析',
        path: '/statistics/unit-consumption',
        component: './Statistics/UnitConsumption',
      },
      {
        title: '支路能耗分析',
        name: '支路能耗分析',
        path: '/statistics/branch',
        component: './Statistics/BranchAnalysis',
      },
      {
        title: '对标分析',
        name: '对标分析',
        path: '/statistics/benchmark-analysis',
        component: './Statistics/BenchmarkAnalysis',
      },
    ],
  },
  {
    title: '生产管理',
    name: '生产管理',
    path: '/production',
    icon: 'tool',
    routes: [
      {
        path: '/production',
        redirect: '/production/record',
      },
      {
        title: '产品产量管理',
        name: '产品产量管理',
        path: '/production/record',
        component: './Production/Record',
      },
    ],
  },
  {
    title: '知识库',
    name: '知识库',
    path: '/knowledge',
    icon: 'book',
    component: './Knowledge',
  },
  {
    title: '节能管理',
    name: '节能管理',
    path: '/energy-saving',
    icon: 'bulb',
    routes: [
      {
        path: '/energy-saving',
        redirect: '/energy-saving/project',
      },
      {
        title: '节能项目',
        name: '节能项目',
        path: '/energy-saving/project',
        component: './EnergySaving/Project',
      },
      {
        title: '政策法规',
        name: '政策法规',
        path: '/energy-saving/policy',
        component: './EnergySaving/Policy',
      },
      {
        title: '对标管理',
        name: '对标管理',
        path: '/energy-saving/benchmark',
        component: './EnergySaving/Benchmark',
      },
    ],
  },
  {
    title: '成本管理',
    name: '成本管理',
    path: '/cost-management',
    icon: 'dollar',
    routes: [
      {
        path: '/cost-management',
        redirect: '/cost-management/policy-binding',
      },
      {
        title: '策略绑定',
        name: '策略绑定',
        path: '/cost-management/policy-binding',
        component: './CostManagement/PolicyBinding',
      },
      {
        title: '成本记录',
        name: '成本记录',
        path: '/cost-management/cost-record',
        component: './CostManagement/CostRecord',
      },
      {
        title: '偏差分析',
        name: '偏差分析',
        path: '/cost-management/deviation',
        component: './CostManagement/DeviationAnalysis',
      },
      {
        title: '成本趋势',
        name: '成本趋势',
        path: '/cost-management/trend',
        component: './CostManagement/TrendAnalysis',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/test',
    layout: false,
    component: './Test'
  },
  {
    path: '/404',
    component: './404'
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
  {
    title: '系统管理',
    name: '系统管理',
    path: '/system',
    icon: 'setting',
    routes: [
      {
        path: '/system',
        redirect: '/system/user'
      },
      {
        title: '用户管理',
        name: '用户管理',
        path: '/system/user',
        icon: 'user',
        component: './system/User',
        access: 'canAccess',
        permissions: ['system:user:list']
      },
      {
        title: '角色管理',
        name: '角色管理',
        path: '/system/role',
        icon: 'team',
        component: './system/Role',
        access: 'canAccess',
        permissions: ['system:role:list']
      },
      {
        title: '部门管理',
        name: '部门管理',
        path: '/system/dept',
        icon: 'cluster',
        component: './system/Dept',
        access: 'canAccess',
        permissions: ['system:dept:list']
      },
      {
        title: '组织管理',
        name: '组织管理',
        path: '/system/org',
        icon: 'cluster',
        component: './system/Org'
      },
      {
        title: '岗位管理',
        name: '岗位管理',
        path: '/system/post',
        icon: 'idcard',
        component: './system/Post',
        access: 'canAccess',
        permissions: ['system:post:list']
      }
    ]
  }
];
