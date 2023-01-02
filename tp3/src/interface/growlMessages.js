let growlId = 0;
export function addGrowlMessage(message, type){
  if(type === 'info'){
    console.log('Growl message', message);
  } else {
    console.error('Growl message', message);
  }
    let id = growlId++;
    let growls = document.getElementById("growls");
    let newGrowlHTML = 
    `
    <div id="growl${id}" class="growl growl-${type}">
    ${message}
    </div>
    `
    growls.insertAdjacentHTML("beforeEnd", newGrowlHTML);
    setTimeout(() => {document.getElementById("growl"+id).classList.add("hidden");}, 5000);
    setTimeout(() => {document.getElementById("growl"+id).remove();}, 6000);
  }