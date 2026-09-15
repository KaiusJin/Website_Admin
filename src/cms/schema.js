const field=(key,label,type='text',translated=false)=>({key,label,type,translated});
const title=field('title','Title','text',true),bullets=field('bullets','Highlights · one per line','bullets',true),skills=field('skills','Technologies · one per line','tags'),link=field('link','Website URL','url'),linkText=field('link_text','Link label','text',true);
const dates=[field('start_date','Start date'),field('end_date','End date'),field('is_present','Ongoing','checkbox'),field('date_badge','Date label','text',true)];
export const schemas={
 projects:{label:'Projects',fields:[title,...dates,bullets,skills,field('github_link','GitHub URL','url'),link,linkText,field('image_url','Cover image URL','url'),field('image_alt','Cover description','text',true)]},
 experiences:{label:'Experience',fields:[title,field('role','Role','text',true),field('role_icon','Role icon'),...dates,bullets,skills,link,linkText]},
 awards:{label:'Awards',fields:[title,field('organization','Organization','text',true),field('year','Year'),field('description','Description','textarea',true),bullets,link,linkText]},
 skills:{label:'Skills',fields:[field('category','Category','text',true),field('category_slug','Category slug'),skills]},
 site_profile:{label:'Profile & contact',singleton:true,fields:[field('heading','Heading','text',true),field('intro','Introduction','textarea',true),field('bio','Biography','textarea',true),field('location','Location','text',true),field('email','Email','email'),field('github','GitHub URL','url'),field('linkedin','LinkedIn URL','url'),field('resume_url','Resume PDF URL','url')]},
 personal_entries:{label:'Personal journal',fields:[field('kind','Category','kind'),title,field('body','Story','textarea',true),field('date','Date','date'),field('images','Photo gallery','images',true),field('external_url','Music / related URL','url')]},
 journey_scene_content:{label:'Scene descriptions',fields:[field('scene_id','Scene','scene'),title,field('description','Description','textarea',true)]}
};
export const kinds=['photography','travel','daily','music'];
export const scenes=['cottage','meadow','town','library','academy','lake','station'];
export function cleanPayload(table,value){
 const out={};for(const f of schemas[table].fields)if(value[f.key]!==undefined)out[f.key]=value[f.key];
 out.translations={'zh-CN':Object.fromEntries(schemas[table].fields.filter(f=>f.translated).map(f=>[f.key,value.translations?.['zh-CN']?.[f.key]]).filter(([,v])=>v!==undefined))};
 out.visibility=value.visibility||'public';out.order=Number(value.order)||0;return out;
}
export function validate(table,payload){
 const errors=[];
 const required=table==='skills'?'category':table==='site_profile'?'heading':'title';
 if(!payload[required]?.trim())errors.push('An English '+required+' is required.');
 if(table==='personal_entries'&&!kinds.includes(payload.kind))errors.push('Choose a journal category.');
 if(table==='journey_scene_content'&&!scenes.includes(payload.scene_id))errors.push('Choose a scene.');
 if(!['public','private','draft','archived'].includes(payload.visibility))errors.push('Choose visibility.');
 const urlCheck=(v,label)=>{if(v){try{if(!['https:','http:'].includes(new URL(v).protocol))throw Error();}catch{errors.push(label+' must be a full HTTP(S) URL.');}}};
 for(const f of schemas[table].fields){
  if(f.type==='url')urlCheck(payload[f.key],f.label);
  if(f.type==='images')for(const [i,img]of(payload[f.key]||[]).entries()){urlCheck(img.url,'Photo '+(i+1));if(!img.alt?.trim())errors.push('Each photo needs a description.');}
 }
 if(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))errors.push('Enter a valid email.');
 return errors;
}
