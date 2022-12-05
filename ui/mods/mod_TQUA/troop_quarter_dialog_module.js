"use strict";

// Identifier for RosterContainer aswell as the respective Data entry in loadFromData
var Owner =
{
    Quarter: 'Quarter',
    Player: 'Player',

    Formation: 'Formation',
    Reserve: 'Reserve'
};

var TroopQuarterDialogModule = function(_parent)
{
    this.mSQHandle        = null;
    this.mParent          = _parent;

    // assets labels
    this.mAssets = new WorldTownScreenAssets(_parent);

    var troopQuarter = new BrotherContainer(Owner.Quarter);
    var playerRoster = new BrotherContainer(Owner.Player);

    this.mBrotherManager = new BrotherManager();
    this.mBrotherManager.addContainer(troopQuarter);
    this.mBrotherManager.addContainer(playerRoster);

    // event listener
    this.mEventListener   = null;

    // generic containers
    this.mContainer       = null;
    this.mDialogContainer = null;

    // button bar
    this.mButtonBarContainer           = null;
    this.mPlayerBrotherButton          = null;

    this.mBrotherManager.get(Owner.Quarter).ListContainer = null;
    this.mBrotherManager.get(Owner.Quarter).ListScrollContainer = null;

    this.mBrotherManager.get(Owner.Player).ListContainer = null;
    this.mBrotherManager.get(Owner.Player).ListScrollContainer = null;

    // buttons
    this.mLeaveButton     = null;

    // generics
    this.mIsVisible       = false;
};

TroopQuarterDialogModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers (init hidden!)
    this.mContainer = $('<div class="l-stronghold-pokebro-pc-dialog-container display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);
    this.mDialogContainer = this.mContainer.createDialog('', '', '', true, 'dialog-1280-768');

    // create tabs
    var tabButtonsContainer = $('<div class="l-tab-container"/>');
    this.mDialogContainer.findDialogTabContainer().append(tabButtonsContainer);

    // create assets
    this.mAssets.createDIV(tabButtonsContainer);

    // hide all unnecessary assets
    this.mAssets.mMoneyAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mFoodAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mAmmoAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mSuppliesAsset.removeClass('display-block').addClass('display-none');
    this.mAssets.mMedicineAsset.removeClass('display-block').addClass('display-none');

    // give this the stronghold icon, i'll change this button so it will display roster num of stronghold
    this.mAssets.mBrothersAsset.changeButtonImage(Path.GFX + 'ui/icons/stronghold_icon.png');

    // create content
    var content = this.mDialogContainer.findDialogContentContainer();
    var column = $('<div class="right-column"/>');
    content.append(column);

    //-1 top row
    var row = $('<div class="top-row"/>');
    column.append(row);

    // stronghold roster
    var listContainerLayout = $('<div class="l-list-container"/>');
    row.append(listContainerLayout);
    // the normal way to create the list fails me, so i make a cusom function so i can add the option i want easily
    this.mBrotherManager.get(Owner.Quarter).ListContainer = listContainerLayout.createListWithCustomOption({
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
    this.mBrotherManager.get(Owner.Quarter).ListScrollContainer = this.mBrotherManager.get(Owner.Quarter).ListContainer.findListScrollContainer();

    //-2 mid row
    var row = $('<div class="middle-row"/>');
    column.append(row);

    // buttons bar
    this.mButtonBarContainer = $('<div class="is-right"/>');
    row.append(this.mButtonBarContainer);
    var panelLayout = $('<div class="button-panel"/>');
    this.mButtonBarContainer.append(panelLayout);

    // last button - assets brother, to display the number of player in roster, also can be pressed to move to inventory screen
    var layout = $('<div class="l-button-brother is-brothers"/>');
    var buttonlayout = $('<div class="l-assets-container"/>');
    var image = $('<img/>');
    image.attr('src', Path.GFX + Asset.ICON_ASSET_BROTHERS);
    buttonlayout.append(image);
    var text = $('<div class="label text-font-small font-bold font-bottom-shadow font-color-assets-positive-value"/>');
    buttonlayout.append(text);
    this.mPlayerBrotherButton = layout.createCustomButton(buttonlayout, function()
    {
        self.notifyBackendBrothersButtonPressed();
    }, '', 2);
    this.mPlayerBrotherButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.Assets.Brothers });
    panelLayout.append(layout);


    //-3 bottom row
    row = $('<div class="bottom-row"/>');
    column.append(row);

    // player roster
    var detailFrame = $('<div class="background-frame-container"/>');
    row.append(detailFrame);
    this.mBrotherManager.get(Owner.Player).ListScrollContainer = $('<div class="l-list-container"/>');
    detailFrame.append(this.mBrotherManager.get(Owner.Player).ListScrollContainer);

    // create footer button bar
    var footerButtonBar = $('<div class="l-button-bar"/>');
    this.mDialogContainer.findDialogFooterContainer().append(footerButtonBar);

    // create: buttons
    var layout = $('<div class="l-leave-button"/>');
    footerButtonBar.append(layout);
    this.mLeaveButton = layout.createTextButton("Leave", function() {
        self.notifyBackendLeaveButtonPressed();
    }, '', 1);

    this.mIsVisible = false;
};


