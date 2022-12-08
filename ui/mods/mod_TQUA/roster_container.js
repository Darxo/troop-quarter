var RosterContainer = function( _containerID )
{
    // this.mSQHandle = null;
    this.mEventListener = null;

    // Initialisation:
    this.mContainerID = _containerID;

    // Load From Data
    this.mName = null;
    this.mType = null;      // Secondary name-like string
    this.mSlots = [];            // Array of DIVs that a brother can fit in
    this.mBrotherList = [];      // Array of BrotherObject objects
    this.mBrotherMin = 0;       // minimum allowed brothers in a contaner (player roster can never have less than 1)
    this.mBrotherMax = 27;      // Maximum allows brothers in this list
    this.mSlotLimit = 27;       // Maximum slots on this list

    // Dynamic Variables
    this.mBrotherCurrent = 0;     // Current amount of brothers in this container
    this.mSelectedBrother = -1;   // Index of the currently selected brother; negative = none

    // Optional DIVs
    this.mListContainer = null;     // Contains all Slots created by this class. Is only used externally from RosterManager
    this.mRosterCountLabel = null;  // Will be updated with current/max brothers
    this.mRosterNameLabel = null;   // Will be updated with name (type)

    // Config
    this.mDeadZoneElement = null;      // Anything above this element is considered a deadZone for DropHandle

    this.mIsCollapsed = false;
    this.mMoodVisible = true;      // Show the Mood Symbol on the character?
    this.mInjuriesVisible = true;   // List all injuries on top of the character?
    this.mLostHPVisible = true;     // Draw Icon that indicates character is not at full HP?
    this.mCanSelect = true;
    this.mCanRemove = true;
    this.mCanImport = true;
    this.mCanReposition = true;
    this.mCanSelectEmptySlots = false;
    this.mSlotClasses = '<div class="ui-control is-brother-slot is-roster-slot"/>';     // Classes that are assigned to slot DIVs of this container
}

RosterContainer.prototype.loadFromData = function( _rosterData )
{
    var entries = Object.keys(_rosterData);
    for(var i = 0; i < entries.length; i++)
    {
        if (entries[i] in this)
        {
            this[entries[i]] = _rosterData[entries[i]];
            console.error("loading variable "+ entries[i] + " to value " + _rosterData[entries[i]]);
        }
    }
    this.updateNameLabel();
    this.updateCountLabel();
    return null;

    if ('Name' in _data && _data.Name !== null) this.mName = _data.Name;
    if ('Roster' in _data && _data.Roster !== null) this.mBrotherList = _data.Roster;
    if ('BrotherMin' in _data && _data.BrotherMin !== null) this.mBrotherMin = _data.BrotherMin;
    if ('BrotherMax' in _data && _data.BrotherMax !== null) this.mBrotherMax = _data.BrotherMax;
    if ('SlotLimit' in _data && _data.SlotLimit !== null)   this.mSlotLimit = _data.SlotLimit;
}

{   // Basic Getter and Setter
    RosterContainer.prototype.attachCountLabel = function( _countLabel )
    {
        this.mRosterCountLabel = _countLabel;
    }

    RosterContainer.prototype.attachNameLabel = function( _nameLabel )
    {
        this.mRosterNameLabel = _nameLabel;
    }

    RosterContainer.prototype.getSlots = function()
    {
        return this.mSlots;
    }

    RosterContainer.prototype.getBrothers = function()
    {
        return this.mBrotherList;
    }
    RosterContainer.prototype.getBrotherByIndex = function (_index)
    {
        if (_index < this.mBrotherList.length) return this.mBrotherList[_index];
        return null;
    };
    RosterContainer.prototype.isEmpty = function(_slotIndex)
    {
        // console.error(this.mContainerID + " " + this.mSlotLimit + " " + this.mBrotherCurrent);
        // console.error("isEmpty of mBrotherList[" + _slotIndex + "] is " + this.mBrotherList[_slotIndex]);
        if (this.mBrotherList[_slotIndex] === undefined)
        {
            console.error("mBrotherList[" + _slotIndex + "] is undefined! The arraysize is " + this.mBrotherList.length);
        }
        return (this.mBrotherList[_slotIndex] === null);
    };

    RosterContainer.prototype.setCollapsed = function( _collapsed )
    {
        this.mIsCollapsed = _collapsed;
        this.setSlotVisibility(!this.mIsCollapsed);
    }

    RosterContainer.prototype.toggleCollapse = function()
    {
        this.setCollapsed(!this.mIsCollapsed);
    }
}

