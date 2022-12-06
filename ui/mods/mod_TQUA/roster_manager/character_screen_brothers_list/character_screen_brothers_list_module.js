
"use strict";

var RosterManagerBrothersListModule = function(_parent, _dataSource)
{
    this.mParent = _parent;
    this.mDataSource = _dataSource;

    // container
    this.mContainer                     = null;

    // header
    this.mHeaderContainer   = null;
    this.mCloseButton       = null;

    // secondary container
    this.mSecondaryContainer = null;

    // primary container
    this.mPrimaryContainer = null;


    this.mDataSource.getPlayerRoster().mListScrollContainer                 = null;
    this.mDataSource.mRosterManager.get(Owner.Reserve).mListScrollContainer = null;

    this.mFormationCountContainer          = null;     // could be used for shake left right

    this.mGuestsCountContainer         = null;

    this.mReserveCountContainer          = null;     // could be used for shake left right

    this.registerDatasourceListener();
};

RosterManagerBrothersListModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers
    this.mContainer = $('<div class="right-panel"/>');
    _parentDiv.append(this.mContainer);

    this.mHeaderContainer = $('<div class="header-module"/>');
    this.mContainer.append(this.mHeaderContainer);

        var rightButtonContainer = $('<div class="buttons-container"/>');
        this.mHeaderContainer.append(rightButtonContainer);

            var layout = $('<div class="l-button is-close"/>');
            rightButtonContainer.append(layout);
            this.mCloseButton = layout.createImageButton(Path.GFX + Asset.BUTTON_QUIT, function ()
            {
                self.mDataSource.notifyBackendCloseButtonClicked();
            }, '', 6);

    // Secondary (Top) Container
    this.mSecondaryContainer = $('<div class="secondary-container"/>');
    this.mContainer.append(this.mSecondaryContainer);

        var rosterContainer = $('<div class="roster-container"/>');
        this.mSecondaryContainer.append(rosterContainer);

            var headerBar = $('<div class="header-bar"/>');
            rosterContainer.append(headerBar);

                var mNameContainer = $('<div class="name-container"/>');
                headerBar.append(mNameContainer);

                    var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
                    mNameContainer.append(nameLabel);
                    this.mDataSource.mRosterManager.get(Owner.Reserve).attachNameLabel(nameLabel);

                this.mReserveCountContainer = $('<div class="roster-count-container"/>');
                headerBar.append(this.mReserveCountContainer);
                var rosterSizeImage = $('<img/>');
                rosterSizeImage.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS); // ICON_DAMAGE_DEALT
                this.mReserveCountContainer.append(rosterSizeImage);
                var reserveCountLabel = $('<div class="label text-font-small font-bold font-color-value"/>');
                this.mReserveCountContainer.append(reserveCountLabel);
                this.mReserveCountContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Stash.ActiveRoster });
                this.mDataSource.mRosterManager.get(Owner.Reserve).attachCountLabel(reserveCountLabel);

            var listContainerLayoutTwo = $('<div class="l-list-container"/>');
            rosterContainer.append(listContainerLayoutTwo);
            this.mDataSource.mRosterManager.get(Owner.Reserve).mListScrollContainer = listContainerLayoutTwo;

        var rosterContainer = $('<div class="roster-container"/>');
        this.mSecondaryContainer.append(rosterContainer);

            var headerBar = $('<div class="header-bar"/>');
            rosterContainer.append(headerBar);

                var mNameContainer = $('<div class="name-container"/>');
                headerBar.append(mNameContainer);

                    var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
                    mNameContainer.append(nameLabel);
                    this.mDataSource.mRosterManager.get(Owner.Guests).attachNameLabel(nameLabel);

                this.mGuestsCountContainer = $('<div class="roster-count-container"/>');
                headerBar.append(this.mGuestsCountContainer);
                var rosterSizeImage = $('<img/>');
                rosterSizeImage.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS); // ICON_DAMAGE_DEALT
                this.mGuestsCountContainer.append(rosterSizeImage);
                var guestsCountLabel = $('<div class="label text-font-small font-bold font-color-value"/>');
                this.mGuestsCountContainer.append(guestsCountLabel);
                this.mGuestsCountContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Stash.ActiveRoster });
                this.mDataSource.mRosterManager.get(Owner.Guests).attachCountLabel(guestsCountLabel);

            var listContainerLayoutTwo = $('<div class="l-list-container"/>');
            rosterContainer.append(listContainerLayoutTwo);
            this.mDataSource.mRosterManager.get(Owner.Guests).mListScrollContainer = listContainerLayoutTwo;



    // Primary /Bottom) Container
    this.mPrimaryContainer = $('<div class="primary-container"/>');
    this.mContainer.append(this.mPrimaryContainer);

        var rosterContainer = $('<div class="roster-container"/>');
        this.mPrimaryContainer.append(rosterContainer);

            var headerBar = $('<div class="header-bar"/>');
            rosterContainer.append(headerBar);

                var mNameContainer = $('<div class="name-container"/>');
                headerBar.append(mNameContainer);

                    var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
                    mNameContainer.append(nameLabel);
                    this.mDataSource.mRosterManager.get(Owner.Formation).attachNameLabel(nameLabel);

                this.mFormationCountContainer = $('<div class="roster-count-container"/>');
                headerBar.append(this.mFormationCountContainer);
                var rosterSizeImage = $('<img/>');
                rosterSizeImage.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS); // ICON_DAMAGE_DEALT
                this.mFormationCountContainer.append(rosterSizeImage);
                this.mFormationCountLabel = $('<div class="label text-font-small font-bold font-color-value"/>');
                this.mFormationCountContainer.append(this.mFormationCountLabel);
                this.mFormationCountContainer.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Stash.ActiveRoster });

            var listContainerLayout = $('<div class="l-list-container"/>');
            rosterContainer.append(listContainerLayout);
            this.mDataSource.mRosterManager.get(Owner.Formation).mListScrollContainer = listContainerLayout;
            this.mDataSource.mRosterManager.get(Owner.Formation).attachCountLabel(this.mFormationCountLabel);

};

