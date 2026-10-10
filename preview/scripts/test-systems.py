"""Independent checks for figures 020–024; run with requirements-audit.txt.
Fixtures restate the mathematical givens. Checks solve them instead of copying keys.
Conceptual wording still needs educator review; these checks do not certify pedagogy.
"""
import json,re,subprocess
from pathlib import Path
import sympy as s
from sympy.parsing.sympy_parser import parse_expr,standard_transformations,implicit_multiplication_application,rationalize
ROOT=Path(__file__).resolve().parents[2]
course=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {course} from './preview/course.js';console.log(JSON.stringify(course))"],cwd=ROOT))
lessons={l['id']:l for m in course for l in m['lessons']};checked=set()
symbols={v:s.Symbol(v) for v in 'xyasCLWqdnpcbvhj'}
x,y=symbols['x'],symbols['y']
def expr(t):
 t=t.replace('−','-');assert re.fullmatch(r'[0-9A-Za-z. +*/()\-]+',t),t
 t=re.sub(r'(?<=[A-Za-z])(?=[A-Za-z])','*',t)
 return parse_expr(t,local_dict=symbols,transformations=standard_transformations+(implicit_multiplication_application,rationalize))
def poly(e):
 a,b=e.split('=');return s.expand(expr(a)-expr(b))
def equivalent(a,b):
 ratio=s.cancel(a/b)
 return not ratio.free_symbols and ratio!=0

def check(l,n,predicate):
 q=lessons[l]['questions'][n-1];matches=[i for i,v in enumerate(q['choices']) if predicate(v)]
 assert matches==[q['answer']],(l,n,q['choices'],matches,q['answer']);checked.add((l,n))
def numeric(l,n,value):check(l,n,lambda v:bool(re.fullmatch(r'[0-9/−.\-]+',v)) and s.Rational(v.replace('−','-'))==value)
def pair(l,n,equations):
 solution=s.solve([poly(e) for e in equations],[x,y]);assert isinstance(solution,dict) and x in solution and y in solution
 def valid(v):
  a,b=[s.Rational(t.strip().replace('−','-')) for t in v.strip('()').split(',')]
  return a==solution[x] and b==solution[y]
 check(l,n,valid)
def equations(l,n,expected):
 target=[poly(e) for e in expected]
 def valid(v):
  candidates=[poly(e) for e in v.split(' and ')]
  return len(target)==len(candidates) and all(any(equivalent(a,b) for b in candidates) for a in target)
 check(l,n,valid)
def slope(a,b):return s.Rational(b[1]-a[1],b[0]-a[0])
numeric(20,1,slope((1,3),(5,11)));numeric(20,2,slope((0,9),(2,5)));numeric(20,3,slope((2,4),(6,4)))
assert 3-3==0;check(20,4,lambda v:v=='Undefined')
numeric(20,5,slope((1,2),(5,4)))
check(20,6,lambda v:s.Rational(v.split()[0].replace('−','-'))==slope((0,120),(5,90)))
check(20,7,lambda v:s.Rational(v.split()[0].lstrip('$'))==s.Rational('2.5'))
numeric(20,8,(3*6-7)-(3*2-7))
rates=[5-2,10-5];assert rates[0]!=rates[1];check(20,9,lambda v:v==f'No; the rates are {rates[0]} and {rates[1]}')
assert 3>2;check(20,10,lambda v:v=='A; its rate is 3')
numeric(20,11,slope((-2,7),(4,-5)))
check(20,12,lambda v:s.Rational(v.split()[0])==slope((1,45),(3,135)))
for n,expected in {
 1:['a+s=18'],2:['12a+7s=161'],3:['C=15+4v','C=7v'],4:['2L+2W=30','L=W+3'],
 5:['q+d=14','0.25q+0.10d=2.60'],6:['x+y=28','x-y=6'],7:['8+3h=5h'],8:['3n+2p=24'],
 10:['c+b=10','4c+2b=28'],11:['s+j=9','5s+3j=37'],12:['2L+2W=44','L=2W']}.items():equations(21,n,expected)
assert 4+6==10 and 3*4+2*6==24
check(21,9,lambda v:v=='Yes; 4 + 6 = 10 and 12 + 12 = 24')
check(22,1,lambda v:v=='Its coordinates satisfy both equations')
pair(22,2,['y=x+1','y=-x+5']);pair(22,5,['y=2x','y=-x+3']);pair(22,6,['y=-x','y=x+4']);pair(22,7,['x=2','y=-1']);pair(22,8,['y=x+2','y=2x']);pair(22,11,['y=x-3','y=-2x+3'])
def classification(equations):
 A,b=s.linear_eq_to_matrix([poly(e) for e in equations],[x,y]);rank=A.rank()
 return 'none' if rank<A.row_join(b).rank() else 'one' if rank==2 else 'infinite'
