var BrotherContainer = function( _containerID )
{
    this.mSQHandle = null;
    this.mEventListener = null;

    this.mContainerID = _containerID;

    // Container definitions
        // These two arrays are always supposed to be synchronized
        this.mSlots = [];            // Array of DIVs that a brother can fit in
        this.mBrotherList = [];      // Array of BrotherObject objects

        this.mBrotherCurrent = 0;     // Current amount of brothers in this container
        this.mBrotherMin = 0;       // minimum allowed brothers in a contaner (player roster can never have less than 1)
        this.mBrotherMax = 27;      // Maximum allows brothers in this list
        this.mSlotLimit = 27;       // Maximum slots on this list

    // Dynamic Variables
    this.mSelectedBrother = -1;   // Index of the currently selected brother; negative = none

    // Config
    this.mCanSelectEmptySlots = false;
    this.mSlotClasses = '<div class="ui-control is-brother-slot is-roster-slot"/>';
}

BrotherContainer.prototype.getSlots = function()
{
    return this.mSlots;
}

BrotherContainer.prototype.getBrothers = function()
{
    return this.mBrotherList;
}

BrotherContainer.prototype.loadFromData = function( _data )
{
    if ('Roster' in _data && _data.Roster !== null) this.mBrotherList = _data.Roster;
    if ('BrotherMin' in _data && _data.BrotherMin !== null) this.mBrotherMin = _data.BrotherMin;
    if ('BrotherMax' in _data && _data.BrotherMax !== null) this.mBrotherMax = _data.BrotherMax;
    if ('SlotLimit' in _data && _data.SlotLimit !== null)   this.mSlotLimit = _data.SlotLimit
}

BrotherContainer.prototype.deselectCurrent = function()
{
    if (this.mSelectedBrother < 0) return;
    var slot = this.mSlots[this.mSelectedBrother];
    slot.find('#slot-index:first').removeClass('is-selected');
    // console.error("Deselected slot: " + this.mSelectedBrother);
    this.mSelectedBrother = -1;
}

BrotherContainer.prototype.selectBrother = function (_brotherID)
{
    for (var i = 0; i < this.mBrotherList.length; ++i)
    {
        var brother = this.mBrotherList[i];
        if (brother === null) continue;
        if (CharacterScreenIdentifier.Entity.Id in brother === false) continue;
        if (brother[CharacterScreenIdentifier.Entity.Id] !== _brotherID) continue;
        this.selectSlot(i);
        return true;
    }
    return false;
};

BrotherContainer.prototype.hasSelected = function()     // Maybe make this function a bit smarter to detect/correct errors?
{
    return (this.mSelectedBrother >= 0);
}

// SAFE - Selects the slot on the index
BrotherContainer.prototype.selectSlot = function(_slotIndex)    // todo add default value -1
{
    this.deselectCurrent();
    if (_slotIndex === null) return console.error("_slotIndex is null");
    if (_slotIndex < 0) return true;    // this function was called without parameter in which case we only deselect and do nothing else
    var slot = this.mSlots[_slotIndex];
    if (slot === null) return false;    // Can't select null slots.
    if (this.mBrotherList[_slotIndex] === null && this.mCanSelectEmptySlots === false) return false;    // Can't select empty slots

    this.mSelectedBrother = _slotIndex;
    slot.find('#slot-index:first').addClass('is-selected');
    // console.error("Selected slot: " + _slotIndex);
    return true;
};

// Returns the brother objects that is currently selected. Returns null if no one was selected or if the selection was invalid
BrotherContainer.prototype.getSelected = function()
{
    if (this.mSelectedBrother < 0) return null;         // Not brother was selected
    var selectedBrother = this.mBrotherList[this.mSelectedBrother];
    if (selectedBrother === null) this.deselectCurrent();   // For some reason the brother on the selection vanished
    return selectedBrother;
}

BrotherContainer.prototype.getBrotherByIndex = function (_index)
{

    if (_index < this.mBrotherList.length) return this.mBrotherList[_index];

    return null;
};