TroopQuarterDialogModule.prototype.destroyDIV = function ()
{
    this.mAssets.destroyDIV();;

    this.mLeaveButton.remove();
    this.mLeaveButton = null;

    this.mButtonBarContainer.remove();
    this.mButtonBarContainer = null;

    this.mBrotherManager.get(Owner.Quarter).ListScrollContainer.empty();
    this.mBrotherManager.get(Owner.Quarter).ListScrollContainer = null;
    this.mBrotherManager.get(Owner.Quarter).ListContainer.destroyList();
    this.mBrotherManager.get(Owner.Quarter).ListContainer.remove();
    this.mBrotherManager.get(Owner.Quarter).ListContainer = null;

    this.mBrotherManager.get(Owner.Player).ListScrollContainer.empty();
    this.mBrotherManager.get(Owner.Player).ListScrollContainer = null;

    this.mDialogContainer.empty();
    this.mDialogContainer.remove();
    this.mDialogContainer = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};

TroopQuarterDialogModule.prototype.show = function (_withSlideAnimation)
{
    var self = this;

    var withAnimation = (_withSlideAnimation !== undefined && _withSlideAnimation !== null) ? _withSlideAnimation : true;
    if (withAnimation === true)
    {
        var offset = -(this.mContainer.parent().width() + this.mContainer.width());
        this.mContainer.css({ 'left': offset });
        this.mContainer.velocity("finish", true).velocity({ opacity: 1, left: '0', right: '0' }, {
            duration: Constants.SCREEN_SLIDE_IN_OUT_DELAY,
            easing: 'swing',
            begin: function () {
                $(this).removeClass('display-none').addClass('display-block');
                self.notifyBackendModuleAnimating();
            },
            complete: function () {
                self.mIsVisible = true;
                self.notifyBackendModuleShown();
            }
        });
    }
    else
    {
        this.mContainer.css({ opacity: 0 });
        this.mContainer.velocity("finish", true).velocity({ opacity: 1 }, {
            duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
            easing: 'swing',
            begin: function() {
                $(this).removeClass('display-none').addClass('display-block');
                self.notifyBackendModuleAnimating();
            },
            complete: function() {
                self.mIsVisible = true;
                self.notifyBackendModuleShown();
            }
        });
    }
};
//--------------------------------------------------------


// Load the Data
TroopQuarterDialogModule.prototype.loadFromData = function (_data)
{
    if(_data === undefined || _data === null)       return;

    if('Title' in _data && _data.Title !== null)                this.mDialogContainer.findDialogTitle().html(_data.Title);
    if('SubTitle' in _data && _data.SubTitle !== null)          this.mDialogContainer.findDialogSubTitle().html(_data.SubTitle);

    this.mBrotherManager.loadFromData(_data);

    if('Assets' in _data && _data.Assets !== null)
    {
        if ('PlayerCurrent' in _data.Assets && 'PlayerMax' in _data.Assets)
        {
            this.updateAssetValue(this.mPlayerBrotherButton, _data.Assets['PlayerCurrent'], _data.Assets['PlayerMax']);
        }

        if ('QuarterCurrent' in _data.Assets && 'QuarterMax' in _data.Assets)
        {
            this.updateAssetValue(this.mAssets.mBrothersAsset, _data.Assets['QuarterCurrent'], _data.Assets['QuarterMax']);
        }
    }
};

