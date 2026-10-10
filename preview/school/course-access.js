// UI guidance only. Firestore rules independently authorize assignments, starts and results.
export function schoolCourseAccess(school,now=Date.now()){
 const license=school?.license;
 if(!Array.isArray(license?.courses)||!license.courses.includes('algebra1'))return {open:false,message:'Algebra 1 is not included in this school’s license. Ask your administrator to check course access.'};
 if(!['pilot','active'].includes(school.status))return {open:false,message:'Your school license is inactive. Saved results remain available; ask your administrator to restore practice access.'};
 const start=license.startsOn?.toMillis?.(),end=license.endsOn?.toMillis?.();
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>=end)return {open:false,message:'The school license dates need attention. Ask your administrator to check them.'};
 if(now<start)return {open:false,message:'Your school license has not started yet. Saved results remain available.'};
 if(now>=end)return {open:false,message:'Your school license has expired. Saved results remain available; ask your administrator to renew access.'};
 return {open:true,message:'Algebra 1 included · All 58 figures'};
}
export const schoolLessonCatalog=course=>course.flatMap(unit=>unit.lessons).filter(l=>l.available&&l.questions?.length);
