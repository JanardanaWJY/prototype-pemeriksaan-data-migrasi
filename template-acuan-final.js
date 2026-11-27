import {referenceSheets,workbookBlob} from './files.js';

// Template unduhan menggunakan struktur yang sama dengan impor dan ekspor acuan.
// Kondisi untuk satu field target ditulis satu per baris dan selalu digabungkan dengan AND.
const templateReference={
 name:'Contoh Acuan Aset',
 description:'Ganti identitas dan contoh field sesuai kebutuhan pemeriksaan.',
 fields:[
  {name:'Kode Aset',type:'text',column:true,required:'always',values:[],zero:true,unique:true,format:''},
  {name:'Status Aset',type:'text',column:true,required:'always',values:['OPERASI','DITARIK'],zero:true,unique:false,format:''},
  {name:'Jenis Aset',type:'text',column:true,required:'always',values:['TRAFO','REAKTOR','PMT'],zero:true,unique:false,format:''},
  {name:'Tahun Manufaktur',type:'integer',column:true,required:'always',values:[],zero:false,min:1900,max:2100,unique:false,format:''},
  {name:'Kapasitas MVA',type:'decimal',column:false,required:'never',values:[],zero:false,min:0.1,max:1000,unique:false,format:''},
  {name:'Aktif',type:'boolean',column:false,required:'never',values:[],zero:true,unique:false,format:''},
  {name:'Tanggal Penarikan',type:'date',column:true,required:'conditional',conditions:[{field:'Status Aset',value:'DITARIK'},{field:'Jenis Aset',value:'TRAFO'}],values:[],zero:true,unique:false,format:'DD-MM-YYYY'}
 ]
};

export function templateAcuanFinalBlob(){return workbookBlob(referenceSheets(templateReference));}
