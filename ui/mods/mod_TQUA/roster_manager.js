var RosterManager = function(_dataSource)
{
    this.mDataSource = null;
    this.mSQHandle        = null;
    this.mEventListener     = null;
    this.mBrotherContainer = [];        // Array of BrotherContainer

    this.mSharedMaximumInformation = null;
}

RosterManager.prototype.initializeFromData = function( _data )
{
    this.mBrotherContainer = [];    // Makes sure all previous data is wiped
    this.mSharedMaximumInformation =
    {
        MaximumTotalBrothers: 27,
        CurrentBrothers: {},    // Has an entry for each ID that shares maximum total brothers
        isAtCapacity: function()
        {
            if (this.getCurrentBrothers() === this.MaximumTotalBrothers);
        },
        getCurrentBrothers: function()
        {
            var currentBrothers = 0;
            for (var containerEntry in CurrentBrothers)
            {
                currentBrothers += CurrentBrothers[containerEntry];
            }
            return currentBrothers;
        }
    }

    // console.error("initializing Roster Manager");
    var entries = Object.keys(_data);
    for(var i = 0; i < entries.length; i++)
    {
        if (this.get(entries[i]) !== null)
        {
            console.error("Warning: trying to initialize the roster " + entries[i] + " but it already exists!");;
            continue;
        }
        var newRosterContainer = this.addContainer(new RosterContainer(entries[i]));
        newRosterContainer.loadFromData(_data[entries[i]], this.mSharedMaximumInformation);
    }
    this.mBrotherContainer.sort(function compareFn(a, b) { return a.mContainerID.localeCompare(b.mContainerID)} );
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

// Requires all RosterContainer to have a valid mListContainer variable that they can append their generated DIV to
RosterManager.prototype.generateDIVs = function()
{
    for(var i = 0; i < this.mBrotherContainer.length; i++)
    {
        this.createBrotherSlots(this.mBrotherContainer[i].mContainerID);
        this.onBrothersListLoaded(this.mBrotherContainer[i].mContainerID);
        this.mBrotherContainer[i].update();
    }
}

{   // Basic Getter and Setter
    RosterManager.prototype.addContainer = function( _container )
    {
        // console.error("Registered RosterContainer: " + _container.mContainerID);
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

    // When we don't know in which roster he is
    // Returns an object with the keys 'Index', 'Tag' and 'Brother'
    RosterManager.prototype.getBrotherByID = function (_actorID)
    {
        for(var i = 0; i < this.mBrotherContainer.length; i++)
        {
            var playerBrother = this.mBrotherContainer[i].getBrotherByID(_actorID);
            if (playerBrother.IsNull === false) return playerBrother;
        }
        return null;
    };

    // Returns the slot that is currently selected. This should usually have an actor inside
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
        // console.error("getSelected returned null");
        return null;
    }

    RosterManager.prototype.setDeadZoneElement = function ( _deadZoneElement )
    {
        for(var i = 0; i < this.mBrotherContainer.length; i++)
        {
            if (this.mBrotherContainer[i].mContainerID === "Formation") continue;
            this.mBrotherContainer[i].mDeadZoneElement = _deadZoneElement;
        }
    }
}

{   // Fancy Getter
    // Returns the next container in line that comes after this one, ignoring any conditions for insertion
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
    // Only returns a container that is able to be inserted into (not full, mCanInsert etc)
    // Returns null is this ID doesn't exists or no applicable container was found
    RosterManager.prototype.getNextForInsert = function( _containerID, _isPlayerCharacter, _sharedMaximumBrothers )
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
            if (this.mBrotherContainer[i].canImportActor(_isPlayerCharacter, _sharedMaximumBrothers) === false) continue;   // skip all container that cant be imported
            if (this.mBrotherContainer[i].mIsCollapsed === true && this.mBrotherContainer.length !== 2) continue;      // Collapsing will prevent a container from being targeted for auto insert. Unless we only have 2 container
            if (sourceFound === false)
            {
                if (beforeIndex === null) beforeIndex = i;
                continue;
            }

            var afterIndex = i;
            break;
        }
        if (afterIndex === null) return this.mBrotherContainer[beforeIndex];
        return this.mBrotherContainer[afterIndex];
    }

    RosterManager.prototype.setBrotherSelectedByID = function (_actorID)
    {
        var target = this.getBrotherByID(_actorID);

        if (this.get(target.Tag).selectSlot(target.Index) === false) return false;

        for(var i = 0; i < this.mBrotherContainer.length; i++)
        {
            if (this.mBrotherContainer[i].mContainerID == target.Tag) continue;
            this.mBrotherContainer[i].deselectCurrent();
        }
        this.notifyDataSourceSelection(_actorID);
        return true;
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

}