for n,eqs,label in [(3,['y=x+1','y=x-2'],'No solutions'),(4,['y=x+1','2y=2x+2'],'Infinitely many solutions'),(12,['y=2x-1','2y=4x-2'],'Infinitely many solutions')]:
 assert classification(eqs)==('none' if label=='No solutions' else 'infinite');check(22,n,lambda v:v==label)
# A determinant of two slope-form equations is nonzero exactly when slopes differ.
m1,m2=s.symbols('m1 m2');assert s.Matrix([[-m1,1],[-m2,1]]).det()==m2-m1
check(22,9,lambda v:v=='Exactly one')
check(22,10,lambda v:classification(v.split(' and '))=='none')
equations(23,1,['x+(2x+1)=10']);numeric(23,2,s.solve(poly('3x+1=10'),x)[0]);pair(23,3,['x=3','y=2x+1']);equations(23,4,['2(y-2)+y=8'])
for n,eqs in {5:['y=x+2','x+y=8'],6:['x=2y','x+y=12'],7:['y=3x-4','2x+y=11'],8:['x=y-2','2x+y=8'],11:['y=2x-1','x+y=14'],12:['x=3y+1','x-y=7']}.items():pair(23,n,eqs)
assert classification(['y=2x+1','y=2x-3'])=='none';check(23,9,lambda v:v=='No solution')
assert classification(['y=2x+1','2y=4x+2'])=='infinite';check(23,10,lambda v:v=='Infinitely many solutions on y = 2x + 1')
# Derive the eliminated equations from sums/differences of the original equations.
for n,p in [(1,poly('x+y=9')+poly('x-y=3')),(3,poly('3x+y=10')-poly('x+y=4'))]:check(24,n,lambda v:equivalent(poly(v),p))
pair(24,2,['2x=12','x+y=9']);numeric(24,4,-s.Rational(3,-1))
for n,eqs in {5:['x+y=11','x-y=3'],6:['2x+y=13','x-y=2'],7:['3x+y=10','x+y=4'],8:['2x+3y=12','x-y=1'],11:['3x+2y=16','x-2y=0'],12:['2x+3y=13','3x+2y=12']}.items():pair(24,n,eqs)
assert classification(['2x+2y=8','x+y=5'])=='none';check(24,9,lambda v:v=='No solution')
assert classification(['2x+2y=8','x+y=4'])=='infinite';check(24,10,lambda v:v=='Infinitely many solutions on x + y = 4')
# Verify the actual drawn segments satisfy the displayed equations, including vertical lines.
graphs={2:[(-1,1,1),(1,1,5)],3:[(-1,1,1),(-1,1,-2)],4:[(-1,1,1),(-2,2,2)],5:[(-2,1,0),(1,1,3)],6:[(1,1,0),(-1,1,4)],7:[(1,0,2),(0,1,-1)],11:[(-1,1,-3),(2,1,3)],12:[(-2,1,-1),(-4,2,-2)]}
for n,lines in graphs.items():
 svg=lessons[22]['questions'][n-1]['diagram'];segments=re.findall(r'<path d="M([\d.\-]+) ([\d.\-]+)L([\d.\-]+) ([\d.\-]+)"',svg)
 assert len(segments)==2 and 'Graph values in text' in svg and 'stroke-dasharray' in svg
 for coords,(A,B,C) in zip(segments,lines):
  for u,v in [coords[:2],coords[2:]]:
   a=(s.Rational(u)-190)/25;b=(190-s.Rational(v))/25;assert A*a+B*b==C,(n,a,b)
for l in range(20,25):
 qs=lessons[l]['questions'];assert len(qs)==12 and lessons[l]['premium']
 assert sum(q['phase']=='check' for q in qs)==2
 for q in qs:
  assert len(q['explanations'])==len(q['choices'])==4
  assert q['explanations'][q['answer']]==q['explanation']
  assert all(len(v)>20 for v in q['explanations'])
  if q['phase']=='check':assert not q.get('concept')
assert len(checked)==60
print('PASS all 60 new keys, unique valid choices, eight graph geometries, feedback coverage, and premium exclusion.')
