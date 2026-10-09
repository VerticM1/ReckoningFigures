"""Symbolically verify selected arithmetic/expression keys, not curriculum certification.
Install requirements-audit.txt, then run from any directory. Source is trusted repo data.
"""
import json, re, subprocess
from pathlib import Path
import sympy as s
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor, rationalize
ROOT=Path(__file__).resolve().parents[2]
course=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {course} from './preview/course.js'; console.log(JSON.stringify(course))"],cwd=ROOT))
lessons={l['id']:l for m in course for l in m['lessons']}
transform=standard_transformations+(implicit_multiplication_application,convert_xor,rationalize)
symbols={v:s.Symbol(v,positive=True) for v in 'xyzabn'}
def expr(t):
 t=re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+',lambda m:'^('+m[0].translate(str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁻','0123456789-'))+')',t)
 t=t.replace('−','-').replace('×','*').replace(',','')
 t=re.sub(r'√([0-9]+|[xy])',r'sqrt(\1)',t)
 t=re.sub(r'√(\([^()]+\))',r'sqrt\1',t)
 if '÷' in t:
  a,b=t.split('÷');t=f'({a})/({b})'
 assert re.fullmatch(r'[0-9xyzabnsqrt. +*/^()\-]+',t),t
 return parse_expr(t,local_dict={**symbols,'sqrt':s.sqrt},transformations=transform)
def key(l,n):
 q=lessons[l]['questions'][n-1];return q['choices'][q['answer']]
checked=[]
# Solve first-unit equations independently, including HTML-rendered fractions.
for l in range(1,9):
 for n,q in enumerate(lessons[l]['questions'],1):
  if not (q['q'].startswith('Solve for') or q['q'].startswith('What is <span')):continue
  eq=q['eq']
  if '<div' in eq:
   numerator,denominator=re.findall(r'<span[^>]*>(.*?)</span>',eq)
   eq=f'({numerator})/({denominator})'+eq.split('</div>')[1]
  left,right=eq.split('=')
  answer=q['answer'] if q['type']=='fill-blank' else key(l,n).split('=')[-1]
  value=expr(str(answer));polynomial=expr(left)-expr(right)
  assert s.simplify(polynomial.subs(symbols['x'],value))==0,(l,n)
  assert s.diff(polynomial,symbols['x'])!=0,(l,n)
  checked.append(f'{l}.{n}')
for l in range(36,51):
 for n,q in enumerate(lessons[l]['questions'],1):
  # Only unambiguous expression prompts; concepts/word problems require separate review.
  m=re.fullmatch(r'(?:Simplify|Multiply|Add|Subtract|Expand|Add three polynomials|Divide): (.+)',q['q'])
  if not m:continue
  a=expr(m[1]);b=expr(key(l,n))
  assert s.simplify(a-b)==0,(l,n,m[1],key(l,n))
  checked.append(f'{l}.{n}')
# Factoring: independently expand selected answer and compare with the polynomial.
for l,items in {28:{5:'5*x+10',6:'x^2+6*x+8',8:'x^2+9*x+20',9:'3*x^2+9*x',10:'x^2-5*x+6',11:'x^2+3*x-10',12:'2*x^2+6*x+4'},29:{2:'x^2-16',5:'2*x^2+5*x+2',6:'x^2-25',7:'x^2+10*x+25',8:'3*x^2+11*x+6',9:'4*x^2-1',10:'x^2-8*x+16',11:'6*x^2+7*x+2',12:'2*x^2-50'}}.items():
 for n,polynomial in items.items():
  assert s.expand(expr(key(l,n))-expr(polynomial))==0,(l,n)
  checked.append(f'{l}.{n}')
x=symbols['x']
for l,items in {30:{3:'(x-4)*(x+2)',5:'(x+6)*(x-2)',6:'x^2-5*x+6',7:'x^2-16',8:'x^2+7*x+12',9:'x^2+2*x-15',10:'x^2-9',11:'2*x^2+6*x+4',12:'x^2-x-12'},31:{4:'(x+1)^2-16',7:'(x+5)^2-9',9:'x^2+10*x-11',11:'(x-4)^2-36',12:'x^2+2*x-3'}}.items():
 for n,polynomial in items.items():
  actual={s.Rational(v) for v in re.findall(r'x = (-?\d+)',key(l,n))}
  # Remove positive assumptions to retain negative roots.
  free=s.Symbol('t',real=True);expected=set(s.solve(expr(polynomial).subs(x,free),free))
  assert actual==expected,(l,n,actual,expected)
  checked.append(f'{l}.{n}')
# The repaired linear/quadratic intersection has two irrational roots.
t=s.Symbol('t',real=True)
roots=s.solve(t*t-t-1,t)
for r in roots:assert s.simplify(r*r-(r+1))==0
actual_pairs=[tuple(expr(v) for v in pair[1:-1].split(', ')) for pair in key(26,9).split(' and ')]
assert {s.simplify(a) for a,b in actual_pairs}==set(roots)
for a,b in actual_pairs:assert s.simplify(b-a*a)==0 and s.simplify(b-a-1)==0
checked.append('26.9')
assert len(roots)==2
assert s.solve(t*t+1-2*t,t)==[1]
assert key(26,10)=='One solution'
# Inverse answer must compose to the identity; every distractor must fail.
q=lessons[56]['questions'][11]
for i,choice in enumerate(q['choices']):
 identity=s.simplify(5-expr(choice)-x)==0
 assert identity==(i==q['answer']),(56,12,choice)
checked.extend(['26.10','56.12'])
print(f'Symbolic checks passed for {len(checked)} answer keys; conceptual items, teaching quality and standards alignment still require educator review.')
