
"use strict";

var RosterManagerBrothersListModule = function(_parent, _dataSource)
{
    this.mParent = _parent;
    this.mDataSource = _dataSource;

    // container
    this.mContainer                     = null;
    this.mListContainer                 = null;
    this.mDataSource.getPlayerRoster().mListScrollContainer           = null;

    this.mRosterCountLabel              = null;
    this.mRosterCountContainer          = null;

    this.mStartBattleButton             = null;
    this.mStartBattleButtonContainer    = null;

    this.mSlots                         = null;

    this.IsMoodVisible					= true;

    this.registerDatasourceListener();
};

RosterManagerBrothersListModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers
    this.mContainer = $('<div class="brothers-list-module"/>');
    _parentDiv.append(this.mContainer);

    var listContainerLayout = $('<div class="l-list-container"/>');
    this.mContainer.append(listContainerLayout);
    this.mDataSource.getPlayerRoster().mListScrollContainer = listContainerLayout;

    this.mRosterCountContainer = $('<div class="roster-count-container"/>');
    this.mContainer.append(this.mRosterCountContainer);
    var rosterSizeImage = $('<img/>');
    rosterSizeImage.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS); // ICON_DAMAGE_DEALT
    this.mRosterCountContainer.append(rosterSizeImage);
    this.mRosterCountLabel = $('<div class="label text-font-small font-bold font-color-value"/>');
    this.mRosterCountContainer.append(this.mRosterCountLabel);
    this.mRosterCountContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Stash.ActiveRoster });
};

RosterManagerBrothersListModule.prototype.destroyDIV = function ()
{
    this.mDataSource.getPlayerRoster().mListScrollContainer.empty();
    this.mDataSource.getPlayerRoster().mListScrollContainer = null;

    // this.mSlots = null;      // dont forget this!

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


RosterManagerBrothersListModule.prototype.toggleMoodVisibility = function ()
{
	this.IsMoodVisible = !this.IsMoodVisible;

	for(var i = 0; i < this.mDataSource.getPlayerRoster().mSlots.length; ++i)
	{
		if(this.mDataSource.getPlayerRoster().mSlots[i].data('child') != null)
			this.mDataSource.getPlayerRoster().mSlots[i].data('child').showListBrotherMoodImage(this.IsMoodVisible);
	}

	return this.IsMoodVisible;
};

RosterManagerBrothersListModule.prototype.addBrotherSlotDIV = function (_data, _index)
{

    // create: slot & background layer
    var parent = this.mDataSource.getPlayerRoster();
    var result = this.mDataSource.mRosterManager.addBrotherSlotDIV(parent, _data, _index);

};


RosterManagerBrothersListModule.prototype.updateRosterLabel = function ()
{
    this.mRosterCountLabel.html('' + this.mDataSource.getPlayerRoster().mBrotherCurrent + '/' + this.mDataSource.getPlayerRoster().mBrotherMax);
};


RosterManagerBrothersListModule.prototype.bindTooltips = function ()
{

};

RosterManagerBrothersListModule.prototype.unbindTooltips = function ()
{

};


RosterManagerBrothersListModule.prototype.registerDatasourceListener = function()
{
    //this.mDataSource.addListener(ErrorCode.Key, jQuery.proxy(this.onDataSourceError, this));

    this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.ListLoaded, jQuery.proxy(this.onBrothersListLoaded, this));
    this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.SettingsChanged, jQuery.proxy(this.onBrothersSettingsChanged, this));
	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Updated, jQuery.proxy(this.onBrotherUpdated, this));
	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Selected, jQuery.proxy(this.onBrotherSelected, this));

	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Inventory.ModeUpdated, jQuery.proxy(this.onInventoryModeUpdated, this));
};


RosterManagerBrothersListModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};

RosterManagerBrothersListModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};