RosterManagerBrothersListModule.prototype.destroyDIV = function ()
{
    this.mDataSource.mRosterManager.destroyDIV();

    this.mCloseButton.remove();
    this.mCloseButton = null;

    this.mHeaderContainer.empty();
    this.mHeaderContainer.remove();
    this.mHeaderContainer = null;

    // this.mSlots = null;      // dont forget this!

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
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

RosterManagerBrothersListModule.prototype.updateBrotherSlot = function (_data)
{
	this.mRosterManager.get(Owner.Formation).updateBrotherDIV(_data);
	this.mRosterManager.get(Owner.Reserve).updateBrotherDIV(_data);
};

/*RosterManagerBrothersListModule.prototype.showBrotherSlotLock = function(_brotherId, _showLock)
{
	var slot = this.mDataSource.getPlayerRoster().mListScrollContainer.find('#slot-index_' + _brotherId + ':first');
	if (slot.length === 0)
	{
		return;
	}

    slot.showListBrotherLockImage(_showLock);
};*/

RosterManagerBrothersListModule.prototype.updateBrotherSlotLocks = function(_inventoryMode)
{
	/*switch(_inventoryMode)
	{
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

		}
	}*/
};

RosterManagerBrothersListModule.prototype.onBrothersSettingsChanged = function (_dataSource, _brothers)
{

};

RosterManagerBrothersListModule.prototype.onBrotherSelected = function (_dataSource, _brothers)
{
    // just in case I need this later on
};

RosterManagerBrothersListModule.prototype.onBrothersListLoaded = function (_dataSource, _brothers)
{
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

RosterManagerBrothersListModule.prototype.onInventoryModeUpdated = function (_dataSource, _mode)
{
	this.updateBrotherSlotLocks(_mode);
};
