const fs=require('fs');
// Preserve known production legacy paths until their separate migration.
const legacy=`// LEGACY TESTING ACCESS: migrate before adding real student information.
match /users/{userId} {
 allow read: if true;
 allow write: if request.auth != null && request.auth.uid == userId;
}
match /friendRequests/{requestId} { allow read, write: if request.auth != null; }
match /friendships/{friendshipId} { allow read, write: if request.auth != null; }
`;
const rules="rules_version = '2';\nservice cloud.firestore { match /databases/{database}/documents {\n"+legacy+fs.readFileSync('firebase/owner.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/membership.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/classroom-catalog.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/classroom.rules.fragment','utf8')+'\n'+fs.readFileSync('firebase/join.rules.fragment','utf8')+'\n}}\n';
fs.writeFileSync('firebase/owner-test.rules',rules);
fs.writeFileSync('preview/owner/access-rules.txt',rules);