RosterManagerBrothersListModule.prototype.register = function (_parentDiv)
{
    console.log('RosterManagerBrothersListModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Brothers Module. Reason: Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};

RosterManagerBrothersListModule.prototype.unregister = function ()
{
    console.log('CharacterScreenBrothersListModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Brothers Module. Reason: Module is not initialized.');
        return;
    }

    this.destroy();
};

RosterManagerBrothersListModule.prototype.isRegistered = function ()
{
	if (this.mContainer !== null)
	{
		return this.mContainer.parent().length !== 0;
	}

	return false;
};


RosterManagerBrothersListModule.prototype.show = function ()
{
	this.mContainer.removeClass('display-none').addClass('display-block');
};

RosterManagerBrothersListModule.prototype.hide = function ()
{
	this.mContainer.removeClass('display-block').addClass('display-none');
};

RosterManagerBrothersListModule.prototype.isVisible = function ()
{
	return this.mContainer.hasClass('display-block');
};

RosterManagerBrothersListModule.prototype.updateBlockedSlots = function ()
{
    var self = this;

    this.mDataSource.getPlayerRoster().mListScrollContainer.find('.is-blocked-slot').each(function (index, element)
    {
        var slot = $(element);
        slot.removeClass('is-blocked-slot');
    });

    this.mDataSource.getPlayerRoster().mListScrollContainer.find('.is-roster-slot').each(function (index, element)
    {
        var slot = $(element);

        if (slot.data('child') != null || self.mDataSource.getPlayerRoster().mBrotherCurrent >= self.mDataSource.getPlayerRoster().mBrotherMax)
        {
            slot.addClass('is-blocked-slot');
        }
    });

    this.mDataSource.getPlayerRoster().mListScrollContainer.find('.is-reserve-slot').each(function (index, element)
    {
        var slot = $(element);

        if (slot.data('child') != null)
        {
            slot.addClass('is-blocked-slot');
        }
    });
}


RosterManagerBrothersListModule.prototype.clearBrothersList = function ()
{
    for(var i=0; i != this.mDataSource.getPlayerRoster().mSlots.length; ++i)
    {
        this.mDataSource.getPlayerRoster().mSlots[i].empty();
        this.mDataSource.getPlayerRoster().mSlots[i].data('child', null);
    }

    // this.mNumActive = 0;
};

RosterManagerBrothersListModule.prototype.removeCurrentBrotherSlotSelection = function ()
{
    this.mDataSource.getPlayerRoster().mListScrollContainer.find('.is-selected').each(function (index, element)
    {
		var slot = $(element);
		slot.removeClass('is-selected');
	});
};

RosterManagerBrothersListModule.prototype.selectBrotherSlot = function (_brotherId)
{
	var slot = this.mDataSource.getPlayerRoster().mListScrollContainer.find('#slot-index_' + _brotherId + ':first');
	if (slot.length > 0)
	{
		slot.addClass('is-selected');

		//this.mDataSource.getPlayerRoster().mListScrollContainer.trigger('scroll', { element: slot });
        //this.mListContainer.scrollListToElement(slot);
	}
};


RosterManagerBrothersListModule.prototype.setBrotherSlotActive = function (_brother)
{
	if (_brother === null || !(CharacterScreenIdentifier.Entity.Id in _brother))
	{
		return;
	}

	this.removeCurrentBrotherSlotSelection();
    this.selectBrotherSlot(_brother[CharacterScreenIdentifier.Entity.Id]);
};


RosterManagerBrothersListModule.prototype.updateBrotherSlot = function (_data)
{
	var slot = this.mDataSource.getPlayerRoster().mListScrollContainer.find('#slot-index_' + _data[CharacterScreenIdentifier.Entity.Id] + ':first');
	if (slot.length === 0)
	{
		return;
	}

	// update image & name
    var character = _data[CharacterScreenIdentifier.Entity.Character.Key];
    var imageOffsetX = (CharacterScreenIdentifier.Entity.Character.ImageOffsetX in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetX] : 0);
    var imageOffsetY = (CharacterScreenIdentifier.Entity.Character.ImageOffsetY in character ? character[CharacterScreenIdentifier.Entity.Character.ImageOffsetY] : 0);

    slot.assignListBrotherImage(Path.PROCEDURAL + character[CharacterScreenIdentifier.Entity.Character.ImagePath], imageOffsetX, imageOffsetY, 0.66);
    slot.assignListBrotherName(character[CharacterScreenIdentifier.Entity.Character.Name]);
    slot.assignListBrotherDailyMoneyCost(character[CharacterScreenIdentifier.Entity.Character.DailyMoneyCost]);

    if(this.mDataSource.getInventoryMode() == CharacterScreenDatasourceIdentifier.InventoryMode.Stash)
        slot.showListBrotherMoodImage(this.IsMoodVisible, character['moodIcon']);

    slot.removeListBrotherStatusEffects();

    for (var i = 0; i != _data['injuries'].length && i < 3; ++i)
    {
        slot.assignListBrotherStatusEffect(_data['injuries'][i].imagePath, character[CharacterScreenIdentifier.Entity.Id], _data['injuries'][i].id)
    }

    if (_data['injuries'].length <= 2 && _data['stats'].hitpoints < _data['stats'].hitpointsMax)
    {
        slot.assignListBrotherDaysWounded();
    }

    if (CharacterScreenIdentifier.Entity.Character.LeveledUp in character && character[CharacterScreenIdentifier.Entity.Character.LeveledUp] === false)
    {
        slot.removeListBrotherLeveledUp();
    }
};

