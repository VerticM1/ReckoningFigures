export async function marketingCall(data,user){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
 try{const headers={'Content-Type':'application/json'};if(user)headers.Authorization='Bearer '+await user.getIdToken();const response=await fetch('https://us-central1-reckoningfigures-bbdae.cloudfunctions.net/marketingHub',{method:'POST',headers,body:JSON.stringify({data}),signal:controller.signal});const body=await response.json();if(!response.ok||body.error)throw Error(body.error?.message||'Email service unavailable. Try again shortly.');return body.result;}catch(e){if(e.name==='AbortError')throw Error('This took longer than expected. Please try again.');throw e;}finally{clearTimeout(timer);}
}
