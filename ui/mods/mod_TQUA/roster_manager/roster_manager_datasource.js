
"use strict";


var CharacterScreenDatasourceIdentifier =
{
	Brother:
    {
        ListLoaded: 'brothers.list-loaded',
        SettingsChanged: 'brothers.settings-changed',
		Updated: 'brother.updated',
		Selected: 'brother.selected'
	},

    Inventory:
    {
		ModeUpdated: 'inventory.mode-updated',
		StashLoaded: 'inventory.stash-loaded',
        StashItemUpdated:
        {
			Key: 'inventory.stash-item-updated',
            Flag:
            {
				Inserted: 'inserted',
				Removed: 'removed',
				Updated: 'updated'
			}
		}
	},

    InventoryMode:
    {
        BattlePreparation: 'battle-preparation',
		Stash: 'stash',
		Ground: 'ground'
	},

    Perks:
    {
        TreesLoaded: 'perks.list-loaded'
    }
};


var RosterManagerDatasource = function()
{
	this.mSQHandle = null;

	// Event handling
	this.mEventListener = { };

	// Caches
	this.mBrothersList = null;
	this.mSelectedBrotherIndex = null;

	// fucking bullshit
    this.mIsPopupOpen = false;

	// init the datasource
	this.init();
};



RosterManagerDatasource.prototype.getInventoryMode = function ()
{
	return CharacterScreenDatasourceIdentifier.InventoryMode.Stash;
}

RosterManagerDatasource.prototype.onConnection = function (_handle)
{
	this.mSQHandle = _handle;
};

RosterManagerDatasource.prototype.onDisconnection = function ()
{
	this.mSQHandle = null;
	this.reset();
};


RosterManagerDatasource.prototype.addListener = function(_channel, _callback)
{
	if (_channel in this.mEventListener)
	{
		if (jQuery.inArray(_callback, this.mEventListener[_channel]) === -1)
		{
			this.mEventListener[_channel].push(_callback);
		}
	}
};

RosterManagerDatasource.prototype.removeListener = function(_channel, _callback)
{
	if (_channel in this.mEventListener)
	{
		var idx = jQuery.inArray(_callback, this.mEventListener[_channel]);
		if (idx !== -1)
		{
			this.mEventListener[_channel].remove(idx);
		}
	}
};

RosterManagerDatasource.prototype.removeListeners = function()
{
	this.createEventChannels();
};

RosterManagerDatasource.prototype.notifyEventListener = function(_channel, _payload)
{
	if (_channel in this.mEventListener)
	{
		var listeners = this.mEventListener[_channel];
		for (var i = 0; i < listeners.length; ++i)
		{
			listeners[i](this, _payload);
		}
	}
};

RosterManagerDatasource.prototype.createEventChannels = function()
{
    this.mEventListener[ErrorCode.Key] = [ ];

    this.mEventListener[CharacterScreenDatasourceIdentifier.Brother.ListLoaded] = [];
    this.mEventListener[CharacterScreenDatasourceIdentifier.Brother.SettingsChanged] = [];
	this.mEventListener[CharacterScreenDatasourceIdentifier.Brother.Updated] = [ ];
	this.mEventListener[CharacterScreenDatasourceIdentifier.Brother.Selected] = [ ];

    this.mEventListener[CharacterScreenDatasourceIdentifier.Perks.TreesLoaded] = [ ];
};


RosterManagerDatasource.prototype.init = function()
{
	this.createEventChannels();
};

RosterManagerDatasource.prototype.reset = function()
{
	// Caches
	this.mBrothersList = null;
	this.mSelectedBrotherIndex = null;
};

RosterManagerDatasource.prototype.isInStashMode = function()
{
	return true;
};

RosterManagerDatasource.prototype.isInGroundMode = function()
{
	return false;
};

RosterManagerDatasource.prototype.isTacticalMode = function ()
{
    return false;
};

RosterManagerDatasource.prototype.getBrothersList = function ()
{
    return this.mBrothersList;
};

