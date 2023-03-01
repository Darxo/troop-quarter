
"use strict";

var RosterManagerRosterModule = function(_parent, _dataSource)
{
    this.mParent = _parent;
    this.mDataSource = _dataSource;

    // container
    this.mContainer = null;

    this.mDeadZoneElement = null;

    this.mPrimaryContainer = null;
    this.mSecondaryContainer = null;
};

RosterManagerRosterModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers
    this.mContainer = $('<div class="right-panel"/>');
    _parentDiv.append(this.mContainer);

    var headerContainer = $('<div class="header-module"/>');
    this.mContainer.append(headerContainer);

        var rightButtonContainer = $('<div class="buttons-container"/>');
        headerContainer.append(rightButtonContainer);

            var layout = $('<div class="l-button is-close"/>');
            rightButtonContainer.append(layout);
            layout.createImageButton(Path.GFX + Asset.BUTTON_QUIT, function ()
            {
                self.mDataSource.notifyBackendCloseButtonClicked();
            }, '', 6);

    // Secondary (Top) Container
    this.mSecondaryContainer = $('<div class="secondary-container"/>');
    this.mContainer.append(this.mSecondaryContainer);
    this.mSecondaryContainer.createListWithCustomOption({
        delta: 1.24,
        lineDelay: 0,
        lineTimer: 0,
        pageDelay: 0,
        pageTimer: 0,
        bindKeyboard: false,
        smoothScroll: false,
        resizable: false, // to hide the horizontal scroll
        horizontalBar: 'none', // to hide the horizontal scroll
    });

    // Primary (Bottom) Container
    this.mPrimaryContainer = $('<div class="primary-container"/>');
    this.mContainer.append(this.mPrimaryContainer);

    // DeadZones
    this.mDataSource.mRosterManager.setDeadZoneElement(this.mPrimaryContainer);
};

// RosterDIVs can't be created at this point because the rosters are not yet loadedFromData
RosterManagerRosterModule.prototype.createDelayedRosterDIVs = function()
{
    // Remove all previous slots for all the cases where we re-open the Roster-Screen with different rosters
    this.mPrimaryContainer.empty();
    this.mSecondaryContainer.findListScrollContainer().empty();

    var containerArray = this.mDataSource.mRosterManager.mBrotherContainer;
    for(var i = 0; i < containerArray.length; i++)
    {
        if (containerArray[i].mPrimaryDisplayContainer === true)
        {
            this.createRosterDIV(this.mPrimaryContainer, containerArray[i].mContainerID)
        }
        else
        {
            this.createRosterDIV(this.mSecondaryContainer.findListScrollContainer(), containerArray[i].mContainerID)
        }
    }
}

RosterManagerRosterModule.prototype.createRosterDIV = function (_parentDiv, _rosterID)
{
    var rosterContainer = $('<div class="roster-container"/>');
    _parentDiv.append(rosterContainer);

        var headerBar = $('<div class="header-bar"/>');
        rosterContainer.append(headerBar);

            var mNameContainer = $('<div class="name-container"/>');
            headerBar.append(mNameContainer);
                var entry = $('<div class="ui-control list-entry list-entry-small"/>');
                // entry.data('resolution', _index);
                entry.click(this, function (_event)
                {
                    var self = _event.data;
                    self.mDataSource.mRosterManager.get(_rosterID).toggleCollapse();
                });
                mNameContainer.append(entry);
                this.mDataSource.mRosterManager.get(_rosterID).attachNameLabel(entry);
/*
                var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
                mNameContainer.append(nameLabel);
                this.mDataSource.mRosterManager.get(_rosterID).attachNameLabel(nameLabel);
*/



/*
                var nameLabel = $('<div class="label title-font-big font-bold font-color-brother-name"/>');
                mNameContainer.append(nameLabel);
                this.mDataSource.mRosterManager.get(_rosterID).attachNameLabel(nameLabel);
*/
            var countContainer = $('<div class="roster-count-container"/>');
            headerBar.append(countContainer);

                var rosterSizeImage = $('<img/>');
                rosterSizeImage.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS); // ICON_DAMAGE_DEALT
                countContainer.append(rosterSizeImage);

                var reserveCountLabel = $('<div class="label text-font-small font-bold font-color-value"/>');
                countContainer.append(reserveCountLabel);

                countContainer.bindTooltip({ contentType: 'msu-generic', modId: modTQUA.ID, elementId: 'RosterModule.RosterSizeLabel' });
                this.mDataSource.mRosterManager.get(_rosterID).attachCountLabel(reserveCountLabel);

        var listContainerLayout = $('<div class="l-list-container"/>');
        rosterContainer.append(listContainerLayout);
        this.mDataSource.mRosterManager.get(_rosterID).mListContainer = listContainerLayout;


};

RosterManagerRosterModule.prototype.destroyDIV = function ()
{
    this.mDataSource.mRosterManager.destroyDIV();

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};

RosterManagerRosterModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
};

RosterManagerRosterModule.prototype.destroy = function()
{
    this.destroyDIV();
};

RosterManagerRosterModule.prototype.register = function (_parentDiv)
{
    console.log('RosterManagerRosterModule::REGISTER');

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

RosterManagerRosterModule.prototype.unregister = function ()
{
    console.log('CharacterScreenBrothersListModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Brothers Module. Reason: Module is not initialized.');
        return;
    }

    this.destroy();
};

RosterManagerRosterModule.prototype.isRegistered = function ()
{
	if (this.mContainer !== null)
	{
		return this.mContainer.parent().length !== 0;
	}

	return false;
};


RosterManagerRosterModule.prototype.show = function ()
{
	this.mContainer.removeClass('display-none').addClass('display-block');
};

RosterManagerRosterModule.prototype.hide = function ()
{
	this.mContainer.removeClass('display-block').addClass('display-none');
};

RosterManagerRosterModule.prototype.isVisible = function ()
{
	return this.mContainer.hasClass('display-block');
};

// List with custom options to be able to remove the horizontal scroll bar
$.fn.createListWithCustomOption = function(_options, _classes,_withoutFrame)
 {
    var result = $('<div class="ui-control list has-frame"/>');
    if (_withoutFrame !== undefined && _withoutFrame === true)
    {
        result.removeClass('has-frame');
    }

    if (_classes !== undefined && _classes !== null && typeof(_classes) === 'string')
    {
        result.addClass(_classes);
    }

    var scrollContainer = $('<div class="scroll-container"/>');
    result.append(scrollContainer);

    this.append(result);

    if (_options.delta === null || _options.delta === undefined)
    {
        _options.delta = 8;
    }

    // NOTE: create scrollbar (must be after the list was appended to the DOM!)
    result.aciScrollBar(_options);
    return result;
};
