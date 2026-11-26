import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeCellValue} from '../files.js';

test('parser membaca string Excel bertipe str',()=>{assert.equal(decodeCellValue('str','AKTIF'),'AKTIF');assert.equal(decodeCellValue('str','31-02-2020'),'31-02-2020');});
test('parser membaca angka nol, boolean, inline string, dan tanggal',()=>{assert.equal(decodeCellValue('n','0'),0);assert.equal(decodeCellValue('b','1'),'TRUE');assert.equal(decodeCellValue('inlineStr','', 'KABEL'),'KABEL');assert.equal(decodeCellValue('n','43831','',true),'01-01-2020');});