{   // Smart Getter and Isser

    // Returns a data object with 'Index' and 'Brother' object
    RosterContainer.prototype.getBrotherByID = function (_brotherId)
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

    // Returns the first empty slot
    RosterContainer.prototype.getIndexOfFirstEmptySlot = function()
    {
        for (var i = 0; i < this.mSlots.length; i++)
        {
            if (this.isEmpty(i)) return i;
        }
        return null
    }

    RosterContainer.prototype.isInDeadZone = function( _offsetX, _offsetY)
    {
        return false;
        if (this.mDeadZoneElement === null) return false;
        console.error("mDeadZoneElement-Y " + this.mDeadZoneElement.offset().top);
        console.error("_offsetY " + _offsetY);
        if (_offsetY < this.mDeadZoneElement.offset().top) return true;
        return false;
    }

    RosterContainer.prototype.setSlotVisibility = function( _isVisible )
    {
        if (_isVisible === true) return this.showElement(this.mListContainer);
        if (_isVisible === false) return this.hideElement(this.mListContainer);
    }

    RosterContainer.prototype.hideElement = function(_element)
    {
        _element.css('position', 'absolute');
        _element.css('top', '-3000');
        _element.css('pointer-events', 'none');
    },

    RosterContainer.prototype.showElement = function(_element)
    {
        _element.css('position', 'relative');
        _element.css('top', '0');
        _element.css('pointer-events', 'auto');
    }
}

{   // Little helper functions
    RosterContainer.prototype.updateCountLabel = function()
    {
        if (this.mRosterCountLabel === null) return;

        this.mRosterCountLabel.html('' + this.mBrotherCurrent + '/' + this.mBrotherMax);
    }

    RosterContainer.prototype.updateNameLabel = function()
    {
        if (this.mRosterNameLabel === null) return;
        var labelString = "";
        if (this.mName !== null) labelString += this.mName;
        this.mRosterNameLabel.html(labelString);
        if (this.mName === null) return;
        if (this.mType === null) return;
        labelString = '<span class="label text-font-medium font-color-label">' + labelString + '</span>';
        // labelString += " (" + this.mType + ")";
        this.mRosterNameLabel.html(labelString);


    }

    RosterContainer.prototype.selectNext = function()
    {
        if (this.mSelectedBrother < 0) return false;
        for (var i = this.mSelectedBrother + 1; i < this.mBrotherList.length; i++)
        {
            if (this.mBrotherList[i] === null) continue;
            return this.selectSlot(i);
        }
        return this.selectFirst();
    }

    RosterContainer.prototype.selectFirst = function()
    {
        for (var i = 0; i < this.mBrotherList.length; ++i)
        {
            if (this.mBrotherList[i] === null) continue;
            return this.selectSlot(i);
        }
        return false;
    }

    RosterContainer.prototype.selectPrev = function()
    {
        if (this.mSelectedBrother < 0) return false;
        for (var i = this.mSelectedBrother - 1; i >= 0; i--)
        {
            if (this.mBrotherList[i] === null) continue;
            return this.selectSlot(i);
        }
        return this.selectLast();
    }

    RosterContainer.prototype.selectLast = function()
    {
        for (var i = (this.mBrotherList.length - 1); i >= 0; i--)
        {
            if (this.mBrotherList[i] === null) continue;
            return this.selectSlot(i);
        }
    }

}

