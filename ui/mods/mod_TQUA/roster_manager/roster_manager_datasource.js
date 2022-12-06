
"use strict";

var RosterManagerDatasource = function()
{
	this.mSQHandle = null;

	// Event handling
	this.mEventListener = { };

	// Caches
    this.mRosterManager = new RosterManager();
    this.mRosterManager.addContainer(new RosterContainer(Owner.Formation));
    this.mRosterManager.addContainer(new RosterContainer(Owner.Reserve)).mSlotClasses = '<div class="ui-control is-brother-slot is-reserve-slot"/>';
    var guests = this.mRosterManager.addContainer(new RosterContainer(Owner.Guests));
    guests.mCanRemove = false;
    guests.mCanImport = false;
    guests.mMoodVisible = false;

    this.mIsPopupOpen = false;

	// init the datasource
	this.init();
};

RosterManagerDatasource.prototype.getPlayerRoster = function ()
{
	return this.mRosterManager.get(Owner.Formation);
}

RosterManagerDatasource.prototype.getInventoryMode = function ()
{
	return CharacterScreenDatasourceIdentifier.InventoryMode.Stash;
}

RosterManagerDatasource.prototype.onConnection = function (_handle)
{
	this.mSQHandle = _handle;
    this.mRosterManager.onConnection(_handle);
};

RosterManagerDatasource.prototype.onDisconnection = function ()
{
	this.mSQHandle = null;
    this.mRosterManager.onDisconnection();
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
    return this.mRosterManager.get(Owner.Formation).mBrotherList;
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

    this.mRosterManager.loadFromData(_data);
    this.mRosterManager.selectAnything();
    this.loadBrothersList();
};


RosterManagerDatasource.prototype.swapBrothers = function (_a, _b)
{
    var tmp = this.getBrothersList()[_a];
    this.getBrothersList()[_a] = this.getBrothersList()[_b];
    this.getBrothersList()[_b] = tmp;
}


RosterManagerDatasource.prototype.loadBrothersList = function(_withoutNotify)
{
	// this.getBrothersList() = data;

	// notify every listener
	if (_withoutNotify === undefined || _withoutNotify !== true)
	{
		this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.ListLoaded, this.getBrothersList());
	}

	return this.getBrothersList();
};

RosterManagerDatasource.prototype.getNumBrothers = function ()
{
	var num = 0;

	for (var i = 0; i != this.getBrothersList().length; ++i)
	{
		if(this.getBrothersList()[i] !== null)
			++num;
	}

	return num;
};

RosterManagerDatasource.prototype.getSelectedBrother = function()
{
    var selection = this.mRosterManager.getSelected();
    if (selection === null) return null;

    return selection.Brother;
};

RosterManagerDatasource.prototype.getSelectedBrotherIndex = function ()
{
    var selection = this.mRosterManager.getSelected();
    if (selection === null) return null;

    return selection.Index;
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

RosterManagerDatasource.prototype.switchToPreviousBrother = function()
{
    if (this.getBrothersList() == null || this.mIsPopupOpen) return;

    this.mRosterManager.switchToPreviousBrother();
};

RosterManagerDatasource.prototype.switchToNextBrother = function()
{
    if (this.getBrothersList() == null || this.mIsPopupOpen) return;

    this.mRosterManager.switchToNextBrother();
};

RosterManagerDatasource.prototype.selectedBrotherById = function(_brotherId, _withoutNotify)
{
    // notify every listener
    if ((_withoutNotify === undefined || _withoutNotify !== true))
    {
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
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

	for (var i = 0; i < this.getBrothersList().length; ++i)
	{
	    if (this.getBrothersList()[i] != null && this.getBrothersList()[i][CharacterScreenIdentifier.Entity.Id] === _data[CharacterScreenIdentifier.Entity.Id])
		{
			this.getBrothersList()[i] = _data;
			this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Updated, this.getBrothersList()[i]);
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

RosterManagerDatasource.prototype.notifyBackendSortButtonClicked = function ()
{
   	SQ.call(this.mSQHandle, 'onSortButtonClicked');
}

RosterManagerDatasource.prototype.notifyBackendUpdateNameAndTitle = function (_brotherId, _name, _title, _callback)
{
    SQ.call(this.mSQHandle, 'onUpdateNameAndTitle', [_brotherId, _name, _title], _callback);
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

RosterManagerDatasource.prototype.notifyBackendUpdateRosterPosition = function (_id, _pos)
{
    SQ.call(this.mSQHandle, 'onUpdateRosterPosition', [ _id, _pos ]);
};
