(function(root){
 const field=(key,label,value,min,max,step=.1)=>({key,label,value,min,max,step});
 const catalog=[
 {id:'particleLife',name:'粒子生命',en:'PARTICLE LIFE',title:'微小之间，\n生长万千。',intro:'相吸，相斥。让一片微光自己找到秩序。',hint:'划过画面拨动粒子，点击添入一团。',icon:'lib-Sparkles',tools:[['stir','拨动'],['add','添加一团']],action:'换一种规则',fields:[field('count','粒子数量',360,120,600,30),field('attraction','吸引强度',1,.2,2),field('speed','运动速度',1,.3,2)]},
 {id:'ecoGarden',name:'生态沙盘',en:'LIVING GARDEN',title:'一隅草木，\n自成天地。',intro:'撒下一点生机，看小世界慢慢生长。',hint:'选一种生命，在画面里轻轻放下。',icon:'lib-Sprout',tools:[['plant','撒种子'],['water','加水'],['prey','食草动物'],['predator','捕食者']],action:'下一场雨',fields:[field('growth','草木生长',1,.2,2),field('herbivores','食草动物',24,0,70,1),field('predators','捕食者',3,0,12,1)]},
 {id:'elementSandbox',name:'元素沙盒',en:'ELEMENT PLAY',title:'指尖落下，\n万物相遇。',intro:'堆一座山，引一条河，点亮一簇火。',hint:'选一种元素，按住画面自由涂画。',icon:'lib-Flame',tools:[['sand','沙'],['water','水'],['fire','火'],['seed','种子'],['wall','墙'],['erase','擦除']],action:'清空画面',fields:[field('brush','画笔大小',3,1,8,1),field('speed','演化速度',1,.3,2)]},
 {id:'softFabric',name:'弹性织物',en:'SOFT FABRIC',title:'轻轻牵动，\n柔软回应。',intro:'让风穿过织物，把一瞬间留在指尖。',hint:'拖动布料，或切换剪开、固定。',icon:'lib-Waves',tools:[['pull','拉扯'],['cut','剪开'],['pin','固定']],action:'松开固定点',fields:[field('elasticity','柔软程度',.65,.2,1),field('wind','风力',.7,0,2)]},
 {id:'magnetGarden',name:'磁力花园',en:'MAGNET GARDEN',title:'看不见的力，\n留下形状。',intro:'移动一枚磁铁，让细碎微光重新排列。',hint:'拖动磁铁，观察磁场怎样变化。',icon:'lib-Magnet',tools:[['move','移动'],['add','添加磁铁'],['flip','反转磁极']],action:'反转磁极',fields:[field('strength','磁力强度',1,.2,2),field('count','铁屑数量',480,120,900,60)]},
 {id:'digitalLife',name:'数字生命',en:'DIGITAL LIFE',title:'一点养分，\n一种新生。',intro:'照料一片柔软的生命，看它长出自己的形状。',hint:'投放生命、补充养分，或画一道屏障。',icon:'lib-Flower2',tools:[['seed','投放生命'],['food','补充养分'],['wall','屏障'],['erase','擦除']],action:'播下新生命',fields:[field('nutrition','养分浓度',.6,.1,1.2),field('vitality','生命活力',.6,.1,1.2),field('speed','生长速度',1,.3,2)]}
 ];
 root.ShiyuPlaygroundCatalog=catalog;if(typeof module!=='undefined')module.exports=catalog;
})(typeof window==='undefined'?globalThis:window);