{   // Selection
    RosterContainer.prototype.deselectCurrent = function()
    {
        if (this.mSelectedBrother < 0) return;
        var slot = this.mSlots[this.mSelectedBrother];
        slot.find('#slot-index:first').removeClass('is-selected');
        // console.error("Deselected slot: " + this.mSelectedBrother);
        this.mSelectedBrother = -1;
    }

    RosterContainer.prototype.selectBrother = function (_brotherID)
    {
        if (this.mCanSelect === false) return false;
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

    RosterContainer.prototype.hasSelected = function()     // Maybe make this function a bit smarter to detect/correct errors?
    {
        return (this.mSelectedBrother >= 0);
    }

    // SAFE - Selects the slot on the index
    RosterContainer.prototype.selectSlot = function(_slotIndex)    // todo add default value -1
    {
        // console.error("_slotIndex " + _slotIndex);
        if (this.mCanSelect === false) return false;
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
    RosterContainer.prototype.getSelected = function()
    {
        if (this.mSelectedBrother < 0) return null;         // Not brother was selected
        var selectedBrother = this.mBrotherList[this.mSelectedBrother];
        if (selectedBrother === null) this.deselectCurrent();   // For some reason the brother on the selection vanished
        return selectedBrother;
    }

}

{   // DIV stuff
    // Create a new DIV object out of a brother object to assign to a slot
    RosterContainer.prototype.addBrotherSlotDIV = function(_brotherData, _index)
    {
        // console.error(this.mSlots.length + " " + _index);
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
        this.updateCountLabel();

        // Temporary
        // result.attr('id', 'slot-index_' + _brotherData[CharacterScreenIdentifier.Entity.Id]);

        // update image & name
        var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
        var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

        result.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);

        var character = _brotherData[CharacterScreenIdentifier.Entity.Character.Key];
        if(CharacterScreenIdentifier.Entity.Character.LeveledUp in character && character[CharacterScreenIdentifier.Entity.Character.LeveledUp] === true)
        {
            result.assignListBrotherLeveledUp();
        }

        if('moodIcon' in character)
        {
            result.showListBrotherMoodImage(this.mMoodVisible, character['moodIcon']);
        }

        if (this.mInjuriesVisible)
        {
            for(var i = 0; i != _brotherData['injuries'].length && i < 3; ++i)
            {
                result.assignListBrotherStatusEffect(_brotherData['injuries'][i].imagePath, _brotherData[CharacterScreenIdentifier.Entity.Id], _brotherData['injuries'][i].id)
            }
        }

        if(this.mLostHPVisible && _brotherData['injuries'].length <= 2 && _brotherData['stats'].hitpoints < _brotherData['stats'].hitpointsMax)
        {
            result.assignListBrotherDaysWounded();
        }

        return result;
    }

    RosterContainer.prototype.updateBrotherDIV = function(_brotherData)
    {
        var brotherID = _brotherData[CharacterScreenIdentifier.Entity.Id];
        var brother = this.getBrotherByID(brotherID);
        if (brother === null) return false;

        var slotDIV = this.mSlots[brother.Index].find('#slot-index:first');
        if (slotDIV.length === 0)
        {
            console.error("slot.length === 0");
            return;
        }

        // update image & name
        var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
        var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
        var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

        slotDIV.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);
        slotDIV.assignListBrotherName(character[CharacterScreenIdentifier.Entity.Character.Name]);
        slotDIV.assignListBrotherDailyMoneyCost(character[CharacterScreenIdentifier.Entity.Character.DailyMoneyCost]);

        slotDIV.showListBrotherMoodImage(this.mMoodVisible, character['moodIcon']);

        slotDIV.removeListBrotherStatusEffects();

        for (var i = 0; i != _data['injuries'].length && i < 3; ++i)
        {
            slotDIV.assignListBrotherStatusEffect(_data['injuries'][i].imagePath, character[CharacterScreenIdentifier.Entity.Id], _data['injuries'][i].id)
        }

        if (_data['injuries'].length <= 2 && _data['stats'].hitpoints < _data['stats'].hitpointsMax)
        {
            slotDIV.assignListBrotherDaysWounded();
        }

        if (CharacterScreenIdentifier.Entity.Character.LeveledUp in character && character[CharacterScreenIdentifier.Entity.Character.LeveledUp] === false)
        {
            slotDIV.removeListBrotherLeveledUp();
        }

        // slotDIV.showListBrotherLockImage(!this.mCanRemove);
    }

    RosterContainer.prototype.createBrotherSlots = function()
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
        return this.mSlots;
    }

}