RosterManagerBrothersListModule.prototype.showBrotherSlotLock = function(_brotherId, _showLock)
{
	var slot = this.mDataSource.getPlayerRoster().mListScrollContainer.find('#slot-index_' + _brotherId + ':first');
	if (slot.length === 0)
	{
		return;
	}

    slot.showListBrotherLockImage(_showLock);
};

RosterManagerBrothersListModule.prototype.updateBrotherSlotLocks = function(_inventoryMode)
{
	switch(_inventoryMode)
	{
	    case CharacterScreenDatasourceIdentifier.InventoryMode.BattlePreparation:
		case CharacterScreenDatasourceIdentifier.InventoryMode.Stash:
		{
			var brothersList = this.mDataSource.getBrothersList();
			if (brothersList === null || !jQuery.isArray(brothersList))
			{
				return;
			}

			for (var i = 0; i < brothersList.length; ++i)
			{
				var brother = brothersList[i];
				if (brother !== null && CharacterScreenIdentifier.Entity.Id in brother)
				{
					this.showBrotherSlotLock(brother[CharacterScreenIdentifier.Entity.Id], false);
				}
			}

		} break;
		case CharacterScreenDatasourceIdentifier.InventoryMode.Ground:
		{
			var brothersList = this.mDataSource.getBrothersList();
			if (brothersList === null || !jQuery.isArray(brothersList))
			{
				return;
			}

			for (var i = 0; i < brothersList.length; ++i)
			{
				var brother = brothersList[i];
				this.showBrotherSlotLock(brother[CharacterScreenIdentifier.Entity.Id], !this.mDataSource.isSelectedBrother(brother));
			}
		} break;
	}
};

RosterManagerBrothersListModule.prototype.onBrothersSettingsChanged = function (_dataSource, _brothers)
{
    this.updateRosterLabel();
};

RosterManagerBrothersListModule.prototype.onBrothersListLoaded = function (_dataSource, _brothers)
{
	this.clearBrothersList();
    this.mDataSource.mRosterManager.createBrotherSlots(Owner.Player);
    this.mDataSource.mRosterManager.onBrothersListLoaded(Owner.Player);

	/*if (!allowReordering)
	{
	    this.mDataSource.getPlayerRoster().mListScrollContainer.find('.is-brother-slot').each(function (index, element)
	    {
	        var slot = $(element);

	        if (slot.data('child') == null)
	        {
	            slot.removeClass('display-block');
	            slot.addClass('display-none');
	        }
	        else
	        {
	            slot.addClass('is-blocked-slot');
	        }
	    });
	}
	else*/
	{
	    this.updateBlockedSlots();
	}

	var inventoryMode  = _dataSource.getInventoryMode();
	this.updateBrotherSlotLocks(inventoryMode);

	if (inventoryMode === CharacterScreenDatasourceIdentifier.InventoryMode.Ground)
	{
		this.setBrotherSlotActive(_dataSource.getSelectedBrother());
	}

	this.updateRosterLabel();
};

RosterManagerBrothersListModule.prototype.onBrotherUpdated = function (_dataSource, _brother)
{
	if (_brother !== null &&
		CharacterScreenIdentifier.Entity.Id in _brother &&
		CharacterScreenIdentifier.Entity.Character.Key in _brother &&
		CharacterScreenIdentifier.Entity.Character.Name in _brother[CharacterScreenIdentifier.Entity.Character.Key] &&
		CharacterScreenIdentifier.Entity.Character.ImagePath in _brother[CharacterScreenIdentifier.Entity.Character.Key])
	{
		this.updateBrotherSlot(_brother);
	}
};

RosterManagerBrothersListModule.prototype.onBrotherSelected = function (_dataSource, _brother)
{
	if (_brother !== null && CharacterScreenIdentifier.Entity.Id in _brother)
	{
		this.removeCurrentBrotherSlotSelection();
		this.selectBrotherSlot(_brother[CharacterScreenIdentifier.Entity.Id]);
	}
};

RosterManagerBrothersListModule.prototype.onInventoryModeUpdated = function (_dataSource, _mode)
{
	this.updateBrotherSlotLocks(_mode);
};