// Returns a data object with 'Index' and 'Brother' object
BrotherContainer.prototype.getBrotherByID = function (_brotherId)
{
    var data =
    {
        Index   : null,
        Tag     : null,
        Brother : null,
        IsNull  : true
    };

    if (this.mBrotherList !== null && jQuery.isArray(this.mBrotherList))
    {
        for (var i = 0; i < this.mBrotherList.length; ++i)
        {
            var brother = this.mBrotherList[i];

            if (brother != null && CharacterScreenIdentifier.Entity.Id in brother && brother[CharacterScreenIdentifier.Entity.Id] === _brotherId)
            {
                data.Index = i;
                data.Tag = this.mContainerID;
                data.Brother = brother;
                data.IsNull = false;
                break;
            }
        }
    }

    return data;
};

// Create a new DIV object out of a brother object to assign to a slot
BrotherContainer.prototype.addBrotherSlotDIV = function(_brotherData, _index)
{
    var parentDiv = this.mSlots[_index];
    var character = _brotherData[CharacterScreenIdentifier.Entity.Character.Key];
    var brotherID = _brotherData[CharacterScreenIdentifier.Entity.Id];

    var result = parentDiv.createListBrother(brotherID);
    result.attr('id', 'slot-index');
    result.data('ID', brotherID);
    result.data('avatar', (CharacterScreenIdentifier.Entity.Character.IsPlayerCharacter in character ? character[CharacterScreenIdentifier.Entity.Character.IsPlayerCharacter] : false));
    result.data('idx', _index);
    result.data('tag', this.mContainerID);
    result.unbindTooltip();
    result.bindTooltip({ contentType: 'ui-element', entityId: brotherID, elementId: 'pokebro.roster' });
    parentDiv.data('child', result);
    this.mBrotherCurrent++;

    // update image & name
    var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
    var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

    result.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);

    // the mood icon is messed up in the screen, i hate it so i hide it, problem solve with minimum effort
    //result.showListBrotherMoodImage(this.IsMoodVisible, character['moodIcon']);

    for(var i = 0; i != _brotherData['injuries'].length && i < 3; ++i)
    {
        result.assignListBrotherStatusEffect(_brotherData['injuries'][i].imagePath, _brotherData[CharacterScreenIdentifier.Entity.Id], _brotherData['injuries'][i].id)
    }

    if(_brotherData['injuries'].length <= 2 && _brotherData['stats'].hitpoints < _brotherData['stats'].hitpointsMax)
    {
        result.assignListBrotherDaysWounded();
    }

    return result;
}

BrotherContainer.prototype.createBrotherSlots = function()
{
    this.mSlots = [];
    for (var i = 0 ; i < this.mSlotLimit; i++)
    {
        this.mSlots.push(null);
        this.mSlots[i] = $(this.mSlotClasses);
        this.mSlots[i].data('idx', i);
        this.mSlots[i].data('tag', this.mContainerID);
        this.mSlots[i].data('child', null);
    }
}

// Returns the first empty slot
BrotherContainer.prototype.getIndexOfFirstEmptySlot = function()
{
    for (var i = 0; i < this.mSlots.length; i++)
    {
        if (this.mSlots[i].data('child') === null)
        {
            return i;
        }
    }
    return null
}

// Returns the first empty slot
BrotherContainer.prototype.getFirstEmptySlot = function()
{
    for (var i = 0; i < this.mSlots.length; i++)
    {
        if (this.mSlots[i].data('child') === null)
        {
            return this.mSlots[i];
        }
    }
    return null
}

BrotherContainer.prototype.updateBrothers = function (_data)
{
    if(_data === undefined || _data === null)
    {
        return;
    }

    if ('BrotherList' in _data && _data.BrotherList !== null)
    {
        this.updateBrotherList(_data.BrotherList);
    }
};