RosterManagerDatasource.prototype.getTooltipItemOwner = function()
{
	return TooltipIdentifier.ItemOwner.Stash;
};


RosterManagerDatasource.prototype.loadFromData = function(_data)
{
    if (_data === undefined || _data == null || typeof(_data) !== 'object')
    {
        console.error('ERROR: Failed to query character screen result data. Reason: Invalid result.');
        return;
    }

    if (CharacterScreenIdentifier.QueryResult.Brothers in _data)
    {
        this.loadBrothersList(_data[CharacterScreenIdentifier.QueryResult.Brothers]);
    }
};


RosterManagerDatasource.prototype.swapBrothers = function (_a, _b)
{
    var tmp = this.mBrothersList[_a];
    this.mBrothersList[_a] = this.mBrothersList[_b];
    this.mBrothersList[_b] = tmp;
}


RosterManagerDatasource.prototype.loadBrothersList = function(_data, _withoutNotify)
{
    var data = _data;

	this.mSelectedBrotherIndex = null;
	this.mBrothersList = data;

	// find selected one
	if (this.mBrothersList !== null && jQuery.isArray(this.mBrothersList))
	{
		for (var i = 0; i < this.mBrothersList.length; ++i)
		{
		    if (this.mBrothersList[i] !== null && CharacterScreenIdentifier.Entity.Flags in this.mBrothersList[i] && CharacterScreenIdentifier.EntityFlags.IsSelected in this.mBrothersList[i][CharacterScreenIdentifier.Entity.Flags])
			{
				if (this.mBrothersList[i][CharacterScreenIdentifier.Entity.Flags][CharacterScreenIdentifier.EntityFlags.IsSelected] === true)
				{
					this.mSelectedBrotherIndex = i;
					break;
				}
			}
		}

		// no selected found - use the first usable as default
		if (this.mSelectedBrotherIndex === null && this.mBrothersList.length > 0)
		{
		    for (var i = 0; i < this.mBrothersList.length; ++i)
		    {
		        if(this.mBrothersList[i] != null)
		        {
		            this.mSelectedBrotherIndex = i;
		            break;
		        }
		    }
		}
	}

	// notify every listener
	if (_withoutNotify === undefined || _withoutNotify !== true)
	{
		this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.ListLoaded, this.mBrothersList);
		this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
	}

	return this.mBrothersList;
};


RosterManagerDatasource.prototype.getBrothersList = function()
{
	if (this.mBrothersList === null)
	{
		this.mBrothersList = this.loadBrothersList(null, true);
	}

	return this.mBrothersList;
};

RosterManagerDatasource.prototype.getNumBrothers = function ()
{
	var num = 0;

	for (var i = 0; i != this.mBrothersList.length; ++i)
	{
		if(this.mBrothersList[i] !== null)
			++num;
	}

	return num;
};

RosterManagerDatasource.prototype.getSelectedBrother = function()
{
	if (this.mSelectedBrotherIndex !== null && this.mBrothersList !== null && this.mSelectedBrotherIndex < this.mBrothersList.length)
	{
		return this.mBrothersList[this.mSelectedBrotherIndex];
	}
	return null;
};

RosterManagerDatasource.prototype.getSelectedBrotherIndex = function ()
{
    return this.mSelectedBrotherIndex;
};

RosterManagerDatasource.prototype.setSelectedBrotherIndex = function (_rosterPosition, _withoutNotify)
{
    this.mSelectedBrotherIndex = _rosterPosition;

    // notify every listener
    if (_withoutNotify === undefined || _withoutNotify !== true)
    {
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.ListLoaded, this.mBrothersList);
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
    }
};