TroopQuarterDialogModule.prototype.updateAssetValue = function (_container, _value, _valueMax)
{
    var label = _container.find('.label:first');
    if(label.length > 0)
    {
        var labelText = '' + Helper.numberWithCommas(_value);
        if(_valueMax !== undefined && _valueMax !== null) labelText += ('/' + Helper.numberWithCommas(_valueMax));

        label.html(labelText);
    }
};

//- Call Squirrel backend function
TroopQuarterDialogModule.prototype.notifyBackendModuleShown = function ()
{
    SQ.call(this.mSQHandle, 'onModuleShown');
};

TroopQuarterDialogModule.prototype.notifyBackendModuleHidden = function ()
{
    SQ.call(this.mSQHandle, 'onModuleHidden');
};

TroopQuarterDialogModule.prototype.notifyBackendModuleAnimating = function ()
{
    SQ.call(this.mSQHandle, 'onModuleAnimating');
};

TroopQuarterDialogModule.prototype.notifyBackendLeaveButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onLeaveButtonPressed');
};

TroopQuarterDialogModule.prototype.notifyBackendBrothersButtonPressed = function ()
{
    SQ.call(this.mSQHandle, 'onBrothersButtonPressed');
};
//----------------------------------------------------------------------------------------

// Add a utility function to create a more customized list
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


// generic stuff for a module
TroopQuarterDialogModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.bindTooltips();
};
TroopQuarterDialogModule.prototype.destroy = function()
{
    this.unbindTooltips();
    this.destroyDIV();
};
TroopQuarterDialogModule.prototype.register = function (_parentDiv)
{
    console.log('TroopQuarterDialogModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register World Stronghold Pokemon PC Dialog Module. Reason: World Stronghold Pokemon PC Dialog Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};
TroopQuarterDialogModule.prototype.unregister = function ()
{
    console.log('TroopQuarterDialogModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister World Stronghold Pokemon PC Dialog Module. Reason: World Stronghold Pokemon PC Dialog Module is not initialized.');
        return;
    }

    this.destroy();
};
TroopQuarterDialogModule.prototype.isRegistered = function ()
{
    if (this.mContainer !== null)
    {
        return this.mContainer.parent().length !== 0;
    }

    return false;
};
TroopQuarterDialogModule.prototype.registerEventListener = function(_listener)
{
    this.mEventListener = _listener;

    this.mBrotherManager.registerEventListener(_listener);
};
TroopQuarterDialogModule.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};
TroopQuarterDialogModule.prototype.onConnection = function (_handle)
{
    this.mSQHandle = _handle;
    this.mBrotherManager.onConnection(this.mSQHandle);

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnConnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnConnectionCalled(this);
    }
};
TroopQuarterDialogModule.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;

    // notify listener
    if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
    {
        this.mEventListener.onModuleOnDisconnectionCalled(this);
    }

    this.mBrotherManager.onDisconnection();
};
TroopQuarterDialogModule.prototype.hide = function ()
{
    var self = this;

    var offset = -(this.mContainer.parent().width() + this.mContainer.width());
    this.mContainer.velocity("finish", true).velocity({ opacity: 0, left: offset },
    {
        duration: Constants.SCREEN_SLIDE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function ()
        {
            $(this).removeClass('is-center');
            self.notifyBackendModuleAnimating();
        },
        complete: function ()
        {
            self.mIsVisible = false;
            $(this).removeClass('display-block').addClass('display-none');
            self.notifyBackendModuleHidden();
        }
    });
};
TroopQuarterDialogModule.prototype.isVisible = function ()
{
    return this.mIsVisible;
};

TroopQuarterDialogModule.prototype.bindTooltips = function ()
{
    this.mAssets.bindTooltips();
    this.mAssets.mBrothersAsset.unbindTooltip();

    // replace with a new tooltip to tell player it's for displaying stronghold roster size
    this.mAssets.mBrothersAsset.bindTooltip({ contentType: 'ui-element', elementId: 'assets.BrothersInStronghold' });


    this.mLeaveButton.bindTooltip({ contentType: 'ui-element', elementId: TooltipIdentifier.WorldTownScreen.HireDialogModule.LeaveButton });
};


TroopQuarterDialogModule.prototype.unbindTooltips = function ()
{
    this.mAssets.unbindTooltips();

    this.mLeaveButton.unbindTooltip();
};
