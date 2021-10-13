###### **What is dynamicSelect?**

The **dynamicSelect** is a small library which has cascading select box chain. It keeps selectbox values in an Array structure at localStorage. Using an input box with select boxes to create multidimensional array structure and using it.

###### How to use it?
If you want to use it for creating a multidimensional array and store it elsewhere like **localStorage**. You can directly use it with your configs.

After creating done, you can use **get** method of **dynamicSelect** object to get data.

`let myData = dynamicSelect.get(); `

If you want to begin with an array structure to built new data on it, use config file and dummyData variable. You can see a sample in the **index.html** file.

You can see an input box and a starter select box in a container div. You can change css styling from html file and classes and id properties from config file.

First thing to do is only writing into the input box and click outside (or enter). This action triggers the **add** method of **dynamicSelect**.
The first root item now can be seen on the first select box.

You can use any element with any event trigger to reset all data. To do so, just give reset triggering elements id and trigger event type into the config object's reset property (is also an object).

`reset:{resetItemId:'resetItemId', resetAction:'click'}`

The first select element refreshes automatically. But other selects has to be triggered by selected previous (parent) select box's change event.

###### What are the methods and what they do?

**Methods of dynamicSelect Object**

**init() method** 

This method reads config object parameter. If there is none it uses default values. After reading config object create dynamicSelect object self properties from this config. Add reset events to the given trigger page element. Create first select box. Run the first time select box loaders if there is any given data or localStorage has any data in it.
  Attach all events and triggers to these selectboxes. Adds new eventlistener to the given input box element to get new option values by triggered **add()** method.



**add() method**

When a new text entered into the textbox and change event of this triggered, add() method runs. This method gets the value of textbox and selected last option from last selectbox (if there was any selected option), search all array to find the index position of selected option, push the entered text as a new item next to the selected option position in the array. Insertion (push) is doing by creating an index based position from previous search on array. 

`dynamicSelect.tempContainer[0][1][0][1] = newOptionValue`

Lastly it empties the text box and returns true.

**set(data) method**

This method refreshes (or create if its first time) a value with **dynamicSelectData** key in the localStorage. Given data stringified two times and stored in **localStorage** with **dynamicSelectData** key.

`localStorage.setItem('dynamicSelectData',JSON.stringify(JSON.stringify(data)));`

**get() method**

The only function of this method is to get the data from localStorage with **dynamicSelectData** key and parse it two times to get the Array object back and returns it.

**locateTarget() method**

This method finds the index path of a given value in a given array. Also, this is a recursive method. Recursiveness is required to create a path of indices. This path will be used to insert new data into Array directly. The path kept as a string.

**runRawCode(rawCode) method**

This method creates and return a Function object as a constructor which also return an  IIFE (Immediately Invoked Function Expression) and runs your code after. This is a bit safer method than using eval. (I think it uses eval at the background before V8). This method used for inserting data into array with calculated target path.

**createOption(optionValue, targetSelect)**

This method sets an optionValue into given targetSelect as a new option.

**loadOptions(targetSelect)**

This method create new selects and fill them with options from Array data. Uses createOption method.

**createSelect(withThisId) method**

This method is creating a select element with given id and append it after the last created one.

**searchOverData(event) method**

This method triggered from any select element with change event. It uses the selected option's value and send it to findFromArray method with Array data and source select element. It returns true/false dependent to option value existence in given data.

**reAttachEvents() method**

This method removes event listeners from given classnamed select boxes and re-add them to all. The event is pointed to another method. This pointed method clears next sibling selects and add `searchOverData(e)` again. When a select box value changes these methods clears next select box siblings and re-create them related to the selected value.

**clearNextSiblings(selElmID) method**

This method removes selectboxes from last to first until it reaches the select element with given id with `selElmID`.

**findFromArray(searchTerm, listArray, srcSelectElement) method**

This method is recursive. When an element changed its value library needs to search the array and if found any nested arrays belongs to this value than create its own select box and fill with its sub array values. After this insert this select box next to last one (just after clearing the olds). It uses `createSelect`, `createOption` and `reAttachEvents` methods.

**selectedLastItem() method**

This method returns the last option selected from the select box chain. The most tip branch value in the Array returned.

**reset() method()**

This method adds an event listener to given (by configs) element by id and given action. When this action occurs on this element, method resets all stored data in `LocalStorage` with `dynamicSelectData` key.
