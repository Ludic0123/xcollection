// Runs original component event handlers with isolated hooks and a simulated SDK.
// No network access, browser state, or production writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.join(__dirname, '..');
const results = [];
function record(name, evidence) { results.push({name, evidence}); console.log(name, JSON.stringify(evidence)); }
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function runtime(component, props, behavior={}) {
  const states=[]; let index=0; const calls=[]; const navigations=[]; const cache=new Map();
  const sdk = {
    auth:{getUser:async()=>{if(behavior.authThrow)throw Error('test auth network failure');return{data:{user:{id:'current-admin'}},error:null}}},
    rpc(name,payload){calls.push({action:'rpc',name,payload});return Promise.resolve(behavior.rpc?.(payload)??{data:payload.p_spot_id,error:null})},
    from(table) {
      const call={table};
      const q={
        upsert(payload){Object.assign(call,{action:'upsert',payload});calls.push(call);return q},
        insert(payload){Object.assign(call,{action:'insert',payload});calls.push(call);return q},
        update(payload){Object.assign(call,{action:'update',payload});calls.push(call);return q},
        delete(){Object.assign(call,{action:'delete'});calls.push(call);return q},
        eq(key,value){call.filter={key,value};return q},select(){return q},single(){call.single=true;return q},
        then(resolve,reject){return Promise.resolve().then(()=>{if(behavior.writeThrow)throw Error('test write network failure');return behavior.write?.(call)??{data:{id:`test-${calls.length}`},error:null}}).then(resolve,reject)},
      };return q;
    },
    storage:{from(){return{upload:behavior.upload??(async()=>({error:null})),getPublicUrl:filename=>({data:{publicUrl:`https://test.invalid/${filename}`}})}}}
  };
  const react={createContext:()=>({Provider:'Provider'}),useContext:()=>behavior.context??null,useId:()=> 'upload',useEffect:()=>{},useCallback:fn=>fn,useRef(initial){const i=index++;if(!(i in states))states[i]={current:initial};return states[i]},useState(initial){const i=index++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value}]},useMemo:fn=>fn(),Fragment:'Fragment'};
  function load(filename) {
    if(cache.has(filename))return cache.get(filename);
    const source=fs.readFileSync(filename,'utf8');
    const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    const module={exports:{}};cache.set(filename,module.exports);
    const req=id=>{
      if(id==='react')return react;
      if(id==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
      if(id==='next/navigation')return{useRouter:()=>({push:url=>navigations.push(url),refresh(){}})};
      if(id==='@/lib/supabase/client')return{createClient:()=>sdk};
      if(id==='lucide-react')return new Proxy({},{get:(_,key)=>String(key)});
      if(id==='./PostingForm'||id==='@/components/PostingForm') return load(path.join(root,'components/PostingForm.tsx'));
      if(id.startsWith('./')||id.startsWith('@/components/'))return{__esModule:true,default:id.split('/').at(-1)};
      const relative=id.replace(/^@\//,'');
      const file=path.join(root,relative)+(id==='@/types'?'/index.ts':'.ts');
      return load(file);
    };
    vm.runInNewContext('(function(require,module,exports){'+code+'\n})',{console,Date,Math,Map,Set,crypto:require('node:crypto').webcrypto,Error})(req,module,module.exports);
    return module.exports;
  }
  const Component=load(path.join(root,'components',component+'.tsx')).default;
  return{calls,navigations,states,render(nextProps=props){props=nextProps;index=0;return Component(props)},find(pred){return nodes(this.render()).find(pred)}};
}
const defaults={genres:[],cities:[],priceRanges:[],reservations:[],brands:[],sakeTypes:[],sakeBrands:[],sakeModels:[],spots:[{id:'spot-a',name:'Test',category:'restaurant'}],spotId:'spot-a',hotelId:'hotel-a',planId:'plan-a'};
const event={preventDefault(){}};

(async()=>{
  for(const name of ['SpotForm','HotelForm','SakeForm','EventForm','StayForm','TripPlanForm','TripItemForm']) {
    const rt=runtime(name,defaults,{authThrow:true,writeThrow:true});
    const wrapper=runtime('PostingForm',rt.render().props);
    await wrapper.find(n=>n.type==='form').props.onSubmit(event);
    assert.equal(rt.find(n=>n.type==='button'&&n.props.type==='submit').props.disabled,false,name);
    assert(rt.find(n=>n.type==='p'&&String(n.props.children).includes('test')),name+' error visible');
  }
  {
    const spot={id:'legacy',name:'Old',photo_urls:['https://test.invalid/kept.jpg']};
    const rt=runtime('SpotForm',{...defaults,spot});
    await rt.render().props.onSubmit(event);
    assert.equal(rt.calls[0].action,'update');
    assert.deepEqual(Array.from(rt.calls[0].payload.photo_urls),spot.photo_urls);
    assert(!('user_id' in rt.calls[0].payload));
    assert.equal(rt.calls[0].table,'spots');
  }
  {
    const rt=runtime('SpotForm',defaults);
    rt.find(n=>n.type==='input'&&n.props.required).props.onChange({target:{value:'店名だけで登録'}});
    await rt.render().props.onSubmit(event);
    await rt.render().props.onSubmit(event);
    assert.equal(rt.calls.length,2);
    assert(rt.calls.every(c=>c.table==='spots'&&c.action==='upsert'));
    assert.equal(rt.calls[0].payload.id,rt.calls[1].payload.id);
    assert.equal(rt.calls[0].payload.name,'店名だけで登録');
    assert.equal(rt.navigations.length,2);
  }
  for(const [name,entity] of [['SpotForm','spot'],['HotelForm','hotel'],['SakeForm','sake'],['EventForm','event'],['TripPlanForm','plan']]) {
    const rt=runtime(name,{...defaults,[entity]:{id:'existing',name:'Name',title:'Title'}},{write:call=>{assert(call.single);return {data:null,error:{message:'No rows'}}}});
    await rt.render().props.onSubmit(event);
    assert(!('user_id' in rt.calls[0].payload));assert(!('organizer_id' in rt.calls[0].payload));assert.equal(rt.navigations.length,0);
  }
  {
    let release;let count=0;const errors=[];
    const rt=runtime('PostingForm',{onSubmit:()=>{count++;return new Promise(r=>release=r)},onError:e=>errors.push(e),onSettled:()=>{},children:null});
    const submit=rt.find(n=>n.type==='form').props.onSubmit;
    const first=submit(event);await submit(event);assert.equal(count,1);release();await first;
    const report=rt.render().props.value;
    report('photo',{pending:true,error:null});await submit(event);assert.equal(count,1);
    report('photo',{pending:false,error:'failed'});await submit(event);assert.equal(count,1);assert.equal(errors.length,2);
    report('photo',{pending:false,error:null});const second=submit(event);assert.equal(count,2);release();await second;
  }
  for(const name of ['PhotoPool','MultiImageUpload']) {
    let release;let photos=name==='PhotoPool'?[{url:'old',caption:'before',ingredients:[]}]:['old'];
    const props={value:photos,onChange:next=>{photos=typeof next==='function'?next(photos):next},ingredientOptions:[]};
    const rt=runtime(name,props,{upload:()=>new Promise(r=>release=r)});
    rt.find(n=>n.type==='input'&&n.props.type==='file').props.onChange({target:{files:[{name:'added.jpg'}],value:'x'}});
    if(name==='PhotoPool')rt.find(n=>n.props?.placeholder==='写真の名前・説明').props.onChange({target:{value:'edited'}});
    else rt.find(n=>n.type==='button'&&n.props['aria-label']==='削除').props.onClick();
    rt.render({...props,value:photos});release({error:null});await new Promise(r=>setImmediate(r));
    if(name==='PhotoPool')assert.equal(photos[0].caption,'edited');else assert.equal(photos.length,1);
  }
  console.log('PASS: 7 forms recover errors; spot save needs no blog and retries use same ID; existing photos and ownership retained; missing updates rejected; duplicate/upload guards pass');
})().catch(e=>{console.error(e);process.exitCode=1});

