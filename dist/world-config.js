/* World content/configuration boundary. A future admin API can supply this object.
   enabled:false removes a module from navigation and discovery, without empty slots.
   status:'preview' keeps a reviewable future surface; no payment or publishing occurs.
   This file contains no account data. Local follows/progress are stored separately. */
window.SHIYU_WORLD_CONFIG={
  version:1,
  modules:{
    resources:{enabled:true,label:'资源库',icon:'compass'},
    learning:{enabled:true,label:'学习路线',icon:'book'},
    materials:{enabled:true,label:'素材工具',icon:'shapes'},
    creators:{enabled:true,label:'创作者',icon:'people',status:'preview'},
    collaboration:{enabled:true,label:'一起共建',icon:'branch',status:'preview'}
  },
  features:{subscriptions:{enabled:true,status:'preview'},publishing:{enabled:true,status:'preview'}},
  topics:[{id:'all',label:'全部',icon:'compass'},{id:'ai',label:'AI 与科技',icon:'spark'},{id:'design',label:'设计与创作',icon:'shapes'},{id:'business',label:'商业与工作',icon:'briefcase'},{id:'life',label:'知识与生活',icon:'leaf'}],
  resources:[
    {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/',desc:'从一个问题开始，尝试与 AI 一起思考。',topic:'ai',type:'AI 工具',mark:'D'},
    {id:'kimi',name:'Kimi',url:'https://www.kimi.com/',desc:'读一份资料，理清思路，再继续探索。',topic:'ai',type:'AI 工具',mark:'K'},
    {id:'hugging',name:'Hugging Face',url:'https://huggingface.co/',desc:'发现开放模型、数据集与社区项目。',topic:'ai',type:'开放社区',mark:'H'},
    {id:'github',name:'GitHub',url:'https://github.com/',desc:'看看开发者正在创造什么，找到有趣的开源项目。',topic:'ai',type:'开源项目',mark:'G'},
    {id:'elements',name:'Elements of AI',url:'https://course.elementsofai.com/',desc:'从基础概念开始，循序了解人工智能。',topic:'ai',type:'入门课程 · 英文',mark:'E'},
    {id:'deeplearning',name:'DeepLearning.AI',url:'https://www.deeplearning.ai/courses?types=short_course',desc:'选择一个感兴趣的方向，继续学习 AI 专题课程。',topic:'ai',type:'课程与视频 · 英文',mark:'AI'},
    {id:'arena',name:'Are.na',url:'https://www.are.na/',desc:'沿着别人的收藏，连接新的灵感。',topic:'design',type:'灵感收藏',mark:'A'},
    {id:'figma',name:'Figma',url:'https://www.figma.com/',desc:'把想法变成设计，与伙伴一起完善。',topic:'design',type:'设计工具',mark:'F'},
    {id:'lucide',name:'Lucide',url:'https://lucide.dev/',desc:'简洁一致的线性图标，为界面补上细节。',topic:'design',type:'图标素材',mark:'L',material:true},
    {id:'tabler',name:'Tabler Icons',url:'https://tabler.io/icons',desc:'浏览和选择适合你的开源图标。',topic:'design',type:'图标素材',mark:'T',material:true},
    {id:'fonts',name:'Google Fonts',url:'https://fonts.google.com/',desc:'为下一个作品，找到合适的字体。',topic:'design',type:'字体素材',mark:'Aa',material:true},
    {id:'svg',name:'SVG Viewer',url:'https://www.svgviewer.dev/',desc:'预览、编辑与优化 SVG 文件。',topic:'design',type:'素材工具',mark:'S',material:true},
    {id:'notion',name:'Notion',url:'https://www.notion.so/',desc:'把笔记、项目与日常计划放在一起。',topic:'business',type:'效率工具',mark:'N'},
    {id:'yc',name:'Y Combinator Library',url:'https://www.ycombinator.com/library',desc:'从创业者的经验中，认识产品与商业。',topic:'business',type:'文章与视频',mark:'Y'},
    {id:'ted',name:'TED',url:'https://www.ted.com/',desc:'听一个来自不同领域的想法。',topic:'life',type:'演讲与视频',mark:'T'},
    {id:'khan',name:'Khan Academy',url:'https://www.khanacademy.org/',desc:'按照自己的节奏，重新认识一门知识。',topic:'life',type:'学习平台',mark:'K'},
    {id:'mooc',name:'中国大学 MOOC',url:'https://www.icourse163.org/',desc:'从大学课程里，找到下一个感兴趣的方向。',topic:'life',type:'课程平台',mark:'学'},
    {id:'mdn',name:'MDN Web Docs',url:'https://developer.mozilla.org/zh-CN/',desc:'学习网页技术，查阅开放网络的开发文档。',topic:'ai',type:'开发文档',mark:'M'}
  ],
  collections:[
    {id:'ai-start',title:'从好奇开始，认识 AI',subtitle:'工具、原理与实践，从这里迈出第一步。',topic:'ai',icon:'spark',tone:'sage',eyebrow:'AI 入门指南',source:'平台精选',resourceIds:['deepseek','kimi','elements','deeplearning','hugging','github'],note:'先试用一种工具，带着实际问题探索，再选择一门入门课程，了解它背后的原理。'},
    {id:'design-kit',title:'给创作，添一点灵感',subtitle:'从参考到素材，让想法慢慢有形状。',topic:'design',icon:'shapes',tone:'sand',eyebrow:'设计师的工具箱',source:'平台精选',resourceIds:['arena','figma','lucide','tabler','fonts','svg'],note:'先收集参考，明确作品的表达，再选择图标、字体和工具。素材的使用范围请以原站说明为准。'},
    {id:'solo-work',title:'一个人，也能把事做好',subtitle:'整理工作、理解产品，积累自己的方法。',topic:'business',icon:'briefcase',tone:'blue',eyebrow:'独立工作手册',source:'社区合集示例',author:'慢慢工作室',resourceIds:['notion','yc','figma','github'],note:'这是社区合集的展示示例。用一套轻量工具记录目标，用真实案例检验自己的想法。'},
    {id:'open-life',title:'给生活，留一点未知',subtitle:'听一场演讲，开始一门久违的课。',topic:'life',icon:'leaf',tone:'rose',eyebrow:'好奇心清单',source:'平台精选',resourceIds:['ted','khan','mooc','arena'],note:'不必同时开始很多事。挑一个真正好奇的问题，把它作为这次探索的起点。'}
  ],
  routes:[
    {id:'learn-ai',title:'AI 入门，从会问到会用',topic:'ai',icon:'spark',desc:'先动手体验，再带着问题去学一门课程。',level:'入门',steps:[{title:'先和 AI 聊一个真实问题',desc:'选择一个你熟悉的问题，比较回答与自己的判断。',resource:'deepseek'},{title:'用资料完成一次整理',desc:'带着阅读目标，练习提问、核对和总结。',resource:'kimi'},{title:'从一门入门课认识 AI',desc:'前往 Elements of AI，按章节了解基础概念。课程为英文内容。',resource:'elements'},{title:'挑一个方向，继续深入',desc:'浏览 DeepLearning.AI 的专题课程，选择适合自己的基础与实践内容。',resource:'deeplearning'}]},
    {id:'learn-business',title:'从想法走向一个小项目',topic:'business',icon:'briefcase',desc:'理解需求、整理假设，再做一份看得见的原型。',level:'入门',steps:[{title:'听听创业者的经验',desc:'前往 YC 的文章与视频库，选择一个产品或用户话题。',resource:'yc'},{title:'写下你的问题与假设',desc:'整理目标用户、现有做法与需要验证的问题。',resource:'notion'},{title:'把解决方法画出来',desc:'用一个小原型，把自己的想法讲清楚。',resource:'figma'}]},
    {id:'learn-web',title:'做出你的第一张网页',topic:'ai',icon:'code',desc:'从基础文档出发，在一个小作品里练习。',level:'入门',steps:[{title:'认识网页的组成',desc:'阅读 MDN 学习资料，从 HTML 和 CSS 开始。',resource:'mdn'},{title:'为页面选择图标',desc:'挑选一套一致的图标，保持表达简洁。',resource:'lucide'},{title:'看看别人如何实现',desc:'阅读开源项目，记录你的学习过程。',resource:'github'}]}
  ],
  creators:[
    {id:'slow',name:'慢慢工作室',initial:'慢',tag:'独立工作 · 商业思考',desc:'把有用的工具和工作方法，整理成可以反复翻阅的清单。',collection:'solo-work',promise:'专题整理、资源说明与后续更新'},
    {id:'curious',name:'好奇心编辑部',initial:'好',tag:'AI 探索 · 学习路线',desc:'从一个小问题开始，陪你找到值得继续探索的方向。',collection:'ai-start',promise:'入门路线、实践任务与资源补充'}
  ],
  projects:[
    {id:'open-ai',title:'一起整理 AI 入门地图',desc:'把你用过、学过的资源，整理成下一位新手看得懂的路线。',topic:'ai',needs:['资源推荐','体验笔记','路线维护']},
    {id:'open-design',title:'共建一份创作素材清单',desc:'收集图标、字体与创作工具，记录用途和原站说明。',topic:'design',needs:['素材整理','链接检查','分类维护']}
  ]
};
