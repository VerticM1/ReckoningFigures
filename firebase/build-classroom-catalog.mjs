import {writeFileSync} from 'node:fs';
import {course} from '../preview/course.js';
import {challenge} from '../preview/two-step.js';
// Generate the next server catalog, even while classroom UI activation is staged.
const lessons=course.flatMap(unit=>unit.lessons).filter(l=>l.available&&l.questions?.length);
writeFileSync('firebase/classroom-catalog.rules.fragment',`// Generated from the shipped course; all shipped Algebra 1 lessons; school license required by classroom rules.\nfunction availableLessons() { return [${lessons.map(l=>l.id).join(',')}]; }\nfunction scoredQuestions(id) { return {${lessons.map(l=>`'${l.id}':${[...l.questions,...(l.id===2?[challenge]:[])].filter(q=>q.type!=='tutorial').length}`).join(',')}}[string(id)]; }\n`);