RosterManagerDatasource.prototype.getBrotherPerkPoints = function(_brother)
{
    if (_brother === null || !(CharacterScreenIdentifier.Entity.Character.Key in _brother))
    {
        return 0;
    }

    var character = _brother[CharacterScreenIdentifier.Entity.Character.Key];
    if (character === null)
    {
        return 0;
    }

    if (CharacterScreenIdentifier.Entity.Character.PerkPoints in character)
    {
        var perkPoints = character[CharacterScreenIdentifier.Entity.Character.PerkPoints];
        if (perkPoints !== null && typeof(perkPoints) == 'number')
        {
            return perkPoints;
        }
    }

    return 0;
};


RosterManagerDatasource.prototype.getBrotherPerkPointsSpent = function (_brother)
{
	if (_brother === null || !(CharacterScreenIdentifier.Entity.Character.Key in _brother))
	{
		return 0;
	}

	var character = _brother[CharacterScreenIdentifier.Entity.Character.Key];
	if (character === null)
	{
		return 0;
	}

	if (CharacterScreenIdentifier.Entity.Character.PerkPoints in character)
	{
		var perkPoints = character[CharacterScreenIdentifier.Entity.Character.PerkPointsSpent];
		if (perkPoints !== null && typeof (perkPoints) == 'number')
		{
			return perkPoints;
		}
	}

	return 0;
};


RosterManagerDatasource.prototype.isSelectedBrother = function(_brother)
{
	var selectedBrother = this.getSelectedBrother();
	return selectedBrother !== null && CharacterScreenIdentifier.Entity.Id in selectedBrother &&
			_brother !== null && CharacterScreenIdentifier.Entity.Id in _brother &&
			selectedBrother[CharacterScreenIdentifier.Entity.Id] === _brother[CharacterScreenIdentifier.Entity.Id];
};

RosterManagerDatasource.prototype.switchToPreviousBrother = function(_withoutNotify)
{
    if (this.mBrothersList == null || this.mIsPopupOpen)
        return;

    var currentIndex = this.mSelectedBrotherIndex;

    for (var i = this.mSelectedBrotherIndex - 1; i >= 0; --i)
    {
        if (this.mBrothersList[i] !== null)
        {
            this.mSelectedBrotherIndex = i;
            break;
        }
    }

    if (this.mSelectedBrotherIndex == currentIndex)
    {
        for (var i = this.mBrothersList.length - 1; i > currentIndex; --i)
        {
            if (this.mBrothersList[i] !== null)
            {
                this.mSelectedBrotherIndex = i;
                break;
            }
        }
    }

    // notify every listener
    if (_withoutNotify === undefined || _withoutNotify !== true)
    {
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
    }
};

RosterManagerDatasource.prototype.switchToNextBrother = function(_withoutNotify)
{
    if (this.mBrothersList == null || this.mIsPopupOpen)
        return;

    var currentIndex = this.mSelectedBrotherIndex;

    for (var i = this.mSelectedBrotherIndex + 1; i < this.mBrothersList.length; ++i)
    {
        if (this.mBrothersList[i] !== null)
        {
            this.mSelectedBrotherIndex = i;
            break;
        }
    }

    if(this.mSelectedBrotherIndex == currentIndex)
    {
        for (var i = 0; i < this.mSelectedBrotherIndex; ++i)
        {
            if (this.mBrothersList[i] !== null)
            {
                this.mSelectedBrotherIndex = i;
                break;
            }
        }
    }

    // notify every listener
	if (_withoutNotify === undefined || _withoutNotify !== true)
	{
		this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
	}
};

RosterManagerDatasource.prototype.selectedBrotherById = function(_brotherId, _withoutNotify)
{
	if (this.mSelectedBrotherIndex !== null && this.mBrothersList !== null)
	{
        var hasChanged = false;
		for (var i = 0; i < this.mBrothersList.length; ++i)
		{
		    if (this.mBrothersList[i] != null && CharacterScreenIdentifier.Entity.Id in this.mBrothersList[i])
			{
				if (this.mBrothersList[i][CharacterScreenIdentifier.Entity.Id] === _brotherId && this.mSelectedBrotherIndex !== i)
				{

                    hasChanged = true;
                    this.mSelectedBrotherIndex = i;
					break;
				}
			}
		}

		// notify every listener
		if ((_withoutNotify === undefined || _withoutNotify !== true) && hasChanged === true)
		{
			this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
		}
	}
};