{   // Moving Brothers around
    // Insert Slot and Brother data that are coming from another slot into a new slot
    RosterContainer.prototype.importBrother = function ( _slotIdx, _data )
    {
        if (this.mCanImport === false) return false;
        if (this.isEmpty(_slotIdx) === false) return false;
        if (_data === null) return false;

        var newSlot = this.mSlots[_slotIdx];

        _data.SlotData.data('idx', _slotIdx);                // Adjust the internal index variable of the arrivign slotData
        _data.SlotData.data('tag', this.mContainerID);       // Adjust the internal containerID variable of the arrivign slotData
        _data.SlotData.appendTo(newSlot);                    // Attach the Slot Data to the slot

        newSlot.data('child', _data.SlotData);               // Insert the Slot Data
        this.mBrotherList[_slotIdx] = _data.BrotherData;     // Insert the Brother Data

        this.mBrotherCurrent++;
        this.updateCountLabel();
        if (_data.IsSelected === true) this.selectSlot(_slotIdx);

        return true;
    }

    // Removes the brother related div data from a slot and the brother data from the brother array
    // Returns an object with the removed slotData, playerData and a bool indicating whether this slot was highlighted
    RosterContainer.prototype.removeBrother = function ( _slotIdx )
    {
        if (this.mCanRemove === false) return null;
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
        this.updateCountLabel();
        if (data.IsSelected) this.deselectCurrent();

        return data;
    }

    // This is bring called from outside. The contents of two slots are being swapped
    RosterContainer.prototype.swapSlots = function ( _firstIdx, _secondIdx )
    {
        if (this.mCanReposition === false) return false;
        if (_firstIdx === null || _secondIdx === null) return false;
        if (this.isEmpty(_firstIdx) && this.isEmpty(_secondIdx)) return true;   // We just swapped two empty slots, gg

        if (this.isEmpty(_firstIdx))    return this.relocateBrother(_secondIdx, _firstIdx);
        if (this.isEmpty(_secondIdx))   return this.relocateBrother(_firstIdx, _secondIdx);

        return this.swapBrothers(_firstIdx, _secondIdx);
    }

    // Switch the positions of two brothers in this container
    // _sourceIdx is an unsigned integer
    // _targetIdx is an unsigned integer
    RosterContainer.prototype.swapBrothers = function ( _firstIdx, _secondIdx )
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

        if (this.mSelectedBrother === _firstIdx)
        {
            this.mSelectedBrother = _secondIdx;
        }
        else if (this.mSelectedBrother === _secondIdx)
        {
            this.mSelectedBrother = _firstIdx;
        }

        // a class is getting added thats not possible to be removed

        var tmp = this.mBrotherList[_firstIdx];
        this.mBrotherList[_firstIdx] = this.mBrotherList[_secondIdx];
        this.mBrotherList[_secondIdx] = tmp;
        return true;
    }

    // Removes a brother from one slot and move them to another slot within this container
    // _sourceIdx is an unsigned integer
    // _targetIdx is an unsigned integer
    RosterContainer.prototype.relocateBrother = function ( _sourceIdx, _targetIdx )
    {
        console.error("relocateBrother");
        var sourceSlot = this.mSlots[_sourceIdx];
        var targetSlot = this.mSlots[_targetIdx];

        var sourceData = sourceSlot.data('child');
        sourceData.data('idx', _targetIdx);
        sourceData.appendTo(targetSlot);

        targetSlot.data('child', sourceData);
        sourceSlot.data('child', null);

        if (this.mSelectedBrother === _sourceIdx) this.mSelectedBrother = _targetIdx;

        var tmp = this.mBrotherList[_sourceIdx];
        this.mBrotherList[_sourceIdx] = this.mBrotherList[_targetIdx];
        this.mBrotherList[_targetIdx] = tmp;

        // this.notifyBackendUpdateRosterPosition(sourceData.data('ID'), _targetIdx);
        return true;
    }

}
