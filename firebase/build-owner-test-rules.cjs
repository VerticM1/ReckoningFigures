const fs=require('fs');
fs.writeFileSync('firebase/owner-test.rules',"rules_version = '2';\nservice cloud.firestore { match /databases/{database}/documents {\n"+fs.readFileSync('firebase/owner.rules.fragment','utf8')+'\n}}\n');
