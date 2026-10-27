import assert from 'node:assert/strict';
import {attackScenes,timingFor,sceneFrame} from '../src/attack-scenes.js';

for(const [name,scene] of Object.entries(attackScenes)){
  const timing=timingFor(scene);
  assert.equal(sceneFrame(scene,0).normalText,'');
  assert.equal(sceneFrame(scene,0).attackText,'');
  assert.equal(sceneFrame(scene,0).result,false);
  assert.equal(sceneFrame(scene,timing.moveAt).attackText,scene.attack.value);
  assert.equal(sceneFrame(scene,timing.moveAt).normalText,scene.normal.value);
  assert.equal(sceneFrame(scene,timing.clickAt).clicking,true);
  assert.equal(sceneFrame(scene,timing.clickAt+500).processing,true);
  assert.equal(sceneFrame(scene,timing.resultAt-1).result,false);
  assert.equal(sceneFrame(scene,timing.finishAt).result,true);
  assert.equal(sceneFrame(scene,timing.finishAt).settled,true);
  assert.ok(timing.resultAt>timing.clickAt&&timing.clickAt>timing.moveAt);
  console.log(`OK: secuencia automática de ${name}`);
}
