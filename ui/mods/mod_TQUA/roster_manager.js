var RosterManager = function(_dataSource)
{
    this.mDataSource = null;
    this.mSQHandle        = null;
    this.mEventListener     = null;
    this.mBrotherContainer = [];        // Array of BrotherContainer
}

RosterManager.prototype.addContainer = function( _container )
{
    this.mBrotherContainer.push(_container);
    return _container;
}

RosterManager.prototype.get = function( _containerID )
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].mContainerID === _containerID) return this.mBrotherContainer[i];
    }
    return null;
}

// Returns the next container in line that comes after this one. Useful for quickMove features
// Returns null is this ID doesn't exists or this is the only container in the manager
RosterManager.prototype.getNext = function( _containerID )
{
    if (this.mBrotherContainer.length === 1) return null;
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].mContainerID === _containerID)
        {
            if (i < (this.mBrotherContainer.length - 1))  // We are not the last element
            {
                return this.mBrotherContainer[i + 1];
            }
            else
            {
                return this.mBrotherContainer[0];
            }
        }
    }

    return null;
}

// Returns the next container in line that comes after this one. Useful for quickMove features
// Returns null is this ID doesn't exists or this is the only container in the manager
RosterManager.prototype.getNextForInsert = function( _containerID )
{
    if (this.mBrotherContainer.length === 1) return null;

    var beforeIndex = null; // if we went full circle we need to return one of the elements before the source
    var afterIndex = null;
    var sourceFound = false;
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].mContainerID === _containerID)
        {
            sourceFound = true;
            continue;
        }
        if (this.mBrotherContainer[i].mCanImport === false) continue;   // skip all container that cant be imported
        if (sourceFound === false)
        {
            if (beforeIndex === null) beforeIndex = i;
            continue;
        }

        var afterIndex = i;
        break;
    }
    if (afterIndex === null) return this.mBrotherContainer[beforeIndex];
    console.error("getNextForInsert returns " + this.mBrotherContainer[afterIndex].mContainerID);
    return this.mBrotherContainer[afterIndex];
}

// When we don't know in which roster he is
RosterManager.prototype.getBrotherByID = function (_brotherID)
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        var playerBrother = this.mBrotherContainer[i].getBrotherByID(_brotherID);
        if (playerBrother.IsNull === false) return playerBrother;
    }
    return null;
};

// Returns the slot that is currently selected. This should usually have a brother inside
// Returns null if no slot is selected
RosterManager.prototype.getSelected = function()
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].hasSelected())
        {
            return {
                Index       : this.mBrotherContainer[i].mSelectedBrother,
                OwnerID     : this.mBrotherContainer[i].mContainerID,
                Owner       : this.mBrotherContainer[i],
                Brother     : this.mBrotherContainer[i].getSelected(),
                BrotherID   : this.mBrotherContainer[i].getSelected()[CharacterScreenIdentifier.Entity.Id]
            };
        }
    }
    console.error("getSelected returned null");
    return null;
}

RosterManager.prototype.loadFromData = function( _data )
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        var identifier = this.mBrotherContainer[i].mContainerID;
        if (identifier in _data && _data[identifier] !== null)
        {
            this.get(identifier).loadFromData(_data[identifier]);
            this.createBrotherSlots(identifier);
            this.onBrothersListLoaded(identifier);
        }
    }
}

RosterManager.prototype.setDeadZoneElement = function ( _deadZoneElement )
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].mContainerID === "Formation") continue;
        this.mBrotherContainer[i].mDeadZoneElement = _deadZoneElement;
    }
}


