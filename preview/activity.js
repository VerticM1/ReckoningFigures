// Local calendar dates: UTC conversion would shift late-evening activity into tomorrow.
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function previousDate(key) {
  const [year,month,day] = key.split('-').map(Number);
  return dateKey(new Date(year,month-1,day-1,12));
}
export function markDay(days, now = new Date()) {
  return [...new Set([...(Array.isArray(days)?days:[]),dateKey(now)])].sort();
}
export function streak(days = [], now = new Date()) {
  const dates = new Set(days), today = dateKey(now);
  let cursor = dates.has(today)?today:previousDate(today), current = 0;
  while(dates.has(cursor)){current++;cursor=previousDate(cursor);}
  let best=0,run=0,last=null;
  [...dates].filter(day=>day<=today).sort().forEach(day=>{run=last===previousDate(day)?run+1:1;best=Math.max(best,run);last=day;});
  return {current,best};
}
export function weekDays(now = new Date()) {
  const start = new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  start.setDate(start.getDate()-((start.getDay()+6)%7));
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return {key:dateKey(d),label:['M','T','W','T','F','S','S'][i],name:d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})};});
}
