const fs=require('fs');
const legacy=fs.readFileSync('firebase/privacy.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/progress.rules.fragment','utf8');
const rules="rules_version = '2';\nservice cloud.firestore { match /databases/{database}/documents {\n"+legacy+fs.readFileSync('firebase/owner.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/membership.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/classroom-catalog.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/classroom.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/join.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/staff.rules.fragment','utf8')+'\n}}\n';
fs.writeFileSync('firebase/owner-test.rules',rules);
fs.writeFileSync('preview/owner/access-rules.txt',rules);