// create empty slots
RosterManager.prototype.createBrotherSlots = function ( _ownerID )
{
    var self = this;

    var parent = this.get(_ownerID);
    if (parent.mListContainer === null)
    {
        console.error("mListContainer was never initialised. Can't create Slots for it");
        return;
    }
    if (parent.mSlots.length >= parent.mSlotLimit) return;
    parent.mListContainer.empty();
    parent.createBrotherSlots();

    // event listener when dragging then drop bro to an empty slot
    var dropHandler = function (ev, dd)
    {
        var drag = $(dd.drag);
        var drop = $(dd.drop);
        var proxy = $(dd.proxy);

        if (proxy === undefined || proxy.data('idx') === undefined || drop === undefined || drop.data('idx') === undefined)
        {
            return false;
        }

        drag.removeClass('is-dragged');

        // Some Drophandler should only be active while they are in the visible area. Each container decides that for themselves

        // this.get(identifier).mDeadZoneBottom = this.mDeadZoneElement.offset().top;

        if (self.get(drop.data('tag')).isInDeadZone(dd.offsetX, dd.offsetY)) return false;

        if (drag.data('tag') == drop.data('tag'))
        {
            if (drag.data('idx') == drop.data('idx'))
                return false;
        }
        else
        {
            // deny when the dragged brother is a player character
            if (drag.data('player') === true)
                return false;
        }

        self.swapSlots(drag.data('idx'), drag.data('tag'), drop.data('idx'), drop.data('tag'));
    };

    for (var i = 0; i < parent.mSlots.length; ++i)
    {
        parent.mListContainer.append(parent.mSlots[i]);
        parent.mSlots[i].drop("end", dropHandler);
    }
};

RosterManager.prototype.onBrothersListLoaded = function ( _ownerID )
{
    var parent = this.get(_ownerID);
    for(var i = 0; i != parent.mSlots.length; ++i)
    {
        parent.mSlots[i].empty();
        parent.mSlots[i].data('child', null);
    }

    parent.mBrotherCurrent = 0;

    if (parent.mBrotherList === null || !jQuery.isArray(parent.mBrotherList) || parent.mBrotherList.length === 0)
    {
        return;
    }

    for (var i = 0; i < parent.mBrotherList.length; ++i)
    {
        var brother = parent.mBrotherList[i];

        if (brother !== null)
        {
            this.addBrotherSlotDIV(parent, brother, i);
        }
    }
};

// add brother to empty slot
RosterManager.prototype.addBrotherSlotDIV = function(_parent, _data, _index)
{
    var self = this;

    var result = _parent.addBrotherSlotDIV(_data, _index);

    // some event listener for brother slot to drag and drop
    result.drag("start", function (ev, dd)
    {
        // build proxy
        var proxy = $('<div class="ui-control brother is-proxy"/>');
        proxy.appendTo(document.body);
        proxy.data('idx', _index);

        var imageLayer = result.find('.image-layer:first');
        if (imageLayer.length > 0)
        {
            imageLayer = imageLayer.clone();
            proxy.append(imageLayer);
        }

        $(dd.drag).addClass('is-dragged');

        return proxy;
    }, { distance: 3 });

    result.drag(function (ev, dd) { $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX }); }, { relative: false, distance: 3 });

    result.drag("end", function (ev, dd)
    {
        var drag = $(dd.drag);
        var drop = $(dd.drop);
        var proxy = $(dd.proxy);

        // not dropped into anything?
        if (drop.length === 0)
        {
            proxy.velocity("finish", true).velocity({ top: dd.originalY, left: dd.originalX },
            {
                duration: 300,
                complete: function ()
                {
                    proxy.remove();
                    drag.removeClass('is-dragged');
                }
            });
        }
        else
        {
            proxy.remove();
        }
    }, { drop: '.is-brother-slot' });

    // event listener when left-click the brother
    result.assignListBrotherClickHandler(function (_brother, _event)
    {
        if (_event.button !== 0) return;   // We are only interested in LMB clicks
        var brotherID = _brother.data('brother')[CharacterScreenIdentifier.Entity.Id];

        self.setBrotherSelectedByID(brotherID);
    });

    // event listener when right-click the brother
    result.mousedown(function (event)
    {
        if (event.which === 3)
        {
            //var data = $(this).data('brother');
            //var data = $(this);
            return self.quickMoveBrother($(this));
        }
    });
    return result;
};