RosterManagerDatasource.prototype.setRosterLimit = function(_data, _withoutNotify)
{
    // notify every listener
	if (_withoutNotify === undefined || _withoutNotify !== true)
	{
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.SettingsChanged, _data);
	}
};

RosterManagerDatasource.prototype.getGroundStatistics = function ()
{
    var selectedBrother = this.getSelectedBrother();
    if (selectedBrother === null || !(CharacterScreenIdentifier.Entity.Id in selectedBrother))
    {
        console.error('ERROR: Failed to get ground statistics. No entity selected.');
        return 0;
    }

    if (CharacterScreenIdentifier.Entity.Ground in selectedBrother && selectedBrother[CharacterScreenIdentifier.Entity.Ground] !== null)
    {
        var ground = selectedBrother[CharacterScreenIdentifier.Entity.Ground];
        var groundItems = 0;
        for (var i = 0; i < ground.length; ++i)
        {
        	if (ground[i] !== null)
        	{
                ++groundItems;
            }
        }
        return { size: groundItems };
    }

    return 0;
};

RosterManagerDatasource.prototype.hasItemEquipped = function (_slotType)
{
    var selectedBrother = this.getSelectedBrother();
    if (selectedBrother === null || !(CharacterScreenIdentifier.Entity.Id in selectedBrother))
    {
        console.error('ERROR: Failed to item equipment state. No entity selected.');
        return false;
    }

    if (CharacterScreenIdentifier.Paperdoll.Equipment in selectedBrother &&
        selectedBrother[CharacterScreenIdentifier.Paperdoll.Equipment] !== null)
    {
        var equipment = selectedBrother[CharacterScreenIdentifier.Paperdoll.Equipment];
        if (_slotType !== undefined && _slotType !== null && _slotType in equipment && equipment[_slotType] !== null)
        {
            return (CharacterScreenIdentifier.Item.Id in equipment[_slotType] && equipment[_slotType][CharacterScreenIdentifier.Item.Id] !== null);
        }
    }

    return false;
};

RosterManagerDatasource.prototype.updateBrother = function (_data)
{
	if (_data === null || typeof(_data) !== 'object')
	{
		console.error('ERROR: Failed to updated brother. Invalid data.');
		return;
	}

	for (var i = 0; i < this.mBrothersList.length; ++i)
	{
	    if (this.mBrothersList[i] != null && this.mBrothersList[i][CharacterScreenIdentifier.Entity.Id] === _data[CharacterScreenIdentifier.Entity.Id])
		{
			this.mBrothersList[i] = _data;
			this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Updated, this.mBrothersList[i]);
			return;
		}
	}
};

RosterManagerDatasource.prototype.updateNameAndTitle = function(_brotherId, _name, _title)
{
    var brotherId = _brotherId;
    if (brotherId === null)
    {
        var selectedBrother = this.getSelectedBrother();
        if (selectedBrother === null || !(CharacterScreenIdentifier.Entity.Id in selectedBrother))
        {
            console.error('ERROR: Failed to update name & title. No entity selected.');
            return;
        }

        brotherId = selectedBrother[CharacterScreenIdentifier.Entity.Id];
    }

    var self = this;
    this.notifyBackendUpdateNameAndTitle(brotherId, _name, _title, function (data)
    {
        if (data === undefined || data === null || typeof (data) !== 'object')
        {
            console.error('ERROR: Failed to update name & title. Invalid data result.');
            return;
        }

        // check if we have an error
        if (ErrorCode.Key in data)
        {
            self.notifyEventListener(ErrorCode.Key, data[ErrorCode.Key]);
        }
        else
        {
            // find the brother and update him
            if (CharacterScreenIdentifier.Entity.Id in data)
            {
                self.updateBrother(data);
            }
            else
            {
                console.error('ERROR: Failed to update name & title. Invalid data result.');
            }
        }
    });
};

