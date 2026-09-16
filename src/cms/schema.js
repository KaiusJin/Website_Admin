const field=(key,label,type='text')=>({key,label,type});
const title=field('title','Title'),bullets=field('bullets','Highlights · one per line','bullets'),skills=field('skills','Technologies · one per line','tags'),link=field('link','Website URL','url'),linkText=field('link_text','Link label');
const dates=[field('start_date','Start date'),field('end_date','End date'),field('is_present','Ongoing','checkbox'),field('date_badge','Date label')];
const experienceFields=[title,field('role','Role'),field('role_icon','Role icon'),...dates,bullets,skills,link,linkText];

export const schemas={
 projects:{label:'Projects',fields:[title,...dates,bullets,skills,field('github_link','GitHub URL','url'),link,linkText,field('image_url','Cover image URL','url'),field('image_alt','Cover description')]},
 work_experiences:{label:'Work experience',fields:experienceFields},
 club_experiences:{label:'Clubs & design teams',fields:experienceFields},
 volunteer_experiences:{label:'Volunteer experience',fields:experienceFields},
 awards:{label:'Awards',fields:[title,field('organization','Organization'),field('year','Year'),field('description','Description','textarea'),bullets,link,linkText]},
 skills:{label:'Skills',fields:[field('category','Category'),field('category_slug','Category slug'),skills]},
 site_profile:{label:'Profile & contact',singleton:true,fields:[field('heading','Heading'),field('intro','Introduction','textarea'),field('bio','Biography','textarea'),field('location','Location'),field('email','Email','email'),field('github','GitHub URL','url'),field('linkedin','LinkedIn URL','url'),field('resume_url','Resume PDF URL','url')]},
 personal_entries:{label:'Personal journal',fields:[field('kind','Category','kind'),title,field('body','Story','textarea'),field('date','Date','date'),field('images','Photo gallery','images'),field('external_url','Music / related URL','url')]},
 journey_scene_content:{label:'Scene descriptions',fields:[field('scene_id','Scene','scene'),title,field('description','Description','textarea')]}
};
export const kinds=['photography','travel','daily','music'];
export const scenes=['cottage','meadow','town','library','academy','lake','station'];

export function cleanPayload(table,value){
 const out={};
 for(const field of schemas[table].fields)if(value[field.key]!==undefined)out[field.key]=value[field.key];
 out.order=Number(value.order)||0;
 return out;
}

export function validate(table,payload){
 const errors=[];
 const required=table==='skills'?'category':table==='site_profile'?'heading':'title';
 if(!payload[required]?.trim())errors.push('A '+required+' is required.');
 if(table==='personal_entries'&&!kinds.includes(payload.kind))errors.push('Choose a journal category.');
 if(table==='journey_scene_content'&&!scenes.includes(payload.scene_id))errors.push('Choose a scene.');
 const urlCheck=(value,label)=>{if(value){try{if(!['https:','http:'].includes(new URL(value).protocol))throw Error();}catch{errors.push(label+' must be a full HTTP(S) URL.');}}};
 for(const field of schemas[table].fields){
  if(field.type==='url')urlCheck(payload[field.key],field.label);
  if(field.type==='images')for(const [index,image]of(payload[field.key]||[]).entries()){urlCheck(image.url,'Photo '+(index+1));if(!image.alt?.trim())errors.push('Each photo needs a description.');}
 }
 if(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))errors.push('Enter a valid email.');
 return errors;
}