RosterManager.prototype.notifyDataSourceSelection = function( _brotherID )
{
    // if (this.mDataSource !== null)
    this.mDataSource.selectedBrotherById(_brotherID);
}

RosterManager.prototype.setBrotherSelectedByID = function (_brotherID)
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        this.mBrotherContainer[i].deselectCurrent();
        if (this.mBrotherContainer[i].selectBrother(_brotherID) === false) continue;

        this.notifyDataSourceSelection(_brotherID);
    }
};

RosterManager.prototype.selectAnything = function()
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        this.mBrotherContainer[i].deselectCurrent();
    }

    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        if (this.mBrotherContainer[i].selectFirst() === false) continue;
        this.notifyDataSourceSelection(this.getSelected().BrotherID);
        return true;
    }
    return false;
}

RosterManager.prototype.switchToPreviousBrother = function()
{
    var currentSelection = this.getSelected();
    if (currentSelection === null) return;
    if (currentSelection.Owner.mBrotherCurrent <= 1) return;

    if (currentSelection.Owner.selectPrev() === true)
    {
        this.notifyDataSourceSelection(currentSelection.BrotherID);
    }
}

RosterManager.prototype.switchToNextBrother = function()
{
    var currentSelection = this.getSelected();
    if (currentSelection === null) return;
    if (currentSelection.Owner.mBrotherCurrent <= 1) return;

    if (currentSelection.Owner.selectNext() === true)
    {
        this.notifyDataSourceSelection(currentSelection.BrotherID);
    }
}

// Moving Brothers around

// Removes a brother from one brotherContainer and puts them into a different brotherContainer
// _sourceIdx is an unsigned integer
// _targetIdx is an unsigned integer
// _sourceOwner, _targetOwner are BrotherContainer and not null
RosterManager.prototype.transferBrother = function ( _sourceIdx, _sourceOwnerID, _targetIdx, _targetOwnerID )
{
    console.error("transferBrother _targetIdx: " + _targetIdx);
    var sourceOwner = this.get(_sourceOwnerID);
    var targetOwner = this.get(_targetOwnerID);

    // Source roster is at minimum
    if (sourceOwner.mBrotherCurrent <= sourceOwner.mBrotherMin) return false;

    // Targeted Roster is at maximum
    if (targetOwner.mBrotherCurrent >= targetOwner.mBrotherMax) return false;

    var brotherID = sourceOwner.mSlots[_sourceIdx].data('child').data('ID');

    var brotherData = sourceOwner.removeBrother(_sourceIdx);
    targetOwner.importBrother(_targetIdx, brotherData);

    this.notifyBackendMoveAtoB(brotherID, _sourceOwnerID, _targetIdx, _targetOwnerID);

    return true;
}