BrotherContainer.prototype.loadBrotherList = function(_newBrotherList)
{
    for (var i = 0 ; i < this.mSlotLimit; i++)
    {
        if (_newBrotherList[i] === null) this.mBrotherList[i] = null;
        else this.mBrotherList[i] = new BrotherObject(_newBrotherList[i]);
    }
    this.mBrotherCount = _newBrotherList.length;

    for(var i = 0; i != this.mSlots.length; ++i)
    {
        this.mSlots.empty();
        this.mSlots.data('child', null);

        var newBrother = mBrotherList[i];
        if (newBrother === null) continue;

        this.addBrotherToSlotDIV(newBrother, i);
    }
}

BrotherContainer.prototype.addBrotherToSlotDIV = function(_brother, _index)
{
    var brotherDIV = _brother.addToSlotDIV(this.mSLots[_index], _index);

    // event listener when left-click the brother
    brotherDIV.assignListBrotherClickHandler(function (_brother, _event)
    {
        var data = _brother.data('brother')[CharacterScreenIdentifier.Entity.Id];
        var openPerkTree = (KeyModiferConstants.AltKey in _event && _event[KeyModiferConstants.AltKey] === true);

        if (openPerkTree)
            self.openPerkPopupDialog(data);
        else
            self.setBrotherSelectedByID(data);
    });

    // event listener when right-click the brother
    brotherDIV.mousedown(function (event)
    {
        if (event.which === 3)
        {
            //var data = $(this).data('brother');
            //var data = $(this);
            return self.quickMoveBrother($(this));
        }
    });
}

BrotherContainer.prototype.updateBrotherList = function(_newBrotherList)
{
    for (var i = 0 ; i < _newBrotherList.length; i++)
    {

        this.mBrotherList[i] = _newBrotherList[i];
    }
    this.mBrotherCount = _newBrotherList.length;
}

BrotherContainer.prototype.isEmpty = function(_slotIndex)
{
    return (this.mBrotherList[_slotIndex] === null);
};

// Called once at the start; Returns the array with the slots
BrotherContainer.prototype.createBrotherSlots = function ()
{
    var self = this;

    this.mSlots = [];
    for (var i = 0 ; i < this.mSlotLimit; i++)
    {
        var slot = $(this.mSlotClasses);

        slot.data('idx', i);
        slot.data('tag', this.mContainerID);
        slot.data('child', null);

        this.mSlots.push(slot);
    }
    return this.mSlots;
};

// Insert Slot and Brother data that are coming from another slot into a new slot
BrotherContainer.prototype.importBrother = function ( _slotIdx, _data )
{
    console.error("importBrother");
    if (this.isEmpty(_slotIdx) === false) return false;
    if (_data === null) return false;

    var newSlot = this.mSlots[_slotIdx];

    _data.SlotData.data('idx', _slotIdx);                // Adjust the internal index variable of the arrivign slotData
    _data.SlotData.data('tag', this.mContainerID);       // Adjust the internal containerID variable of the arrivign slotData
    _data.SlotData.appendTo(newSlot);                    // Attach the Slot Data to the slot

    newSlot.data('child', _data.SlotData);               // Insert the Slot Data
    this.mBrotherList[_slotIdx] = _data.BrotherData;     // Insert the Brother Data

    this.mBrotherCurrent++;
    if (_data.IsSelected === true) this.selectSlot(_slotIdx);

    return true;
}

// Removes the brother related div data from a slot and the brother data from the brother array
// Returns an object with the removed slotData, playerData and a bool indicating whether this slot was highlighted
BrotherContainer.prototype.removeBrother = function ( _slotIdx )
{
    console.error("removeBrother");
    if (this.isEmpty(_slotIdx)) return null;

    var slot = this.mSlots[_slotIdx];

    var data = {
        IsSelected : (_slotIdx === this.mSelectedBrother),
        SlotData : slot.data('child'),
        BrotherData : this.mBrotherList[_slotIdx]
    }

    slot.data('child', null);                   // Make the slot child null
    this.mBrotherList[_slotIdx] = null;         // Make the list entry null

    this.mBrotherCurrent--;
    if (data.IsSelected) this.deselectCurrent();

    return data;
}

