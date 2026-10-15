const valid=id=>/^[A-Za-z0-9_-]{1,128}$/.test(id||'');
const key=uid=>'rfRecentSchoolsV1:'+uid;
export function recentSchools(uid){if(!uid)return [];try{const rows=JSON.parse(localStorage.getItem(key(uid))||'[]');return Array.isArray(rows)?rows.filter(s=>valid(s.id)&&typeof s.name==='string').slice(0,12):[]}catch{return []}}
export function rememberSchool(uid,school){if(!uid||!valid(school.id))return;try{localStorage.setItem(key(uid),JSON.stringify([{id:school.id,name:String(school.name).slice(0,120)},...recentSchools(uid).filter(s=>s.id!==school.id)].slice(0,12)))}catch{}}
export function forgetSchool(uid,id){try{localStorage.setItem(key(uid),JSON.stringify(recentSchools(uid).filter(s=>s.id!==id)))}catch{}}
