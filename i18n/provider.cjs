// External machine translation has been retired. Reviewed dictionaries remain available.
function createProvider(){const disabled=async()=>{throw new Error('自动翻译已停用，请编辑译文并审核后发布')};return {status:()=>({name:'Editorial',configured:false,url:'',hasKey:false,source:'disabled'}),test:disabled,save:disabled,translate:disabled}}
module.exports={createProvider};
