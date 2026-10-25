export const arrivalConfig=Object.freeze({duration:3});
export function createArrival(carriers){
 if(!Array.isArray(carriers)||carriers.length<1||carriers.length>6)throw new Error('Invalid arrival train');
 const cars=carriers.map(c=>({id:c.id,level:c.level}));
 let elapsed=0,paused=false;
 return {
  step(dt){if(!paused&&Number.isFinite(dt)&&dt>0)elapsed=Math.min(arrivalConfig.duration,elapsed+dt);},
  toggle(){if(elapsed<arrivalConfig.duration)paused=!paused;},
  snapshot(){return {mode:'arrival',elapsed,paused,done:elapsed>=arrivalConfig.duration,progress:elapsed/arrivalConfig.duration,cars:cars.map(c=>({...c})),coordinate:'screen x right, y down; locomotive faces right'};}
 };
}
