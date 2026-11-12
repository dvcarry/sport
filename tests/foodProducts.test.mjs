import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotMealItems,mealTotals} from '../src/foodProducts.ts';
const products=[{id:'chicken',name:'Продукт A',typeId:'meat',protein:30,calories:150},{id:'rice',name:'Продукт B',typeId:'side',protein:3,calories:200}];
const types=[{id:'meat',name:'Мясо'},{id:'side',name:'Гарнир'}];
test('several products and portions contribute to daily totals only on the right date',()=>{
 const items=snapshotMealItems(products,types,{chicken:2,rice:1});
 const meal={id:'one',day:'2026-11-12',addedAt:'2026-11-12T10:00:00Z',items};
 assert.deepEqual(mealTotals([meal],'2026-11-12'),{protein:63,calories:500});
 assert.deepEqual(mealTotals([meal],'2026-11-11'),{protein:0,calories:0});
 assert.equal(items[0].typeName,'Мясо');
});
test('meal snapshots survive catalog edits and reject invalid portions',()=>{
 const copy=structuredClone(products);const items=snapshotMealItems(copy,types,{chicken:2});
 copy[0].protein=99;copy[0].name='Другое';
 assert.equal(items[0].protein,30);assert.equal(items[0].name,'Продукт A');
 assert.throws(()=>snapshotMealItems(products,types,{chicken:1.5}));
 assert.throws(()=>snapshotMealItems(products,types,{chicken:101}));
 assert.deepEqual(snapshotMealItems(products,types,{}),[]);
});
