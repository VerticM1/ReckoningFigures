import {writeFileSync} from 'node:fs';
import {course} from '../preview/course.js';
import {challenge} from '../preview/two-step.js';
const lessons=course.flatMap(u=>u.lessons).filter(l=>l.available&&!l.premium&&l.questions?.length);
writeFileSync('firebase/classroom-catalog.rules.fragment',`// Generated from the shipped course; unavailable and premium content excluded.\nfunction availableLessons() { return [${lessons.map(l=>l.id).join(',')}]; }\nfunction scoredQuestions(id) { return {${lessons.map(l=>`'${l.id}':${[...l.questions,...(l.id===2?[challenge]:[])].filter(q=>q.type!=='tutorial').length}`).join(',')}}[string(id)]; }\n`);
