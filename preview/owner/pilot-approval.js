// Uses existing school/audit, staff invitation and pilot status permissions.
// Deterministic IDs make retries and concurrent owner clicks converge.
export async function approvePilot(api,row,values,progress=()=>{}) {
 if(!await api.access())throw Error('Platform owner access is required.');
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(row.id))throw Error('Invalid application identifier.');
 if(row.status==='closed')throw Error('Reopen the application before approving it.');
 const id='pilot_'+row.id,token='pilot_'+row.id+'_staff';
 const all=await api.schools();let school=all.find(s=>s.id===id);
 if(!school){
  progress('Creating the pilot school…');
  try{await api.saveSchool(id,{...values,status:'pilot',plan:'pilot'},0);}catch(e){
   // A concurrent approval may have created the same school. Only continue if it exists.
   const fresh=await api.schools();if(!fresh.some(s=>s.id===id))throw e;
  }
  school=(await api.schoolContext(id)).school;
 }
 // An existing school is never silently overwritten by a retry.
 const now=Date.now();if(!['pilot','active'].includes(school.status)||school.license.startsOn.toMillis()>now||school.license.endsOn.toMillis()<=now)throw Error('The school is saved, but its license is not active today. Open the school to adjust dates/status, then retry.');
 progress('Preparing the staff invitation…');
 let invites=await api.staffInvitations.list(id),invite=invites.find(i=>i.token===token);
 if(!invite){
  try{await api.staffInvitations.create(id,school.name,row.email,values.role,token);}catch(e){
   invites=await api.staffInvitations.list(id);if(!invites.some(i=>i.token===token))throw e;
  }
  invite=(await api.staffInvitations.list(id)).find(i=>i.token===token);
 }
 if(!invite||invite.email!==row.email.trim().toLowerCase())throw Error('The saved invitation does not match this application. Review the school’s invitations.');
 if(invite.state==='revoked'||(invite.state==='pending'&&invite.expiresAt.toMillis()<=Date.now()))throw Error('This invitation expired or was revoked. Open the school to issue a replacement; the existing school has been preserved.');
 progress('Updating the application…');
 try{await api.pilot.status(row.id,'invited',row.status);}catch(e){
  const fresh=(await api.pilot.list()).find(a=>a.id===row.id);if(fresh?.status!=='invited')throw Error('The school and invitation are saved, but the application status changed. Refresh before retrying.');
 }
 return {school,invite};
}
