export const clone = x => JSON.parse(JSON.stringify(x));
export const empty = x => x === null || x === undefined || String(x).trim() === '';
export const types = {text:'Teks',integer:'Bilangan bulat',decimal:'Desimal',date:'Tanggal',boolean:'Boolean'};
export const sampleFields = [
  {name:'Status',type:'text',column:true,required:'always',values:['OPERASI','DITARIK'],zero:true,unique:false},
  {name:'Tahun Manufaktur',type:'integer',column:true,required:'always',values:[],zero:false,unique:false},
  {name:'Tanggal Penarikan',type:'date',column:true,required:'conditional',conditionField:'Status',conditionValue:'DITARIK',format:'DD-MM-YYYY',values:[],zero:true,unique:false},
  {name:'Nomor Seri',type:'text',column:false,required:'never',values:[],zero:true,unique:false}
];
export const sampleBook = {name:'Contoh_Data_Migrasi_Aset.xlsx',sheets:[{name:'Aset',rows:[sampleFields.map(f=>f.name),['OPERASI',2020,'',''],['DITARIK',0,'','SN02'],['DITARIK',2018,'09-05-2024',''],['',2016,'','SN04']]}]};
export function inputFromBook(book,sheetName,header=1){
 const sheet=book.sheets.find(s=>s.name===sheetName)||book.sheets[0];
 const headers=Array.from(sheet.rows[header-1]||[],v=>String(v??'').trim());
 const rows=sheet.rows.slice(header).map((values,i)=>({row:header+i+1,values})).filter(r=>r.values.some(v=>!empty(v)));
 return {name:book.name,sheet:sheet.name,header,headers,rows,book:clone(book)};
}
export function validateFields(name,fields){
 const errors=[];if(!name.trim())errors.push('Nama acuan wajib diisi.');if(!fields.length)errors.push('Tambahkan sedikitnya satu field.');
 const names=fields.map(f=>f.name.trim());
 fields.forEach((f,i)=>{
  const label=f.name||`Field ${i+1}`;
  if((!empty(f.min)&&!Number.isFinite(Number(f.min)))||(!empty(f.max)&&!Number.isFinite(Number(f.max))))errors.push(`${label}: minimum dan maksimum harus berupa angka.`);
  if(f.type==='date'&&!['DD-MM-YYYY','YYYY-MM-DD'].includes(f.format))errors.push(`${label}: format tanggal belum valid.`);
  if(!f.name.trim())errors.push(`Nama field ${i+1} wajib diisi.`);
  if(names.filter(n=>n===f.name.trim()).length>1)errors.push(`${label}: nama field harus unik.`);
  if(!types[f.type])errors.push(`${label}: tipe data belum dipilih dengan benar.`);
  if(!['always','never','conditional'].includes(f.required))errors.push(`${label}: pilihan wajib isi tidak valid.`);
  if(!empty(f.min)&&!empty(f.max)&&Number(f.min)>Number(f.max))errors.push(`${label}: minimum tidak boleh melebihi maksimum.`);
  if((!empty(f.min)||!empty(f.max))&&!['integer','decimal'].includes(f.type))errors.push(`${label}: batas angka hanya untuk tipe bilangan.`);
  if(f.required==='conditional'){
   const source=fields.find(x=>x.name===f.conditionField);
   if(!source||source.name===f.name)errors.push(`${label}: pilih field penentu lain yang tersedia.`);
   if(empty(f.conditionValue))errors.push(`${label}: isi nilai kondisi.`);
   if(source?.values?.length&&!source.values.includes(f.conditionValue))errors.push(`${label}: nilai kondisi harus ada pada daftar nilai ${source.name}.`);
  }
 });return [...new Set(errors)];
}
function parseDate(v,format){
 const p=String(v).split('-').map(Number);if(p.length!==3)return false;
 const [y,m,d]=format==='YYYY-MM-DD'?p:[p[2],p[1],p[0]];const dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
function isTyped(v,f){
 if(f.type==='integer')return /^[+-]?\d+$/.test(String(v).trim());
 if(f.type==='decimal')return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(String(v).trim());
 if(f.type==='date')return parseDate(v,f.format||'DD-MM-YYYY');
 if(f.type==='boolean')return /^(true|false|ya|tidak|0|1)$/i.test(String(v));return true;
}
export function examine(input,ref){
 const findings=[],pending=[],badRows=new Set();let required=0,filled=0;
 const add=(row,field,value,reason)=>{findings.push({row,field,value:value??'',reason});if(typeof row==='number')badRows.add(row);};
 ref.fields.forEach(f=>{if(f.column&&!input.headers.includes(f.name)){add('Semua',f.name,'','Kolom tidak tersedia');input.rows.forEach(r=>badRows.add(r.row));}});
 input.headers.forEach(h=>{if(!ref.fields.some(f=>f.name===h))add('—',h,'','Kolom tidak tercantum dalam acuan');});
 const uniqueSets={};ref.fields.filter(f=>f.unique).forEach(f=>{const idx=input.headers.indexOf(f.name),groups={};input.rows.forEach(r=>{const v=r.values[idx];if(!empty(v))(groups[String(v)]??=[]).push(r.row);});uniqueSets[f.name]=new Set(Object.values(groups).filter(g=>g.length>1).flat());});
 input.rows.forEach(r=>ref.fields.forEach(f=>{
  const idx=input.headers.indexOf(f.name),v=r.values[idx];if(idx<0&&!f.column)return;let must=f.required==='always';
  if(f.required==='conditional'){
   const source=ref.fields.find(x=>x.name===f.conditionField),sv=r.values[input.headers.indexOf(f.conditionField)];
   if(empty(sv)||source&&(!isTyped(sv,source)||source.values?.length&&!source.values.includes(String(sv)))){pending.push({row:r.row,field:f.name,source:f.conditionField});badRows.add(r.row);}
   else must=String(sv)===f.conditionValue;
  }
  if(must){required++;if(!empty(v))filled++;else if(idx>=0)add(r.row,f.name,v,f.required==='conditional'?`Wajib diisi karena ${f.conditionField} = ${f.conditionValue}`:'Wajib diisi');}
  if(idx<0||empty(v))return;
  if(!isTyped(v,f))add(r.row,f.name,v,`Harus berupa ${types[f.type]?.toLowerCase()||'tipe yang ditentukan'}${f.type==='date'?` (${f.format||'DD-MM-YYYY'})`:''}`);
  if(['integer','decimal'].includes(f.type)&&Number(v)===0&&!f.zero)add(r.row,f.name,v,'Nilai nol tidak diizinkan');
  if(['integer','decimal'].includes(f.type)&&isTyped(v,f)){
   if(!empty(f.min)&&Number(v)<Number(f.min))add(r.row,f.name,v,`Nilai minimum ${f.min}`);
   if(!empty(f.max)&&Number(v)>Number(f.max))add(r.row,f.name,v,`Nilai maksimum ${f.max}`);
  }
  if(f.values?.length&&!f.values.includes(String(v)))add(r.row,f.name,v,`Nilai yang diizinkan: ${f.values.join(', ')}`);
  if(uniqueSets[f.name]?.has(r.row))add(r.row,f.name,v,'Nilai duplikat; harus unik');
 }));
 return {total:input.rows.length,bad:badRows.size,good:input.rows.length-badRows.size,required,filled,findings,pending};
}
export function rulesText(f){return [f.required==='conditional'?`Wajib jika ${f.conditionField} = ${f.conditionValue}`:'',!f.zero&&['integer','decimal'].includes(f.type)?'Nol tidak diizinkan':'',f.values?.length?`Nilai: ${f.values.join(', ')}`:'',!empty(f.min)?`Min. ${f.min}`:'',!empty(f.max)?`Maks. ${f.max}`:'',f.unique?'Unik':'',f.type==='date'?f.format:''].filter(Boolean).join(' · ')||'—';}
export function canAccess(exam,uid){return exam.owner===uid||exam.share==='all'||exam.share==='selected'&&exam.recipients.includes(uid);}
export function identity(exam){return JSON.stringify([exam.ref.id,exam.input.sheet,exam.input.header,exam.input.headers,exam.input.rows]);}
export function groupExams(exams){const groups=new Map();[...exams].sort((a,b)=>b.end.localeCompare(a.end)).forEach(e=>{const key=identity(e);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);});return [...groups.values()];}
export function seed(){
 const users=[{id:'rina',name:'Rina Pratiwi',short:'Rina',username:'rina',role:'user',active:true},{id:'budi',name:'Budi Santoso',short:'Budi',username:'budi',role:'user',active:true},{id:'admin',name:'Administrator Demo',short:'Admin',username:'admin',role:'admin',active:true}];
 const refs=[{id:'ref-aset-1',family:'aset',name:'Data Aset',description:'Kelengkapan dan kesesuaian data aset.',version:1,owner:'rina',published:'2026-11-05T09:45:00',fields:clone(sampleFields)}, {id:'ref-lokasi-1',family:'lokasi',name:'Data Lokasi',description:'Pemeriksaan daftar lokasi.',version:1,owner:'budi',published:'2026-11-04T14:10:00',fields:[{name:'Kode Lokasi',type:'text',column:true,required:'always',unique:true,zero:true,values:[]},{name:'Nama Lokasi',type:'text',column:true,required:'always',zero:true,values:[]}]}];
 const input=inputFromBook(sampleBook,'Aset');const clean=clone(input);clean.rows[1].values[1]=2021;clean.rows[1].values[2]='01-05-2024';clean.rows[3].values[0]='OPERASI';clean.name='Contoh_Data_Aset_Perbaikan.xlsx';clean.book.name=clean.name;clean.rows.forEach(r=>{clean.book.sheets[0].rows[r.row-1]=r.values;});
 const locBook={name:'Contoh_Data_Lokasi.xlsx',sheets:[{name:'Lokasi',rows:[['Kode Lokasi','Nama Lokasi'],['L01','Gardu Utama'],['L02',''],['L03','Gudang'],['L04','Kantor']]}]};const loc=inputFromBook(locBook,'Lokasi');
 const make=(id,owner,inp,ref,start,end,share='private')=>({id,owner,input:clone(inp),ref:clone(ref),start,end,share,recipients:[],result:examine(inp,ref)});
 return {users,refs,drafts:[],exams:[make('P-001','rina',input,refs[0],'2026-11-04T09:00:00','2026-11-04T09:02:20'),make('P-002','budi',clean,refs[0],'2026-11-05T09:13:10','2026-11-05T09:15:00','all'),make('P-003','rina',loc,refs[1],'2026-11-05T09:44:00','2026-11-05T09:45:00'),make('P-004','rina',input,refs[0],'2026-11-05T10:27:46','2026-11-05T10:30:00')],logs:[]};
}
