
"use strict";

var RosterManagerDatasource = function()
{
	this.mSQHandle = null;

	// Event handling
	this.mEventListener = { };

	// Caches
    this.mRosterManager = new RosterManager();
    this.mIsPopupOpen = false;

    // Dummy-Variable so that hooks in modules which are used in both CharacterScreen and this Screen
    // That way they can have different behavior
    this.mIsRosterManager = true;

	this.init();
};

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

// Afaik this is only used for the purpose of displaying the Dismiss-Button. But since I'm not overwriting that vanilla check this function is still needed
RosterManagerDatasource.prototype.getBrothersList = function ()
{
    return this.mRosterManager.get(modTQUA.Owner.Formation).mBrotherList;
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

    this.mRosterManager.initializeFromData(_data.RostersData);
    this.loadBrothersList();
};

RosterManagerDatasource.prototype.loadBrothersList = function(_withoutNotify)
{
	// notify every listener
	if (_withoutNotify === undefined || _withoutNotify !== true)
	{
		this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.ListLoaded, this.getBrothersList());
	}

	return this.getBrothersList();
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

RosterManagerDatasource.prototype.selectedBrotherById = function(_brotherId, _withoutNotify)
{
    // notify every listener
    if ((_withoutNotify === undefined || _withoutNotify !== true))
    {
        this.notifyEventListener(CharacterScreenDatasourceIdentifier.Brother.Selected, this.getSelectedBrother());
    }
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

RosterManagerDatasource.prototype.getNumBrothers = function()
{
    return this.getBrothersList().length;
};

// These functions remain unchanged compared to their original in CharacterScreenDatasource
RosterManagerDatasource.prototype.getBrotherPerkPoints = CharacterScreenDatasource.prototype.getBrotherPerkPoints;
RosterManagerDatasource.prototype.getBrotherPerkPointsSpent = CharacterScreenDatasource.prototype.getBrotherPerkPointsSpent;
RosterManagerDatasource.prototype.isSelectedBrother = CharacterScreenDatasource.prototype.isSelectedBrother;
RosterManagerDatasource.prototype.setRosterLimit = CharacterScreenDatasource.prototype.setRosterLimit;
RosterManagerDatasource.prototype.hasItemEquipped = CharacterScreenDatasource.prototype.hasItemEquipped;

RosterManagerDatasource.prototype.notifyBackendCloseButtonClicked = function ()
{
	SQ.call(this.mSQHandle, 'onCloseButtonClicked');
};

RosterManagerDatasource.prototype.notifyBackendUpdateRosterPosition = function (_id, _pos)
{
    SQ.call(this.mSQHandle, 'onUpdateRosterPosition', [ _id, _pos ]);
};
