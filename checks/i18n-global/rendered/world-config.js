/* World content/configuration boundary. A future admin API can supply this object.
   enabled:false removes a module from navigation and discovery, without empty slots.
   status:'preview' keeps a reviewable future surface; no payment or publishing occurs.
   This file contains no account data. Local follows/progress are stored separately. */
window.SHIYU_WORLD_CONFIG={
  version:1,
  modules:{
    resources:{enabled:true,label:"Resources",icon:'compass'},
    learning:{enabled:true,label:"Learning paths",icon:'book'},
    materials:{enabled:true,label:"Creative tools",icon:'shapes'},
    creators:{enabled:false,label:"Creator picks",icon:'people',status:'preview'},
    collaboration:{enabled:true,label:"Contribute",icon:'branch',status:'preview'}
  },
  features:{subscriptions:{enabled:true,status:'preview'},publishing:{enabled:true,status:'preview'}},
  topics:[{id:'all',label:"All",icon:'compass'},{id:'ai',label:"AI & Tech",icon:'spark'},{id:'design',label:"Design & Art",icon:'shapes'},{id:'business',label:"Work & Business",icon:'briefcase'},{id:'life',label:"Learning & Life",icon:'leaf'}],
  resources:[
    {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/',desc:"Start with a question and think it through with AI.",topic:'ai',type:"AI tools",mark:'D'},
    {id:'kimi',name:'Kimi',url:'https://www.kimi.com/',desc:"Read, clarify your thoughts and keep exploring.",topic:'ai',type:"AI tools",mark:'K'},
    {id:'hugging',name:'Hugging Face',url:'https://huggingface.co/',desc:"Discover open models, datasets and community projects.",topic:'ai',type:"Open community",mark:'H'},
    {id:'github',name:'GitHub',url:'https://github.com/',desc:"See what developers are building and find open-source projects.",topic:'ai',type:"Open source",mark:'G'},
    {id:'elements',name:'Elements of AI',url:'https://course.elementsofai.com/',desc:"Learn the basics of AI, step by step.",topic:'ai',type:"Intro course · English",mark:'E'},
    {id:'deeplearning',name:'DeepLearning.AI',url:'https://www.deeplearning.ai/courses?types=short_course',desc:"Choose a topic and explore more AI courses.",topic:'ai',type:"Courses & Videos · English",mark:'AI'},
    {id:'arena',name:'Are.na',url:'https://www.are.na/',desc:"Follow others' collections to new inspiration.",topic:'design',type:"Inspiration",mark:'A'},
    {id:'figma',name:'Figma',url:'https://www.figma.com/',desc:"Turn ideas into designs and refine them together.",topic:'design',type:"Design tools",mark:'F'},
    {id:'lucide',name:'Lucide',url:'https://lucide.dev/',desc:"Clean, consistent line icons for the finishing touches.",topic:'design',type:"Icons",mark:'L',material:true},
    {id:'tabler',name:'Tabler Icons',url:'https://tabler.io/icons',desc:"Browse open-source icons and find your fit.",topic:'design',type:"Icons",mark:'T',material:true},
    {id:'fonts',name:'Google Fonts',url:'https://fonts.google.com/',desc:"Find the right font for your next project.",topic:'design',type:"Fonts",mark:'Aa',material:true},
    {id:'svg',name:'SVG Viewer',url:'https://www.svgviewer.dev/',desc:"Preview, edit and optimize SVG files.",topic:'design',type:"Creative tools",mark:'S',material:true},
    {id:'notion',name:'Notion',url:'https://www.notion.so/',desc:"Keep notes, projects and daily plans together.",topic:'business',type:"Productivity",mark:'N'},
    {id:'yc',name:'Y Combinator Library',url:'https://www.ycombinator.com/library',desc:"Learn about products and business from founders.",topic:'business',type:"Articles & Videos",mark:'Y'},
    {id:'ted',name:'TED',url:'https://www.ted.com/',desc:"Hear an idea from a different field.",topic:'life',type:"Talks & Videos",mark:'T'},
    {id:'khan',name:'Khan Academy',url:'https://www.khanacademy.org/',desc:"Learn something new at your own pace.",topic:'life',type:"Learning platform",mark:'K'},
    {id:'mooc',name:"China University MOOC",url:'https://www.icourse163.org/',desc:"Find your next interest in university courses.",topic:'life',type:"Course platform",mark:"L"},
    {id:'mdn',name:'MDN Web Docs',url:'https://developer.mozilla.org/zh-CN/',desc:"Learn web technologies with open-web documentation.",topic:'ai',type:"Dev docs",mark:'M'}
  ],
  collections:[
    {id:'ai-start',title:"Let curiosity lead you to AI",subtitle:"Tools, concepts and practice. Take your first step here.",topic:'ai',icon:'spark',tone:'sage',eyebrow:"AI Starter Guide",source:"Creator picks",resourceIds:['deepseek','kimi','elements','deeplearning','hugging','github'],note:"Try a tool with a real question, then take an introductory course to learn how it works."},
    {id:'design-kit',title:"A little inspiration for your next creation",subtitle:"From references to resources, give your ideas shape.",topic:'design',icon:'shapes',tone:'sand',eyebrow:"The Designer's Kit",source:"Creator picks",resourceIds:['arena','figma','lucide','tabler','fonts','svg'],note:"Gather references, define your idea, then choose icons, fonts and tools. Check each source for usage terms."},
    {id:'solo-work',title:"Do good work, even on your own",subtitle:"Organize work, understand products and build your own approach.",topic:'business',icon:'briefcase',tone:'blue',eyebrow:"Independent Work Guide",source:"Sample community collection",author:"Slow Studio",resourceIds:['notion','yc','figma','github'],note:"A sample community collection. Track goals with simple tools and test ideas against real examples."},
    {id:'open-life',title:"Leave room for the unknown",subtitle:"Hear a talk. Start that course you've been meaning to take.",topic:'life',icon:'leaf',tone:'rose',eyebrow:"A Curiosity List",source:"Creator picks",resourceIds:['ted','khan','mooc','arena'],note:"No need to start everything at once. Pick a question that intrigues you and begin there."}
  ],
  routes:[
    {id:'learn-ai',title:"AI Basics: From Asking to Doing",topic:'ai',icon:'spark',desc:"Try it first, then bring your questions to a course.",level:"Beginner",steps:[{title:"Ask AI a real question",desc:"Choose a familiar topic and compare its answer with your own judgment.",resource:'deepseek'},{title:"Organize a set of materials",desc:"Read with a goal. Practice asking, checking and summarizing.",resource:'kimi'},{title:"Start with an AI course",desc:"Explore the basics chapter by chapter on Elements of AI. The course is in English.",resource:'elements'},{title:"Pick a direction and go deeper",desc:"Browse DeepLearning.AI for foundational and practical courses that suit you.",resource:'deeplearning'}]},
    {id:'learn-business',title:"Turn an idea into a small project",topic:'business',icon:'briefcase',desc:"Understand the need, list assumptions and build a prototype you can show.",level:"Beginner",steps:[{title:"Learn from founders",desc:"Explore YC's articles and videos on a product or user topic.",resource:'yc'},{title:"Write down questions and assumptions",desc:"Define your users, their current approach and what you need to test.",resource:'notion'},{title:"Sketch a solution",desc:"Use a small prototype to explain your idea.",resource:'figma'}]},
    {id:'learn-web',title:"Build your first webpage",topic:'ai',icon:'code',desc:"Start with the basics and practice in a small project.",level:"Beginner",steps:[{title:"Learn what makes a webpage",desc:"Read MDN's learning materials, starting with HTML and CSS.",resource:'mdn'},{title:"Choose icons for your page",desc:"Pick a consistent icon set and keep it simple.",resource:'lucide'},{title:"See how others build",desc:"Read open-source projects and keep notes on what you learn.",resource:'github'}]}
  ],
  creators:[
    {id:'slow',name:"Slow Studio",initial:"S",tag:"Independent work · Business ideas",desc:"Organize useful tools and methods into lists worth revisiting.",collection:'solo-work',promise:"Curated topics, resource notes and updates"},
    {id:'curious',name:"Curiosity Desk",initial:"C",tag:"Explore AI · Learning paths",desc:"Start with a small question and find a direction worth exploring.",collection:'ai-start',promise:"Beginner paths, practice tasks and extra resources"}
  ],
  projects:[
    {id:'open-ai',title:"Build an AI starter map together",desc:"Turn resources you've used into a path a beginner can follow.",topic:'ai',needs:["Recommend resources","Experience notes","Maintain paths"]},
    {id:'open-design',title:"Build a creative resource list",desc:"Collect icons, fonts and tools with usage notes and source information.",topic:'design',needs:["Curate resources","Check links","Maintain categories"]}
  ]
};