{   // DIV stuff
    // add actor to empty slot
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
            var actor = parent.mBrotherList[i];

            if (actor !== null)
            {
                this.addBrotherSlotDIV(parent, actor, i);
            }
        }
    };

    RosterManager.prototype.createBrotherSlots = function ( _ownerID )
    {
        var self = this;

        var parent = this.get(_ownerID);
        if (parent.mListContainer === null)
        {
            console.error("mListContainer for " + _ownerID + " was never initialised. Can't create Slots for it");
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

            // console.error("dropHandler fired for " + drop.data('tag'));

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
                // deny when the dragged actor is a player character
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

    RosterManager.prototype.addBrotherSlotDIV = function(_parent, _data, _index)
    {
        var self = this;

        var result = _parent.addBrotherSlotDIV(_data, _index);

        // some event listener for actor slot to drag and drop
        result.drag("start", function (ev, dd)
        {
            // console.error("drag start fired for " + _index);

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

        // event listener when left-click the actor
        // _actor.data('brother') consists of the following keys: id,imageOffsetX,imageOffsetY,imageScale
        result.assignListBrotherClickHandler(function (_actor, _event)
        {
            if (_event.button !== 0) return;   // We are only interested in LMB clicks
            var actorID = _actor.data('brother')[CharacterScreenIdentifier.Entity.Id];

            self.setBrotherSelectedByID(actorID);
        });

        // event listener when right-click the actor
        result.mousedown(function (event)
        {
            if (event.which === 3)
            {
                return self.onQuickMoveActor($(this));
            }
        });
        return result;
    };

}

{   // Selections
    RosterManager.prototype.switchToPreviousBrother = function( _indexOffset )
    {
        var currentSelection = this.getSelected();
        if (currentSelection === null) return;
        if (currentSelection.Owner.mBrotherCurrent <= 1) return;

        if (currentSelection.Owner.selectPrev( _indexOffset ) === true)
        {
            this.notifyDataSourceSelection(currentSelection.BrotherID);
        }
    }

    RosterManager.prototype.switchToNextBrother = function( _indexOffset )
    {
        var currentSelection = this.getSelected();
        if (currentSelection === null) return;
        if (currentSelection.Owner.mBrotherCurrent <= 1) return;

        if (currentSelection.Owner.selectNext( _indexOffset ) === true)
        {
            this.notifyDataSourceSelection(currentSelection.BrotherID);
        }
    }

}

{   // Communication with outside (Datasource/Squirrel)
    RosterManager.prototype.notifyDataSourceSelection = function( _actorID )
    {
        // if (this.mDataSource !== null)
        this.mDataSource.selectedBrotherById(_actorID);
    }

    //- Call Squirrel backend function
    RosterManager.prototype.notifyBackendRelocateBrother = function (_rosterID, _actorID, _placeInFormation)
    {
        SQ.call(this.mSQHandle, 'onRelocateBrother', [ _rosterID, _actorID, _placeInFormation ]);
    };

    RosterManager.prototype.notifyBackendMoveAtoB = function (_id, _tagA, _pos, _tagB)
    {
        SQ.call(this.mSQHandle, 'onTransferBrother', [ _id, _tagA, _pos, _tagB ]);
        this.mDataSource.setRosterLimit(this.get(_tagA).mBrotherMax);
    };

}

{   // Moving Brothers around
    // Removes an actor from one RosterContainer and puts them into a different RosterContainer
    // _sourceIdx is an unsigned integer
    // _targetIdx is an unsigned integer
    // _sourceOwner, _targetOwner are BrotherContainer and not null
    RosterManager.prototype.transferBrother = function ( _sourceIdx, _sourceOwner, _targetIdx, _targetOwner )
    {
        if (_sourceOwner.canRemoveActor() === false) return false;
        if (_targetOwner.canImportActor(_sourceOwner.isPlayerCharacter(_sourceIdx), _sourceOwner.mSharedMaximumInformation) === false) return false;

        // console.error("transferBrother _targetIdx: " + _targetIdx);

        // Source roster is at minimum
        if (_sourceOwner.mBrotherCurrent <= _sourceOwner.mBrotherMin) return false;

        var actorID = _sourceOwner.mSlots[_sourceIdx].data('child').data('ID');

        var actorData = _sourceOwner.removeBrother(_sourceIdx);
        _targetOwner.importBrother(_targetIdx, actorData);

        this.notifyBackendMoveAtoB(actorID, _sourceOwner.mContainerID, _targetIdx, _targetOwner.mContainerID);

        return true;
    }

    // Called from dropHandler
    // Swap the contents of two slots no matter where they are or what their state is
    RosterManager.prototype.swapSlots = function (_firstIdx, _tagA, _secondIdx, _tagB)
    {
        // console.error("_firstIdx " + _firstIdx + " _secondIdx " + _secondIdx);
        // console.error("_tagA " + _tagA + " _tagB " + _tagB);
        if (_firstIdx === null || _secondIdx === null) return false;
        var sourceOwner = this.get(_tagA);
        var targetOwner = this.get(_tagB);
        if (sourceOwner.isEmpty(_firstIdx) && targetOwner.isEmpty(_secondIdx)) return false;

        var slotA = sourceOwner.mSlots[_firstIdx];
        var slotB = targetOwner.mSlots[_secondIdx];
        if (_tagA === _tagB)
        {
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

        // A actor is moved from one container into another:
        if (sourceOwner.isEmpty(_firstIdx))    return this.transferBrother(_secondIdx, targetOwner, _firstIdx, sourceOwner);
        if (targetOwner.isEmpty(_secondIdx))   return this.transferBrother(_firstIdx, sourceOwner, _secondIdx, targetOwner);

        // Two actor are switched with each other
        if (targetOwner.canSwitchInActor(sourceOwner.isPlayerCharacter(_firstIdx), sourceOwner.mSharedMaximumInformation) === false) return false;
        if (targetOwner.canSwitchOutActor() === false) return false;

        if (sourceOwner.canSwitchInActor(targetOwner.isPlayerCharacter(_secondIdx), targetOwner.mSharedMaximumInformation) === false) return false;
        if (sourceOwner.canSwitchOutActor() === false) return false;

        // console.error("_firstIdx " + _firstIdx + " _secondIdx " + _secondIdx);
        var firstBrotherID = sourceOwner.mSlots[_firstIdx].data('child').data('ID');
        var secondBrotherID = targetOwner.mSlots[_secondIdx].data('child').data('ID');

        var firstData = sourceOwner.removeBrother(_firstIdx);
        var secondData = targetOwner.removeBrother(_secondIdx);

        sourceOwner.importBrother(_firstIdx, secondData);
        targetOwner.importBrother(_secondIdx, firstData);

        this.notifyBackendMoveAtoB(firstBrotherID, _tagA, _secondIdx, _tagB);
        this.notifyBackendMoveAtoB(secondBrotherID, _tagB, _firstIdx, _tagA);
    }

    // Is executed on right-clicking any actor
    RosterManager.prototype.onQuickMoveActor = function (_clickedSlot)
    {
        var _entityData = _clickedSlot.data('brother');

        var data = this.getBrotherByID(_entityData[CharacterScreenIdentifier.Entity.Id]);

        if (data.Index === null || data.Tag === null) return false;

        var sourceOwner = this.get(data.Tag);
        var targetOwner = this.getNextForInsert(data.Tag, sourceOwner.isPlayerCharacter(data.Index), sourceOwner.mSharedMaximumInformation);
        if (targetOwner === null) return false;     // No valid target for quickswitching was found

        // transfer brother from source roster to target roster
        var firstEmptySlot = targetOwner.getIndexOfFirstEmptySlot();
        this.swapSlots(data.Index, data.Tag, firstEmptySlot, targetOwner.mContainerID);

        return true;
    };

    RosterManager.prototype.moveSelectedRight = function( _indexOffset )
    {
        var currentSelection = this.getSelected();
        if (currentSelection === null) return;
        if (currentSelection.Owner.mBrotherCurrent === currentSelection.Owner.mSlotLimit) return;   // no empty space to move them into

        if (currentSelection.Owner.moveSelectedRight( _indexOffset ) === true)
        {
            this.notifyDataSourceSelection(currentSelection.BrotherID);
        }
    }

    RosterManager.prototype.moveSelectedLeft = function( _indexOffset )
    {
        var currentSelection = this.getSelected();
        if (currentSelection === null) return;
        if (currentSelection.Owner.mBrotherCurrent === currentSelection.Owner.mSlotLimit) return;   // no empty space to move them into

        if (currentSelection.Owner.moveSelectedLeft( _indexOffset ) === true)
        {
            this.notifyDataSourceSelection(currentSelection.BrotherID);
        }
    }

}


{   // Generic Functions
    RosterManager.prototype.destroyDIV = function()
    {
        for(var i = 0; i < this.mBrotherContainer.length; i++)
        {
            this.mBrotherContainer[i].mListContainer.empty();
            this.mBrotherContainer[i].mListContainer = null;
        }
    }

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

}
