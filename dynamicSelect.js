const dynamicSelect = {
    init(configs = {
             selectElementsMainContainerId: 'selectHouse',
             newOptionTextBoxId: 'newOption',
             firstSelectBoxId: 'firstSelectBox',
             reset: {resetItemId: 'resetItemId', resetAction: 'click'},
             selectAnOptionText: 'Select an option',
             mustUnique: false,
             selectElementsClassName: 'selectElements',
         }
    ) {
        this.mustUnique = configs.mustUnique;
        this.resetConf = {...configs.reset};
        this.tempContainer = null;
        this.selectElementsClassName = configs.selectElementsClassName;
        this.firstSelectBoxId = configs.firstSelectBoxId;
        this.reset();
        this.selectAnOptionText = configs.selectAnOptionText;
        let newOptionTextBox = document.createElement('input');
        newOptionTextBox.id = configs.newOptionTextBoxId;
        this.selectHouse = document.getElementById(configs.selectElementsMainContainerId);
        this.selectHouse.appendChild(newOptionTextBox);
        this.newOptionBox = newOptionTextBox;
        this.selectHouse.appendChild(this.createSelect(configs.firstSelectBoxId));
        if (configs.initData) {
            this.set(configs.initData)
        }
        this.loadOptions(document.getElementById(this.firstSelectBoxId));
        this.reAttachEvents();
        newOptionTextBox.addEventListener('change', () => {
            this.add()
        });
    },
    add() {
        let newOptionValue = this.newOptionBox.value;
        if (!newOptionValue || newOptionValue === "") {
            return false;
        }
        let parentSelection = this.selectHouse.querySelector('select:last-of-type');
        let targetNodeValue = (parentSelection.value !== this.selectAnOptionText) ? parentSelection.value : parentSelection.id;
        if (document.getElementById(this.firstSelectBoxId).length === 1) {
            this.set([[`${newOptionValue}`]]);
            this.createOption(newOptionValue, document.getElementById(this.firstSelectBoxId));
        } else if (targetNodeValue === this.firstSelectBoxId) {
            let data = this.get();
            data.push([newOptionValue]);
            this.tempContainer = data;
            this.set(this.tempContainer);
            this.createOption(newOptionValue, document.getElementById(this.firstSelectBoxId));
        } else {
            let data = this.get();
            let indexPath = this.locateTarget(targetNodeValue, data);
            this.tempContainer = data;

            let pathString = `dynamicSelect.tempContainer`;
            for (let i = 0; i < indexPath.length - 1; i++) {
                pathString += `[${indexPath[i]}]`;
            }
            this.runRawCode(
                '(' + pathString + '.length==2' +
                '?' + pathString + '[1].push(["' + newOptionValue + '"])' +
                ':' + pathString + '.length==1' +
                '?' + pathString + '.push([["' + newOptionValue + '"]])' +
                ':' + pathString + '[' + indexPath[indexPath.length - 1] + ']=(["' + targetNodeValue + '",["' + newOptionValue + '"]]))');
            this.set(this.tempContainer);
        }
        this.newOptionBox.value = '';
        return true;
    },
    get() {
        return localStorage.getItem('dynamicSelectData') ? JSON.parse(JSON.parse(localStorage.getItem('dynamicSelectData'))) : [];
    },
    set(data) {
        localStorage.setItem('dynamicSelectData', JSON.stringify(JSON.stringify(data)));
    },
    locateTarget(targetNodeValue, data, indexPath = []) {
        if (Array.isArray(data)) {
            for (let x = 0; x < data.length; x++) {
                if (Array.isArray(data[x])) {
                    if (data[x].flat(Infinity).includes(targetNodeValue)) { //might be buggy because of values in values
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
        let newOptionElement = document.createElement('option');
        newOptionElement.text = optionValue;
        newOptionElement.value = optionValue;
        targetSelect.appendChild(newOptionElement);
    },
    loadOptions(targetSelect) {
        this.createOption(this.selectAnOptionText, targetSelect);
        if (Array.isArray(this.get())) {
            this.get().forEach(item => {
                if (Array.isArray(item)) {
                    this.createOption(item[0], targetSelect);
                } else if (typeof item === 'string') {
                    this.createOption(item, targetSelect);
                }
            });
        }
    },
    createSelect(withThisId) {
        let newSelectElement = document.createElement('select');
        newSelectElement.id = withThisId;
        newSelectElement.className = this.selectElementsClassName;
        return newSelectElement;
    },
    searchOverData(event) {
        let searchTerm = event.target.value;
        let srcSelectElement = event.target;
        this.get().every(data => {
                return !this.findFromArray(searchTerm, data, srcSelectElement);
            }
        )
    },
    reAttachEvents() {
        document.querySelectorAll(`.${this.selectElementsClassName}`).forEach(selElm => {
            selElm.removeEventListener("change", (e) => {
                this.selectEventListeners(e)
            }, true);
            selElm.addEventListener("change", (e) => {
                this.selectEventListeners(e)
            }, true)
        })
    },
    selectEventListeners(e) {
        this.clearNextSiblings(e.target.id);
        this.searchOverData(e);
    },
    clearNextSiblings(selElmID) {
        let lastSelect = document.querySelector(`#${this.selectHouse.id} select:last-of-type`);
        while (lastSelect.id !== selElmID) {
            lastSelect.remove();
            lastSelect = document.querySelector(`#${this.selectHouse.id} select:last-of-type`);
        }
    },
    findFromArray(searchTerm, listArray, srcSelectElement) {
        if (searchTerm === this.selectAnOptionText) {
            return false;
        }
        if (searchTerm === listArray[0]) {
            if (listArray.length === 1) {
            } else if (listArray.length === 2) {
                let newSelectElement = this.createSelect(searchTerm);
                newSelectElement.className = this.selectElementsClassName;
                srcSelectElement.insertAdjacentElement('afterend', newSelectElement);
                this.createOption(this.selectAnOptionText, newSelectElement);
                listArray[1].forEach(item => {
                    this.createOption(item[0], newSelectElement)
                })
                this.reAttachEvents();
            }
            return true;
        } else {
            if (listArray.length > 1) {
                listArray[1].forEach(item => {
                    if (Array.isArray(item[1]) && item.length > 1) {
                        this.findFromArray(searchTerm, item, srcSelectElement)
                    } else if (item === searchTerm) {
                        if (!document.getElementById(searchTerm)) {
                            let newSelectElement = this.createSelect(searchTerm);
                            newSelectElement.className = this.selectElementsClassName;
                            srcSelectElement.insertAdjacentElement('afterend', newSelectElement);
                            this.createOption(this.selectAnOptionText, newSelectElement);
                        }
                        this.createOption(item, document.getElementById(searchTerm));
                    }
                })
            }
        }
    },
    selectedLastItem() {
        let parentSelection = this.selectHouse.querySelector('select:last-of-type');
        return (parentSelection.value !== this.selectAnOptionText) ? parentSelection.value : parentSelection.id;
    },
    reset() {
        document.getElementById(this.resetConf.resetItemId).addEventListener(this.resetConf.resetAction, () => {
            localStorage.clear();
            this.selectHouse.innerHTML = '';
            this.init();
        })
    }
}
