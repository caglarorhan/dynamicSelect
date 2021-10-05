// let dummyData =[
//     ['TX',[
//         ['Austin',['Leander','Williamson']],
//         ['Houston'],
//         ['San Antonio',['Bandera','Bexar','Comal','Medina']]
//     ]
//     ],
//     ['CA',[
//         ['Santa Clara'],
//         ['San Jose',['a','b',['c',['x','y','z','@']]]],
//         ['San Francisco',['g']]
//     ]
//     ],
//     ['OR']
// ];
/*
'[
    ["A"],
    ["B"],
    ["C",["C1",["C1-a","C1-a","C1-c","C1-d"]]]
]'
* */


window.onload = () => {
    //localStorage.clear();
    dynamicSelect.init();
    resetAll();
}

const dynamicSelect = {
    init(configs = {
                        selectElementsMainContainerId: 'selectHouse',
                        newOptionTextBoxId: 'newOption',
                        firstSelectBoxId: 'firstSelectBox'
        // initData: dummyData
         }
    ) {
        let newOptionTextBox = document.createElement('input');
        newOptionTextBox.id = configs.newOptionTextBoxId;
        this.selectHouse = document.getElementById(configs.selectElementsMainContainerId);
        this.selectHouse.appendChild(newOptionTextBox);
        this.newOptionBox = newOptionTextBox;
        this.selectHouse.appendChild(this.createSelect(configs.firstSelectBoxId));
        if(configs.initData){
            console.log('init data bulundu kullaniclacak')
            this.set(configs.initData)
        }


        //console.log(this.get());
        this.loadOptions(document.querySelector(`#${configs.firstSelectBoxId}`));
        this.reAttachEvents();
        newOptionTextBox.addEventListener('change', this.add);

    },
    mustUnique: false,
    selectHouse: document.getElementById('selectHouse'),
    selectAnOptionText: 'Select an option',
    tempContainer:null,
    add(){
        let newOptionValue = dynamicSelect.newOptionBox.value;
        if(!newOptionValue || newOptionValue===""){return false;}
        let parentSelection = dynamicSelect.selectHouse.querySelector('select:last-of-type');
        let targetNodeValue = (parentSelection.value !== dynamicSelect.selectAnOptionText) ? parentSelection.value : parentSelection.id;
        console.log(`targetNodeValue:${targetNodeValue}`)

        if (document.querySelector('#firstSelectBox').length === 1) {
            dynamicSelect.set([[`${newOptionValue}`]]);
            dynamicSelect.createOption(newOptionValue, document.querySelector('#firstSelectBox'));
        } else if(targetNodeValue==='firstSelectBox'){
            let data = dynamicSelect.get();
            data.push([newOptionValue]);
            dynamicSelect.tempContainer = data;
            dynamicSelect.set(dynamicSelect.tempContainer);
            dynamicSelect.createOption(newOptionValue, document.getElementById('firstSelectBox'))
            console.log(dynamicSelect.get());
        }
        else{
            let data = dynamicSelect.get();
            let indexPath = dynamicSelect.locateTarget(targetNodeValue, data);
            dynamicSelect.tempContainer = data;

            let pathString = `dynamicSelect.tempContainer`;
            for (let i = 0; i < indexPath.length - 1; i++) {
                pathString += `[${indexPath[i]}]`;
            }
            console.log(`Bulunan ve hedeflenen path: ${pathString}`);
            dynamicSelect.runRawCode('console.log('+pathString+')');


            dynamicSelect.runRawCode('('+pathString+'.length==2 && Array.isArray('+pathString+'[1])?'+pathString+'[1].push("'+newOptionValue+'"):'+pathString+'.length==1?'+pathString+'.push(["'+newOptionValue+'"]):'+pathString+'['+indexPath[indexPath.length - 1]+']=(["'+targetNodeValue+'",["'+newOptionValue+'"]]))');
            dynamicSelect.set(dynamicSelect.tempContainer);
            console.log(dynamicSelect.get());
            // ended
        }

        dynamicSelect.newOptionBox.value = '';
        return true;
    },
    get(){
        return localStorage.getItem('dynamicSelectData') ? JSON.parse(JSON.parse(localStorage.getItem('dynamicSelectData'))) : [];
    },
    set(data){
        localStorage.setItem('dynamicSelectData',JSON.stringify(JSON.stringify(data)));
    },
    locateTarget(targetNodeValue, data, indexPath = []) {
        if (Array.isArray(data)) {
            for (let x = 0; x < data.length; x++) {
                if (Array.isArray(data[x])) {
                    //console.log(data[x].flat(999))
                    if (data[x].flat(Infinity).includes(targetNodeValue)) {
                        indexPath.push(x);
                        this.locateTarget(targetNodeValue, data[x], indexPath)
                    }
                } else {
                    if (data[x] === targetNodeValue) {
                        indexPath.push(x);
                    }
                }

            }
        }
        return indexPath;
    },
    runRawCode(rawCode) {
        return Function('return (' + rawCode + ')')();
    },
    createOption(optionValue, targetSelect) {
        //console.log('Create new option from optionValue');
        let newOptionElement = document.createElement('option');
        newOptionElement.text = optionValue;
        newOptionElement.value = optionValue;
        targetSelect.appendChild(newOptionElement);
    },
    loadOptions(targetSelect) {
        //console.log(targetSelect)
        this.createOption(this.selectAnOptionText, targetSelect);
        console.log(this.get());
        if(Array.isArray(this.get())){
            this.get().forEach(item => {
                console.log('siradaki item:', item)
                if(Array.isArray(item)){
                    this.createOption(item[0], targetSelect);
                }else if(typeof item==='string'){
                    this.createOption(item, targetSelect);
                }

            });
        }

    },
    createSelect(withThisId) {
        let newSelectElement = document.createElement('select');
        newSelectElement.id = withThisId;
        newSelectElement.className='selectElements';
        return newSelectElement;
    },
    searchOverData(event) {
        //console.log(event.target)
        let searchTerm = event.target.value;
        let srcSelectElement = event.target;
        this.get().forEach(data => {
            //console.log(data)
            this.findFromArray(searchTerm, data, srcSelectElement)
        })
    },
    reAttachEvents() {
        //console.log('event attachments')
        document.querySelectorAll('.selectElements').forEach(selElm => {
            selElm.removeEventListener("change", dynamicSelect.selectEventListeners, true);
            selElm.addEventListener("change", dynamicSelect.selectEventListeners, true)
        })
    },
    selectEventListeners(e) {
        //console.log('change event fired')
        dynamicSelect.clearNextSiblings(e.target.id);
        dynamicSelect.searchOverData(e);

    },
    clearNextSiblings(selElmID) {
        //console.log(selElmID)
        let lastSelect = document.querySelector('#selectHouse select:last-of-type');
        while (lastSelect.id !== selElmID) {
            lastSelect.remove();
            lastSelect = document.querySelector('#selectHouse select:last-of-type');
        }

    },
    findFromArray(searchTerm, listArray, srcSelectElement) {
        //console.log(searchTerm);
        //console.log(srcSelectElement)
        if (searchTerm === listArray[0] && listArray.length > 1) {
            // found something
            let newSelectElement = this.createSelect(searchTerm);
            newSelectElement.className = 'selectElements';
//
            srcSelectElement.insertAdjacentElement('afterend', newSelectElement);
            //

            dynamicSelect.createOption(this.selectAnOptionText, newSelectElement)
            listArray[1].forEach(item => {
                if (typeof item !== 'string') {
                    dynamicSelect.createOption(item[0], newSelectElement)
                } else {
                    dynamicSelect.createOption(item, newSelectElement)
                }

            })
            this.reAttachEvents();
        } else {
            if (listArray.length > 1) {
                //console.log(listArray)
                listArray[1].forEach(item => {
                    if (Array.isArray(item[1]) && item.length > 1) {
                        this.findFromArray(searchTerm, item, srcSelectElement)
                    }
                })
            }

        }
    }
}


let resetAll = ()=>{
    document.getElementById('resetAll').addEventListener('click',()=>{
        localStorage.clear();
        dynamicSelect.selectHouse.innerHTML='';
        dynamicSelect.init();
    })
}