// This is bring called from outside. The contents of two slots are being swapped
BrotherContainer.prototype.swapSlots = function ( _firstIdx, _secondIdx )
{
    if (_firstIdx === null || _secondIdx === null) return false;
    if (this.isEmpty(_firstIdx) && this.isEmpty(_secondIdx)) return true;   // We just swapped two empty slots, gg

    if (this.isEmpty(_firstIdx))    return this.relocateBrother(_secondIdx, _firstIdx);
    if (this.isEmpty(_secondIdx))   return this.relocateBrother(_firstIdx, _secondIdx);

    return this.swapBrothers(_firstIdx, _secondIdx);
}

// Switch the positions of two brothers in this container
// _sourceIdx is an unsigned integer
// _targetIdx is an unsigned integer
BrotherContainer.prototype.swapBrothers = function ( _firstIdx, _secondIdx )
{
    console.error("swapBrothers");
    var sourceSlot = this.mSlots[_firstIdx];
    var targetSlot = this.mSlots[_secondIdx];

    var sourceData = sourceSlot.data('child');
    var targetData = targetSlot.data('child');

    // this.notifyBackendUpdateRosterPosition(sourceData.data('ID'), _secondIdx);
    // this.notifyBackendUpdateRosterPosition(targetData.data('ID'), _firstIdx);

    sourceData.data('idx', _secondIdx);
    targetData.data('idx', _firstIdx);

    targetData.detach();

    sourceData.appendTo(targetSlot);
    targetSlot.data('child', sourceData);

    targetData.appendTo(sourceSlot);
    sourceSlot.data('child', targetData);


    var tmp = this.mBrotherList[_firstIdx];
    this.mBrotherList[_firstIdx] = this.mBrotherList[_secondIdx];
    this.mBrotherList[_secondIdx] = tmp;

    if (this.mSelectedBrother === _firstIdx) this.selectSlot(_secondIdx);
    return true;
}

// Removes a brother from one slot and move them to another slot within this container
// _sourceIdx is an unsigned integer
// _targetIdx is an unsigned integer
BrotherContainer.prototype.relocateBrother = function ( _sourceIdx, _targetIdx )
{
    console.error("relocateBrother");
    var sourceSlot = this.mSlots[_sourceIdx];
    var targetSlot = this.mSlots[_targetIdx];

    var sourceData = sourceSlot.data('child');
    sourceData.data('idx', _targetIdx);
    sourceData.appendTo(targetSlot);

    targetSlot.data('child', sourceData);
    sourceSlot.data('child', null);

    var tmp = this.mBrotherList[_sourceIdx];
    this.mBrotherList[_sourceIdx] = this.mBrotherList[_targetIdx];
    this.mBrotherList[_targetIdx] = tmp;

    // this.notifyBackendUpdateRosterPosition(sourceData.data('ID'), _targetIdx);
    return true;
}

// Backend Notifications
BrotherContainer.prototype.notifyBackendUpdateRosterPosition = function (_brotherID, _newPosition)
{
    // Todo implement callback to allow squirrelto intervene here
    SQ.call(this.mSQHandle, 'onUpdateRosterPosition', [ _brotherID, _newPosition ]);
};



// Generic Stuff

    BrotherContainer.prototype.onDisconnection = function ()
    {
        this.mSQHandle = null;

        // notify listener
        if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
        {
            this.mEventListener.onModuleOnDisconnectionCalled(this);
        }
    };

    // Stuff for notifying squirrel backend
    BrotherContainer.prototype.registerEventListener = function(_listener)
    {
        this.mEventListener = _listener;
    };

    BrotherContainer.prototype.isConnected = function ()
    {
        return this.mSQHandle !== null;
    };

    BrotherContainer.prototype.onConnection = function (_handle)
    {
        this.mSQHandle = _handle;

        // notify listener
        if (this.mEventListener !== null && ('onModuleOnConnectionCalled' in this.mEventListener))
        {
            this.mEventListener.onModuleOnConnectionCalled(this);
        }
    };

    BrotherContainer.prototype.onDisconnection = function ()
    {
        this.mSQHandle = null;

        // notify listener
        if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
        {
            this.mEventListener.onModuleOnDisconnectionCalled(this);
        }
    };