RosterManagerDatasource.prototype.commitLevelUpStats = function(_brotherId, _statsIncreaseValues)
{
    var brotherId = _brotherId;
    if (brotherId === null)
    {
        var selectedBrother = this.getSelectedBrother();
        if (selectedBrother === null || !(CharacterScreenIdentifier.Entity.Id in selectedBrother))
        {
            console.error('ERROR: Failed to commit level up stat increase values. No entity selected.');
            return;
        }

        brotherId = selectedBrother[CharacterScreenIdentifier.Entity.Id];
    }

    //console.info(_statsIncreaseValues);

    var self = this;
    this.notifyBackendCommitStatIncreaseValues(brotherId, _statsIncreaseValues, function (data)
    {
        if (data === undefined || data === null || typeof (data) !== 'object')
        {
            console.error('ERROR: Failed to commit level up stat increase values. Invalid data result.');
            return;
        }

        // check if we have an error
        if (ErrorCode.Key in data)
        {
            self.notifyEventListener(ErrorCode.Key, data[ErrorCode.Key]);
        }
        else
        {
            // find the brother and update him
            if (CharacterScreenIdentifier.Entity.Id in data)
            {
                self.updateBrother(data);
            }
            else
            {
                console.error('ERROR: Failed to commit level up stat increase values. Invalid data result.');
            }
        }
    });
};

RosterManagerDatasource.prototype.notifyBackendSortButtonClicked = function ()
{
   	SQ.call(this.mSQHandle, 'onSortButtonClicked');
}

RosterManagerDatasource.prototype.notifyBackendUpdateNameAndTitle = function (_brotherId, _name, _title, _callback)
{
    SQ.call(this.mSQHandle, 'onUpdateNameAndTitle', [_brotherId, _name, _title], _callback);
};

RosterManagerDatasource.prototype.notifyBackendCommitStatIncreaseValues = function (_brotherId, _statsIncreaseValues, _callback)
{
    // NOTE: (js) Convert Object to array..as we cannot deliver objects with a function call to the backend... thanks Awesomium...
    var increaseValues = [];
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.HitpointsIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.BraveryIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.FatigueIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.InitiativeIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.MeleeSkillIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.RangeSkillIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.MeleeDefenseIncrease]);
    increaseValues.push(_statsIncreaseValues[CharacterScreenIdentifier.Entity.Character.LevelUp.RangeDefenseIncrease]);

    SQ.call(this.mSQHandle, 'onCommitStatsIncreaseValues', [_brotherId, increaseValues], _callback);
};

RosterManagerDatasource.prototype.notifyBackendDropPaperdollItem = function (_brotherId, _sourceItemId, _targetItemIdx, _callback)
{
	SQ.call(this.mSQHandle, 'onDropPaperdollItem', [_brotherId, _sourceItemId, _targetItemIdx], _callback);
};

RosterManagerDatasource.prototype.notifyBackendStartBattleButtonClicked = function ()
{
	SQ.call(this.mSQHandle, 'onStartBattleButtonClicked');
};

RosterManagerDatasource.prototype.notifyBackendCloseButtonClicked = function ()
{
	SQ.call(this.mSQHandle, 'onCloseButtonClicked');
};

RosterManagerDatasource.prototype.notifyBackendPopupDialogIsVisible = function (_visible)
{
    this.mIsPopupOpen = _visible;
    SQ.call(this.mSQHandle, 'onPopupDialogIsVisible', [_visible]);
};

RosterManagerDatasource.prototype.notifyBackendDiceThrow = function ()
{
	SQ.call(this.mSQHandle, 'onDiceThrow');
};

RosterManagerDatasource.prototype.notifyBackendUpdateRosterPosition = function (_id, _pos)
{
    SQ.call(this.mSQHandle, 'onUpdateRosterPosition', [ _id, _pos ]);
};