// Swap the contents of two slots no matter where they are or what their state is
RosterManager.prototype.swapSlots = function (_firstIdx, _tagA, _secondIdx, _tagB)
{
    // console.error("_firstIdx " + _firstIdx + " _secondIdx " + _secondIdx);
    // console.error("_tagA " + _tagA + " _tagB " + _tagB);
    if (_firstIdx === null || _secondIdx === null) return false;
    var sourceOwner = this.get(_tagA);
    var targetOwner = this.get(_tagB);
    if (sourceOwner.isEmpty(_firstIdx) && targetOwner.isEmpty(_secondIdx)) return false;

    if (_tagA === _tagB)
    {
        var slotA = sourceOwner.mSlots[_firstIdx];
        var slotB = targetOwner.mSlots[_secondIdx];
        if(slotB.data('child') === null)
        {
            var sourceBrotherID = slotA.data('child').data('ID');
            if (sourceOwner.swapSlots(_firstIdx, _secondIdx) === false) return false
            this.notifyBackendRelocateBrother(_tagA, sourceBrotherID, _secondIdx);
        }
        else
        {
            var sourceBrotherID = slotA.data('child').data('ID');
            var targetBrotherID = slotB.data('child').data('ID');
            if (sourceOwner.swapSlots(_firstIdx, _secondIdx) === false) return false;
            this.notifyBackendRelocateBrother(_tagA, sourceBrotherID, _secondIdx);
            this.notifyBackendRelocateBrother(_tagB, targetBrotherID, _firstIdx);
        }
        return true;
    }

    if (targetOwner.mCanImport === false) return false;
    if (sourceOwner.mCanRemove === false) return false;

    // A brother is moved from one container into another:
    if (sourceOwner.isEmpty(_firstIdx))    return this.transferBrother(_secondIdx, _tagB, _firstIdx, _tagA);
    if (targetOwner.isEmpty(_secondIdx))   return this.transferBrother(_firstIdx, _tagA, _secondIdx, _tagB);

    console.error("_firstIdx " + _firstIdx + " _secondIdx " + _secondIdx);
    var firstBrotherID = sourceOwner.mSlots[_firstIdx].data('child').data('ID');
    var secondBrotherID = targetOwner.mSlots[_secondIdx].data('child').data('ID');

    var firstData = sourceOwner.removeBrother(_firstIdx);
    var secondData = targetOwner.removeBrother(_secondIdx);

    sourceOwner.importBrother(_firstIdx, secondData);
    targetOwner.importBrother(_secondIdx, firstData);

    this.notifyBackendMoveAtoB(firstBrotherID, _tagA, _secondIdx, _tagB);
    this.notifyBackendMoveAtoB(secondBrotherID, _tagB, _firstIdx, _tagA);
}

// move brother to the other roster on right-click
RosterManager.prototype.quickMoveBrother = function (_clickedSlot)
{
    var _brother = _clickedSlot.data('brother');

    var data = this.getBrotherByID(_brother[CharacterScreenIdentifier.Entity.Id]);

    if (data.Index === null || data.Tag === null) return false;

    var sourceOwner = this.get(data.Tag);
    if (sourceOwner.mCanRemove === false) return false;

    var targetOwner = this.getNextForInsert(sourceOwner.mContainerID);

    // Source roster is at minimum
    if (sourceOwner.mBrotherCurrent <= sourceOwner.mBrotherMin) return false;

    // Targeted Roster is at maximum
    if (targetOwner.mBrotherCurrent >= targetOwner.mBrotherMax) return false;

    // transfer brother from source roster to target roster
    var firstEmptySlot = targetOwner.getIndexOfFirstEmptySlot();
    this.swapSlots(data.Index, data.Tag, firstEmptySlot, targetOwner.mContainerID);

    return true;
};

//- Call Squirrel backend function
RosterManager.prototype.notifyBackendRelocateBrother = function (_rosterID, _brotherID, _placeInFormation)
{
    SQ.call(this.mSQHandle, 'onRelocateBrother', [ _rosterID, _brotherID, _placeInFormation ]);
};

RosterManager.prototype.notifyBackendMoveAtoB = function (_id, _tagA, _pos, _tagB)
{
    SQ.call(this.mSQHandle, 'MoveAtoB', [ _id, _tagA, _pos, _tagB ]);
    this.mDataSource.setRosterLimit(this.get(_tagA).mBrotherMax);
};


RosterManager.prototype.destroyDIV = function()
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        this.mBrotherContainer[i].mListContainer.empty();
        this.mBrotherContainer[i].mListContainer = null;
    }
}


// Generic Stuff

RosterManager.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};
RosterManager.prototype.onConnection = function (_handle)
{
    this.mSQHandle = _handle;

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnConnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnConnectionCalled(this);
    }
};

RosterManager.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnDisconnectionCalled(this);
    }
};

RosterManager.prototype.registerEventListener = function(_listener)
{
    this.mEventListener = _listener;
};
